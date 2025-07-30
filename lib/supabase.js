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

// Helper functies voor gedeelde lijsten
export const sharedLists = {
  // Test functie om te controleren of de tabel bestaat
  testConnection: async () => {
    console.log('testConnection: Testing shared_lists table access');
    try {
      const { data, error } = await supabase
        .from('shared_lists')
        .select('count')
        .limit(1);
      
      console.log('testConnection: Response', { data, error });
      return { data, error };
    } catch (error) {
      console.error('testConnection: Exception caught:', error);
      return { data: null, error };
    }
  },

  // Maak een gedeelde lijst aan
  createSharedList: async (listData, userId) => {
    console.log('createSharedList: Starting with', { listData, userId });
    
    const code = generateCode();
    console.log('createSharedList: Generated code:', code);
    
    try {
      const { data, error } = await supabase
        .from('shared_lists')
        .insert({
          code,
          name: listData.name,
          items: listData.items || [],
          created_by: userId,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();
      
      console.log('createSharedList: Response', { data, error });
      return { data, error };
    } catch (error) {
      console.error('createSharedList: Exception caught:', error);
      return { data: null, error };
    }
  },

  // Haal een gedeelde lijst op met code
  getSharedList: async (code) => {
    console.log('getSharedList: Starting with code:', code);
    
    try {
      const { data, error } = await supabase
        .from('shared_lists')
        .select('*')
        .eq('code', code.toUpperCase())
        .gt('expires_at', new Date().toISOString())
        .single();
      
      console.log('getSharedList: Response', { data, error });
      return { data, error };
    } catch (error) {
      console.error('getSharedList: Exception caught:', error);
      return { data: null, error };
    }
  },

  // Update een gedeelde lijst
  updateSharedList: async (code, updatedListData) => {
    console.log('updateSharedList: Starting with', { code, updatedListData });
    
    try {
      const { data, error } = await supabase
        .from('shared_lists')
        .update({
          items: updatedListData.items,
          name: updatedListData.name,
          updated_at: new Date().toISOString(),
        })
        .eq('code', code.toUpperCase())
        .select(); // .single() verwijderd
      
      console.log('updateSharedList: Response', { data, error });
      return { data, error };
    } catch (error) {
      console.error('updateSharedList: Exception caught:', error);
      return { data: null, error };
    }
  },

  // Join een gedeelde lijst
  joinSharedList: async (code, userId) => {
    console.log('joinSharedList: Starting with', { code, userId });
    
    try {
      // Eerst de gedeelde lijst ophalen
      const { data: sharedListData, error: listError } = await supabase
        .from('shared_lists')
        .select('*')
        .eq('code', code.toUpperCase())
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (listError) {
        console.error('joinSharedList: Error getting shared list:', listError);
        return { data: null, error: listError };
      }
      
      // Controleer of gebruiker al lid is
      const { data: existingMember, error: memberError } = await supabase
        .from('list_members')
        .select('id')
        .eq('list_id', sharedListData.id)
        .eq('user_id', userId)
        .single();
      
      if (existingMember) {
        console.log('joinSharedList: User already a member');
        return { data: existingMember, error: null };
      }
      
      // Voeg gebruiker toe als lid van de gedeelde lijst
      const { data: memberData, error: memberInsertError } = await supabase
        .from('list_members')
        .insert({
          list_id: sharedListData.id,
          user_id: userId,
        })
        .select()
        .single();
      
      if (memberInsertError) {
        console.error('joinSharedList: Error adding member:', memberInsertError);
        return { data: null, error: memberInsertError };
      }
      
      // Geen persoonlijke lijst meer aanmaken!
      return { data: memberData, error: null };
    } catch (error) {
      console.error('joinSharedList: Exception caught:', error);
      return { data: null, error };
    }
  },

  // Haal alle leden van een lijst op
  getListMembers: async (code) => {
    console.log('getListMembers: Starting with code:', code);
    
    try {
      // Gebruik de database functie die alle leden met namen ophaalt
      const { data, error } = await supabase
        .rpc('get_list_members_with_names', { list_code: code.toUpperCase() });
      
      if (error) {
        console.error('getListMembers: Error calling database function:', error);
        return { data: null, error };
      }
      
      console.log('getListMembers: Database function result:', data);
      
      // Converteer naar het verwachte formaat
      const formattedData = data.map(member => ({
        user_id: member.user_id,
        joined_at: member.joined_at,
        full_name: member.full_name || 'Onbekende gebruiker',
        email: member.email || 'geen@email.com'
      }));
      
      console.log('getListMembers: Formatted data:', formattedData);
      return { data: formattedData, error: null };
    } catch (error) {
      console.error('getListMembers: Exception caught:', error);
      return { data: null, error };
    }
  },

  // Verwijder een lid van een lijst (eigenaar kan anderen verwijderen, gebruiker kan zichzelf verwijderen)
  removeListMember: async (code, memberUserId, requestingUserId) => {
    console.log('removeListMember: Starting with', { code, memberUserId, requestingUserId });
    
    try {
      // Haal de lijst op
      const { data: listData, error: listError } = await supabase
        .from('shared_lists')
        .select('id, created_by')
        .eq('code', code.toUpperCase())
        .single();
      
      if (listError || !listData) {
        console.error('removeListMember: List not found');
        return { data: null, error: 'Lijst niet gevonden' };
      }
      
      // Controleer of de gebruiker zichzelf verwijdert of de eigenaar is
      const isOwner = listData.created_by === requestingUserId;
      const isSelfRemoval = memberUserId === requestingUserId;
      
      if (!isOwner && !isSelfRemoval) {
        console.error('removeListMember: Not authorized to remove this member');
        return { data: null, error: 'Niet geautoriseerd' };
      }
      
      console.log('removeListMember: Removing membership for list_id:', listData.id, 'user_id:', memberUserId);
      
      // Verwijder het lid
      const { data, error } = await supabase
        .from('list_members')
        .delete()
        .eq('list_id', listData.id)
        .eq('user_id', memberUserId);
      
      console.log('removeListMember: Response', { data, error });
      
      // Controleer of het lidmaatschap daadwerkelijk is verwijderd
      const { data: checkData, error: checkError } = await supabase
        .from('list_members')
        .select('id')
        .eq('list_id', listData.id)
        .eq('user_id', memberUserId);
      
      console.log('removeListMember: Check if membership still exists:', { checkData, checkError });
      
      return { data, error };
    } catch (error) {
      console.error('removeListMember: Exception caught:', error);
      return { data: null, error };
    }
  },

  // Verwijder een gedeelde lijst (alleen eigenaar)
  deleteSharedList: async (code, userId) => {
    console.log('deleteSharedList: Starting with', { code, userId });
    
    try {
      const { data, error } = await supabase
        .from('shared_lists')
        .delete()
        .eq('code', code.toUpperCase())
        .eq('created_by', userId);
      
      console.log('deleteSharedList: Response', { data, error });
      return { data, error };
    } catch (error) {
      console.error('deleteSharedList: Exception caught:', error);
      return { data: null, error };
    }
  },

  // Controleer of gebruiker lid is van een lijst
  isUserMemberOfList: async (code, userId) => {
    console.log('isUserMemberOfList: Starting with', { code, userId });
    
    try {
      const { data, error } = await supabase
        .rpc('is_user_member_of_list', { 
          user_uuid: userId, 
          list_code: code.toUpperCase() 
        });
      
      console.log('isUserMemberOfList: Response', { data, error });
      return { data, error };
    } catch (error) {
      console.error('isUserMemberOfList: Exception caught:', error);
      return { data: null, error };
    }
  },

  // Haal alle gedeelde lijsten op waar gebruiker lid van is
  getUserSharedLists: async (userId) => {
    console.log('getUserSharedLists: Starting with', { userId });
    
    try {
      // Eerst de lidmaatschappen ophalen
      const { data: memberships, error: membershipsError } = await supabase
        .from('list_members')
        .select('list_id')
        .eq('user_id', userId);
      
      if (membershipsError) {
        console.error('getUserSharedLists: Error getting memberships:', membershipsError);
        return { data: null, error: membershipsError };
      }
      
      if (!memberships || memberships.length === 0) {
        console.log('getUserSharedLists: No memberships found');
        return { data: [], error: null };
      }
      
      // Dan de gedeelde lijsten ophalen
      const listIds = memberships.map(m => m.list_id);
      const { data, error } = await supabase
        .from('shared_lists')
        .select('*')
        .in('id', listIds)
        .gt('expires_at', new Date().toISOString())
        .order('updated_at', { ascending: false });
      
      console.log('getUserSharedLists: Response', { data, error });
      return { data, error };
    } catch (error) {
      console.error('getUserSharedLists: Exception caught:', error);
      return { data: null, error };
    }
  },

  // Genereer een nieuwe code voor een bestaande gedeelde lijst
  regenerateCode: async (listId, userId) => {
    console.log('regenerateCode: Starting with', { listId, userId });
    
    const code = generateCode();
    console.log('regenerateCode: Generated new code:', code);
    
    try {
      const { data, error } = await supabase
        .from('shared_lists')
        .update({
          code,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', listId)
        .eq('created_by', userId)
        .select()
        .single();
      
      console.log('regenerateCode: Response', { data, error });
      return { data, error };
    } catch (error) {
      console.error('regenerateCode: Exception caught:', error);
      return { data: null, error };
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