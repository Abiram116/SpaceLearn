import { supabase, handleResponse } from '../api/supabase/client';

export const subjectService = {
  // Get all subjects for the current user
  getSubjects: async () => {
    const response = await supabase
      .from('subjects')
      .select('*')
      .order('created_at', { ascending: false });
    
    return handleResponse(response);
  },

  // Create a new subject
  createSubject: async (name) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const response = await supabase
      .from('subjects')
      .insert([{ 
        name,
        user_id: user.id 
      }])
      .select()
      .single();
    
    return handleResponse(response);
  },

  // Update subject name
  updateSubject: async (id, name) => {
    const response = await supabase
      .from('subjects')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    
    return supabase.handleResponse(response);
  },

  // Delete a subject
  deleteSubject: async (id) => {
    const response = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);
    
    return supabase.handleResponse(response);
  },

  // Get all subspaces for a subject
  getSubspaces: async (subjectId) => {
    const response = await supabase
      .from('subspaces')
      .select('*')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false });
    
    return supabase.handleResponse(response);
  },

  // Create a new subspace
  createSubspace: async (subjectId, name, description = '') => {
    const response = await supabase
      .from('subspaces')
      .insert([{ subject_id: subjectId, name, description }])
      .select()
      .single();
    
    return supabase.handleResponse(response);
  },

  // Update subspace
  updateSubspace: async (id, updates) => {
    const response = await supabase
      .from('subspaces')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return supabase.handleResponse(response);
  },

  // Delete a subspace
  deleteSubspace: async (id) => {
    const response = await supabase
      .from('subspaces')
      .delete()
      .eq('id', id);
    
    return supabase.handleResponse(response);
  },

  // Get recent activities
  getRecentActivities: async () => {
    try {
      const { data, error } = await supabase
        .from('learning_sessions')
        .select(`
          *,
          subject:subjects(*),
          subspace:subspaces(*)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error getting recent activities:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecentActivities:', error);
      return [];
    }
  },

  // Get last accessed subspace
  getLastAccessedSubspace: async () => {
    try {
      const { data, error } = await supabase
        .from('subspaces')
        .select(`
          *,
          subject:subjects(*)
        `)
        .order('last_accessed', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error getting last accessed subspace:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getLastAccessedSubspace:', error);
      return null;
    }
  },

  // Record learning session and update streak
  recordLearningSession: async (userId, subjectId, subspaceId, durationMinutes) => {
    const [sessionResponse, streakResponse] = await Promise.all([
      supabase
        .from('learning_sessions')
        .insert([{
          user_id: userId,
          subject_id: subjectId,
          subspace_id: subspaceId,
          duration_minutes: durationMinutes,
        }])
        .select()
        .single(),
      
      supabase
        .from('users')
        .update({ 
          last_activity_date: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single(),
    ]);

    return {
      session: handleResponse(sessionResponse),
      streak: handleResponse(streakResponse),
    };
  },

  // Update last accessed time for subspace
  updateLastAccessed: async (subspaceId) => {
    const response = await supabase
      .from('subspaces')
      .update({ last_accessed: new Date().toISOString() })
      .eq('id', subspaceId)
      .select()
      .single();
    
    return handleResponse(response);
  },
}; 