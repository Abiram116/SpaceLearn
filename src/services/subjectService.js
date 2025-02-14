import { supabase, handleResponse } from '../api/supabase/client';

export const subjectService = {
  // Get all subjects for the current user
  getSubjects: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const response = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error in getSubjects:', error);
      throw error;
    }
  },

  // Create a new subject
  createSubject: async (name) => {
    try {
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
    } catch (error) {
      console.error('Error in createSubject:', error);
      throw error;
    }
  },

  // Update subject name
  updateSubject: async (id, name) => {
    try {
      const response = await supabase
        .from('subjects')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error in updateSubject:', error);
      throw error;
    }
  },

  // Delete a subject
  deleteSubject: async (id) => {
    try {
      const response = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error in deleteSubject:', error);
      throw error;
    }
  },

  // Get all subspaces for a subject
  getSubspaces: async (subjectId) => {
    try {
      const response = await supabase
        .from('subspaces')
        .select('*')
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: false });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error in getSubspaces:', error);
      throw error;
    }
  },

  // Create a new subspace
  createSubspace: async (subjectId, name, description = '') => {
    try {
      const response = await supabase
        .from('subspaces')
        .insert([{ subject_id: subjectId, name, description }])
        .select()
        .single();
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error in createSubspace:', error);
      throw error;
    }
  },

  // Update subspace
  updateSubspace: async (id, updates) => {
    try {
      const response = await supabase
        .from('subspaces')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error in updateSubspace:', error);
      throw error;
    }
  },

  // Delete a subspace
  deleteSubspace: async (id) => {
    try {
      const response = await supabase
        .from('subspaces')
        .delete()
        .eq('id', id);
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error in deleteSubspace:', error);
      throw error;
    }
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('subspaces')
        .select(`
          *,
          subject:subjects!inner(
            *,
            user_id
          ),
          learning_sessions(
            duration_minutes,
            created_at
          )
        `)
        .eq('subject.user_id', user.id)
        .eq('learning_sessions.user_id', user.id)
        .order('last_accessed', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error getting last accessed subspace:', error);
        return null;
      }

      if (!data || !data.subject) return null;

      // Calculate total time spent
      const totalTime = data.learning_sessions?.reduce((sum, session) => 
        sum + session.duration_minutes, 0) || 0;

      return {
        ...data,
        total_time_spent: totalTime,
        last_session: data.learning_sessions?.[0]
      };
    } catch (error) {
      console.error('Error in getLastAccessedSubspace:', error);
      return null;
    }
  },

  // Update last accessed time for subspace
  updateLastAccessed: async (subspaceId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // First check if there's a recent session (within last hour)
      const { data: recentSession } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('subspace_id', subspaceId)
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentSession) {
        // Update the subspace last accessed time only
        const subspaceResponse = await supabase
          .from('subspaces')
          .update({ 
            last_accessed: new Date().toISOString()
          })
          .eq('id', subspaceId)
          .select()
          .single();

        return handleResponse(subspaceResponse);
      }

      // If no recent session, create a new one with minimal duration
      const sessionResponse = await supabase
        .from('learning_sessions')
        .insert({
          user_id: user.id,
          subspace_id: subspaceId,
          duration_minutes: 0.5
        })
        .select()
        .single();

      if (sessionResponse.error) throw sessionResponse.error;

      // Then update the subspace last accessed time
      const subspaceResponse = await supabase
        .from('subspaces')
        .update({ 
          last_accessed: new Date().toISOString()
        })
        .eq('id', subspaceId)
        .select()
        .single();

      return handleResponse(subspaceResponse);
    } catch (error) {
      console.error('Error in updateLastAccessed:', error);
      throw error;
    }
  },

  // Record learning session
  recordLearningSession: async (userId, subjectId, subspaceId, durationMinutes) => {
    try {
      const [sessionResponse, subspaceResponse] = await Promise.all([
        supabase
          .from('learning_sessions')
          .insert([{
            user_id: userId,
            subject_id: subjectId,
            subspace_id: subspaceId,
            duration_minutes: durationMinutes
          }])
          .select()
          .single(),
        
        supabase
          .from('subspaces')
          .update({ 
            last_accessed: new Date().toISOString()
          })
          .eq('id', subspaceId)
          .select()
          .single(),
      ]);

      return {
        session: handleResponse(sessionResponse),
        subspace: handleResponse(subspaceResponse),
      };
    } catch (error) {
      console.error('Error in recordLearningSession:', error);
      throw error;
    }
  },
}; 