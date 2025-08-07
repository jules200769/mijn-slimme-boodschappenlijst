import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://bplulorqittthbxaqudk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbHVsb3JxaXR0dGhieGFxdWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzIzOTcsImV4cCI6MjA2ODUwODM5N30.9rRyyxhxkSRnquS66nGr5DPulf2_-PFOytmPZouoNmU'
);

// Helper functies voor authenticatie
export const auth = {
  // Registreer een nieuwe gebruiker
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Log in met email en wachtwoord
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Log uit
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Haal huidige gebruiker op
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Luister naar auth state changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Helper functies voor lijsten
export const lists = {
  // Haal alle lijsten op van een gebruiker
  getLists: async (userId) => {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Maak een nieuwe lijst aan
  createList: async (userId, listData) => {
    const { data, error } = await supabase
      .from('lists')
      .insert({
        user_id: userId,
        name: listData.name,
        items: listData.items || [],
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    return { data, error };
  },

  // Update een lijst
  updateList: async (listId, updates) => {
    const { data, error } = await supabase
      .from('lists')
      .update(updates)
      .eq('id', listId)
      .select()
      .single();
    return { data, error };
  },

  // Verwijder een lijst
  deleteList: async (listId) => {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId);
    return { error };
  },
};

// Helper functies voor profielfoto's
export const profilePhotos = {
  // Upload een profielfoto naar Supabase storage
  uploadProfilePhoto: async (userId, imageUri) => {
    try {
      // Converteer de image URI naar een blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Maak een unieke bestandsnaam
      const fileName = `profile_${userId}_${Date.now()}.jpg`;
      
      // Upload naar Supabase storage
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });
      
      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }
      
      // Haal de publieke URL op
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);
      
      console.log('Profile photo uploaded successfully:', urlData.publicUrl);
      return { data: urlData.publicUrl, error: null };
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      return { data: null, error };
    }
  },

  // Haal de profielfoto URL op van een gebruiker
  getProfilePhotoUrl: async (userId) => {
    try {
      // Probeer de profielfoto op te halen uit de user metadata
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      const photoUrl = user?.user_metadata?.profile_photo_url;
      console.log('Retrieved profile photo URL:', photoUrl);
      return { data: photoUrl, error: null };
    } catch (error) {
      console.error('Error getting profile photo URL:', error);
      return { data: null, error };
    }
  },

  // Update de profielfoto URL in de user metadata
  updateProfilePhotoUrl: async (photoUrl) => {
    try {
      console.log('Updating profile photo URL in metadata:', photoUrl);
      
      const { data, error } = await supabase.auth.updateUser({
        data: { profile_photo_url: photoUrl }
      });
      
      if (error) {
        console.error('Error updating user metadata:', error);
        throw error;
      }
      
      console.log('Profile photo URL updated successfully in metadata');
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile photo URL:', error);
      return { data: null, error };
    }
  },

  // Verwijder een profielfoto
  deleteProfilePhoto: async (userId) => {
    try {
      // Update user metadata om de foto URL te verwijderen
      const { data, error } = await supabase.auth.updateUser({
        data: { profile_photo_url: null }
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error deleting profile photo:', error);
      return { data: null, error };
    }
  },

  // Controleer of de storage bucket bestaat
  checkStorageBucket: async () => {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      
      const bucketExists = data.some(bucket => bucket.name === 'profile-photos');
      console.log('Profile photos bucket exists:', bucketExists);
      return { exists: bucketExists, error: null };
    } catch (error) {
      console.error('Error checking storage bucket:', error);
      return { exists: false, error };
    }
  }
};

// Helper functie om een unieke code te genereren
function generateCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
} 