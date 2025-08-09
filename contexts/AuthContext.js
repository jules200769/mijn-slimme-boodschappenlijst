import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, profilePhotos } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoLoginActive, setAutoLoginActive] = useState(false);
  const isInitializingRef = useRef(true);

  // Functie om user data uit te breiden met profielfoto
  const enrichUserData = async (userData) => {
    if (!userData) return userData;
    
    try {
      console.log('Enriching user data for:', userData.id);
      
      // Haal profielfoto URL op
      const { data: photoUrl } = await profilePhotos.getProfilePhotoUrl(userData.id);
      console.log('Retrieved photo URL:', photoUrl);
      
      // Haal naam uit profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userData.id)
        .single();
      
      let displayName = userData.user_metadata?.name || userData.user_metadata?.full_name || '';
      if (!profileError && profile?.full_name) {
        displayName = profile.full_name;
      }
      
      // Voeg profielfoto URL en naam toe aan user metadata
      const enrichedUser = {
        ...userData,
        user_metadata: {
          ...userData.user_metadata,
          profile_photo_url: photoUrl || userData.user_metadata?.profile_photo_url,
          name: displayName
        }
      };
      
      console.log('Enriched user data:', {
        id: enrichedUser.id,
        name: enrichedUser.user_metadata?.name,
        photoUrl: enrichedUser.user_metadata?.profile_photo_url
      });
      
      return enrichedUser;
    } catch (error) {
      console.log('Error enriching user data:', error);
      return userData;
    }
  };

  useEffect(() => {
    // Haal huidige sessie en gebruiker op bij app start
    const getCurrentSession = async () => {
      try {
        isInitializingRef.current = true;
        const { data, error } = await supabase.auth.getSession();
        const session = data?.session;
        console.log('DEBUG: Supabase session:', session);
        console.log('DEBUG: Session error:', error);
        
        if (session && session.user) {
          // Validatie: check of de gebruiker server-side nog bestaat
          try {
            const { data: currentUserData, error: getUserError } = await supabase.auth.getUser();
            if (getUserError || !currentUserData?.user) {
              console.log('DEBUG: Ongeldige of verwijderde sessie gedetecteerd. Uitloggen...');
              await supabase.auth.signOut();
              setUser(null);
              setAutoLoginActive(false);
              return;
            }
          } catch (validationError) {
            console.log('DEBUG: Fout bij valideren van sessie, uitloggen als voorzorg:', validationError);
            await supabase.auth.signOut();
            setUser(null);
            setAutoLoginActive(false);
            return;
          }

          console.log('DEBUG: Session user found:', session.user.id);
          const enrichedUser = await enrichUserData(session.user);
          setUser(enrichedUser);
          setAutoLoginActive(true);
          console.log('DEBUG: Auto-login actief, user:', enrichedUser);
        } else {
          console.log('DEBUG: Geen geldige sessie - session:', !!session, 'user:', !!session?.user);
          setUser(null);
          setAutoLoginActive(false);
        }
      } catch (error) {
        setUser(null);
        setAutoLoginActive(false);
        console.log('DEBUG: Fout bij ophalen sessie:', error);
      } finally {
        setLoading(false);
        isInitializingRef.current = false;
      }
    };

    getCurrentSession();

    // Luister naar auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isInitializingRef.current) {
        // Negeer events tijdens initiële validatie om race conditions te voorkomen
        return;
      }
      
      if (session?.user) {
        // Valideer opnieuw dat de user echt bestaat
        try {
          const { data: currentUserData, error: getUserError } = await supabase.auth.getUser();
          if (getUserError || !currentUserData?.user) {
            console.log('DEBUG: onAuthStateChange -> user ongeldig, uitloggen');
            await supabase.auth.signOut();
            setUser(null);
            setAutoLoginActive(false);
            setLoading(false);
            return;
          }
        } catch (validationError) {
          console.log('DEBUG: onAuthStateChange validatie fout, uitloggen als voorzorg:', validationError);
          await supabase.auth.signOut();
          setUser(null);
          setAutoLoginActive(false);
          setLoading(false);
          return;
        }

        const enrichedUser = await enrichUserData(session.user);
        setUser(enrichedUser);
      } else {
        setUser(null);
        setAutoLoginActive(false);
        // Alleen clearAutoLogin bij expliciete signOut, niet bij elke auth state change
        // clearAutoLogin(); // Verwijderd - automatische inlog voorkeur blijft behouden
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, name) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('DEBUG: Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      console.log('DEBUG: Sign in successful, session:', data.session);
      console.log('DEBUG: User data:', data.user);
      
      return { success: true, data };
    } catch (error) {
      console.log('DEBUG: Sign in failed:', error);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateUserContext = async () => {
    try {
      console.log('DEBUG: updateUserContext called');
      
      // Get current session instead of getCurrentUser
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session?.user) {
        console.log('DEBUG: Current user from session:', session.user);
        const enrichedUser = await enrichUserData(session.user);
        console.log('DEBUG: Enriched user:', enrichedUser);
        setUser(enrichedUser);
      } else {
        console.log('DEBUG: Error getting session:', error);
        // Fallback: try to get user from current state
        if (user) {
          const enrichedUser = await enrichUserData(user);
          setUser(enrichedUser);
        }
      }
    } catch (e) {
      console.log('Error updating user context:', e);
      // Fallback: try to get user from current state
      if (user) {
        const enrichedUser = await enrichUserData(user);
        setUser(enrichedUser);
      }
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateUserContext,
    autoLoginActive,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 