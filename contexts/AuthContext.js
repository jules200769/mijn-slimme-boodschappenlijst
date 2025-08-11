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
        
        // Check voor refresh token errors
        if (error && (error.message.includes('Invalid Refresh Token') || error.message.includes('Refresh Token Not Found'))) {
          console.log('DEBUG: Ongeldige refresh token gedetecteerd, zet user op null');
          setUser(null);
          setAutoLoginActive(false);
          return;
        }
        
        if (session && session.user) {
          // Validatie: check of de gebruiker server-side nog bestaat
          try {
            const { data: currentUserData, error: getUserError } = await supabase.auth.getUser();
            if (getUserError || !currentUserData?.user) {
              console.log('DEBUG: Ongeldige of verwijderde sessie gedetecteerd, zet user op null');
              setUser(null);
              setAutoLoginActive(false);
              return;
            }
          } catch (validationError) {
            console.log('DEBUG: Fout bij valideren van sessie, zet user op null:', validationError);
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
        console.log('DEBUG: Fout bij ophalen sessie:', error);
        setUser(null);
        setAutoLoginActive(false);
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
      
      console.log('DEBUG: Auth state change event:', event, 'session:', !!session);
      
      if (session?.user) {
        // Valideer opnieuw dat de user echt bestaat
        try {
          const { data: currentUserData, error: getUserError } = await supabase.auth.getUser();
          if (getUserError || !currentUserData?.user) {
            console.log('DEBUG: onAuthStateChange -> user ongeldig, zet user op null');
            setUser(null);
            setAutoLoginActive(false);
            setLoading(false);
            return;
          }
        } catch (validationError) {
          console.log('DEBUG: onAuthStateChange validatie fout, zet user op null:', validationError);
          setUser(null);
          setAutoLoginActive(false);
          setLoading(false);
          return;
        }

        const enrichedUser = await enrichUserData(session.user);
        setUser(enrichedUser);
      } else {
        console.log('DEBUG: onAuthStateChange -> geen session, zet user op null');
        setUser(null);
        setAutoLoginActive(false);
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
      console.log('DEBUG: Attempting sign out...');
      
      // Zet eerst de user state op null om de UI direct bij te werken
      setUser(null);
      setAutoLoginActive(false);
      
      // Probeer dan uit te loggen bij Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log('DEBUG: Sign out error:', error);
        // Error is OK, we zijn al uitgelogd in de UI
        return { success: true };
      }
      console.log('DEBUG: Sign out successful');
      return { success: true };
    } catch (error) {
      console.log('DEBUG: Sign out exception:', error);
      // Exception is OK, we zijn al uitgelogd in de UI
      return { success: true };
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