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
    const response = await supabase
      .from('subjects')
      .insert([{ name }])
      .select()
      .single();
    
    return supabase.handleResponse(response);
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
    const response = await supabase
      .from('learning_sessions')
      .select(`
        *,
        subject:subjects(*),
        subspace:subspaces(*)
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    return supabase.handleResponse(response);
  },

  // Record a learning session
  recordLearningSession: async (userId, subjectId, subspaceId, durationMinutes) => {
    const response = await supabase
      .from('learning_sessions')
      .insert([{
        user_id: userId,
        subject_id: subjectId,
        subspace_id: subspaceId,
        duration_minutes: durationMinutes,
      }])
      .select()
      .single();
    
    return supabase.handleResponse(response);
  },

  // Update last accessed time for subspace
  updateLastAccessed: async (subspaceId) => {
    const response = await supabase
      .from('subspaces')
      .update({ last_accessed: new Date().toISOString() })
      .eq('id', subspaceId);
    
    return supabase.handleResponse(response);
  },
}; 