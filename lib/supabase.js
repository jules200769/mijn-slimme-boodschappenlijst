import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  'https://bplulorqittthbxaqudk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbHVsb3JxaXR0dGhieGFxdWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MzIzOTcsImV4cCI6MjA2ODUwODM5N30.9rRyyxhxkSRnquS66nGr5DPulf2_-PFOytmPZouoNmU',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
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

      // Als user niet bestaat (bijv. account verwijderd), geef netjes null terug
      if (!user) {
        console.log('getProfilePhotoUrl: geen user (mogelijk verwijderd).');
        return { data: null, error: null };
      }
      
      const photoUrl = user?.user_metadata?.profile_photo_url;
      console.log('Retrieved profile photo URL:', photoUrl);
      return { data: photoUrl, error: null };
    } catch (error) {
      // Speciale afhandeling voor: User from sub claim in JWT does not exist
      const msg = String(error?.message || error);
      if (msg.includes('sub claim in JWT does not exist')) {
        console.log('getProfilePhotoUrl: user bestaat niet meer. Sessie wordt opgeschoond.');
        try { await supabase.auth.signOut(); } catch {}
        return { data: null, error: null };
      }
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

// Helper functies voor gedeelde lijsten
export const sharedLists = {
  // Maak een gedeelde lijst aan met een 6-cijferige code en 30 dagen geldigheid
  createSharedList: async (userId, list) => {
    try {
      const code = generateCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Probeer uitgebreid schema (naam + items kolommen)
      let insertResult = await supabase
        .from('shared_lists')
        .insert({
          code,
          name: list.name || list.naam || 'Lijst',
          items: list.items || [],
          created_by: userId,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (insertResult.error) {
        // Fallback naar simpel schema met list_data jsonb
        insertResult = await supabase
          .from('shared_lists')
          .insert({
            code,
            list_data: {
              name: list.name || list.naam || 'Lijst',
              items: list.items || [],
            },
            created_by: userId,
            expires_at: expiresAt.toISOString(),
          })
          .select()
          .single();
      }

      return { data: { code: insertResult.data?.code || code }, error: insertResult.error || null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Werk items bij voor gedeelde lijst
  updateSharedList: async (code, updates) => {
    try {
      // Probeer uitgebreid schema (items kolom)
      let updateResult = await supabase
        .from('shared_lists')
        .update({ items: updates.items })
        .eq('code', code)
        .select()
        .single();

      if (updateResult.error) {
        // Fallback: werk list_data jsonb bij
        // Haal bestaande op
        const existing = await supabase
          .from('shared_lists')
          .select('list_data')
          .eq('code', code)
          .single();
        const listData = existing.data?.list_data || {};
        listData.items = updates.items;
        updateResult = await supabase
          .from('shared_lists')
          .update({ list_data: listData })
          .eq('code', code)
          .select()
          .single();
      }

      return { data: updateResult.data, error: updateResult.error || null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Haal gedeelde lijst op aan de hand van code
  getSharedListByCode: async (code) => {
    try {
      // Probeer uitgebreid schema (name + items)
      let sel = await supabase
        .from('shared_lists')
        .select('name, items')
        .eq('code', code)
        .single();
      if (!sel.error && sel.data) {
        return { data: { name: sel.data.name, items: sel.data.items || [] }, error: null };
      }

      // Fallback voor simpel schema met list_data
      sel = await supabase
        .from('shared_lists')
        .select('list_data')
        .eq('code', code)
        .single();
      if (!sel.error && sel.data?.list_data) {
        const ld = sel.data.list_data;
        return { data: { name: ld.name || 'Gedeelde lijst', items: ld.items || [] }, error: null };
      }
      return { data: null, error: sel.error || new Error('Shared list not found') };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Leden ophalen (fallback naar lege lijst als schema niet aanwezig)
  getListMembers: async (code) => {
    try {
      // Probeer functie uit uitgebreid schema
      const fn = await supabase.rpc('get_list_members_with_names', { list_code: code });
      if (!fn.error) return { data: fn.data || [], error: null };

      // Fallback: haal shared_list id op en query list_members (zonder namen)
      const shared = await supabase.from('shared_lists').select('id').eq('code', code).single();
      if (shared.error || !shared.data) return { data: [], error: null };
      const members = await supabase.from('list_members').select('user_id,joined_at').eq('list_id', shared.data.id);
      return { data: members.data || [], error: members.error || null };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Lid verwijderen (zichzelf of door eigenaar)
  removeListMember: async (code, userIdToRemove, actingUserId) => {
    try {
      const shared = await supabase.from('shared_lists').select('id,created_by').eq('code', code).single();
      if (shared.error || !shared.data) return { error: shared.error || new Error('Shared list not found') };
      const listId = shared.data.id;

      const del = await supabase
        .from('list_members')
        .delete()
        .match({ list_id: listId, user_id: userIdToRemove });
      return { error: del.error || null };
    } catch (error) {
      return { error };
    }
  },

  // Gedeelde lijst verwijderen (alleen eigenaar)
  deleteSharedList: async (code, ownerId) => {
    try {
      const del = await supabase
        .from('shared_lists')
        .delete()
        .match({ code, created_by: ownerId });
      return { error: del.error || null };
    } catch (error) {
      return { error };
    }
  },
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