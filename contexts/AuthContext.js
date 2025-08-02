import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, profilePhotos } from '../lib/supabase';
import { getAutoLoginEnabled, clearAutoLogin } from '../lib/autoLogin';

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

  // Functie om user data uit te breiden met profielfoto
  const enrichUserData = async (userData) => {
    if (!userData) return userData;
    
    try {
      // Haal profielfoto URL op
      const { data: photoUrl } = await profilePhotos.getProfilePhotoUrl(userData.id);
      
      // Voeg profielfoto URL toe aan user metadata
      const enrichedUser = {
        ...userData,
        user_metadata: {
          ...userData.user_metadata,
          profile_photo_url: photoUrl
        }
      };
      
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
        const autoLogin = await getAutoLoginEnabled();
        const { data, error } = await supabase.auth.getSession();
        const session = data?.session;
        console.log('DEBUG: autoLogin:', autoLogin);
        console.log('DEBUG: Supabase session:', session);
        if (session && session.user && autoLogin) {
          const enrichedUser = await enrichUserData(session.user);
          setUser(enrichedUser);
          setAutoLoginActive(true);
          console.log('DEBUG: Auto-login actief, user:', enrichedUser);
        } else {
          setUser(null);
          setAutoLoginActive(false);
          console.log('DEBUG: Geen geldige sessie of auto-login uit');
        }
      } catch (error) {
        setUser(null);
        setAutoLoginActive(false);
        console.log('DEBUG: Fout bij ophalen sessie:', error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentSession();

    // Luister naar auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const enrichedUser = await enrichUserData(session.user);
        setUser(enrichedUser);
      } else {
        setUser(null);
        setAutoLoginActive(false);
        clearAutoLogin();
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
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
      const { user: currentUser, error } = await supabase.auth.getCurrentUser();
      if (!error && currentUser) {
        const enrichedUser = await enrichUserData(currentUser);
        setUser(enrichedUser);
      }
    } catch (e) {
      console.log('Error updating user context:', e);
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