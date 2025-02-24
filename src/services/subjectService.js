import { supabase, handleResponse } from '../api/supabase/client';

export const subjectService = {
  // Get all subjects for the current user
  getSubjects: async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Authentication error:', authError);
        throw new Error('Authentication failed');
      }
      
      if (!user) {
        console.error('No authenticated user found');
        throw new Error('No authenticated user');
      }

      console.log('Fetching subjects for user:', user.id);

      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subjects:', error);
        throw error;
      }

      if (!data) {
        console.log('No subjects found for user:', user.id);
        return [];
      }

      console.log('Found subjects for user:', {
        userId: user.id,
        count: data.length,
        subjects: data.map(s => ({ id: s.id, name: s.name }))
      });

      return data;
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
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Authentication error:', authError);
        return [];
      }

      const { data, error } = await supabase
        .from('learning_sessions')
        .select(`
          *,
          subject:subjects!inner(*),
          subspace:subspaces!inner(*)
        `)
        .eq('user_id', user.id)
        .eq('subject.user_id', user.id)
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
      console.log('=== Starting getLastAccessedSubspace ===');
      
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Authentication error:', authError);
        return null;
      }
      
      if (!user) {
        console.log('No authenticated user found');
        return null;
      }
      console.log('Current user:', { id: user.id, email: user.email });

      // First try to get the most recent subspace based on last_accessed timestamp
      console.log('Fetching most recently accessed subspace...');
      const { data: recentSubspace, error: recentError } = await supabase
        .from('subspaces')
        .select(`
          *,
          subject:subjects!inner(*)
        `)
        .eq('subject.user_id', user.id)  // Ensure subject belongs to current user
        .order('last_accessed', { ascending: false })
        .limit(1)
        .single();

      if (!recentError && recentSubspace) {
        console.log('Found recently accessed subspace:', {
          id: recentSubspace.id,
          name: recentSubspace.name,
          subjectName: recentSubspace.subject?.name,
          lastAccessed: recentSubspace.last_accessed
        });

        // Double check user ownership
        if (recentSubspace.subject?.user_id !== user.id) {
          console.log('Found subspace belongs to different user, skipping...');
          return null;
        }

        // Get all learning sessions for this subspace
        console.log('Fetching learning sessions for subspace:', recentSubspace.id);
        const { data: subspaceSessions, error: sessionsError } = await supabase
          .from('learning_sessions')
          .select('*')
          .eq('subspace_id', recentSubspace.id)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!sessionsError && subspaceSessions) {
          console.log('Found learning sessions:', {
            count: subspaceSessions.length,
            sessions: subspaceSessions.map(s => ({
              id: s.id,
              duration: s.duration_minutes,
              created: s.created_at
            }))
          });

          const totalTime = subspaceSessions.reduce((sum, session) => 
            sum + (session.duration_minutes || 0), 0);

          console.log('Calculated total time:', {
            subspaceId: recentSubspace.id,
            totalMinutes: totalTime,
            sessionCount: subspaceSessions.length
          });

          // Get the most recent session
          const lastSession = subspaceSessions[0];

          return {
            ...recentSubspace,
            total_time_spent: totalTime,
            last_session: lastSession
          };
        }
      }

      // If no recently accessed subspace found, try getting the most recent learning session
      console.log('Fetching most recent learning session...');
      const { data: sessions, error: sessionError } = await supabase
        .from('learning_sessions')
        .select(`
          *,
          subspace:subspaces!inner(
            *,
            subject:subjects!inner(*)
          )
        `)
        .eq('user_id', user.id)
        .eq('subspace.subject.user_id', user.id)  // Ensure subject belongs to current user
        .order('created_at', { ascending: false })
        .limit(1);

      if (!sessionError && sessions?.length > 0 && sessions[0].subspace) {
        const lastSession = sessions[0];
        
        // Double check user ownership
        if (lastSession.subspace?.subject?.user_id !== user.id) {
          console.log('Found session belongs to different user, skipping...');
          return null;
        }

        console.log('Found last session:', {
          sessionId: lastSession.id,
          subspaceId: lastSession.subspace.id,
          subspaceName: lastSession.subspace.name,
          duration: lastSession.duration_minutes
        });

        // Get all sessions for this subspace to calculate total time
        const { data: subspaceSessions, error: subspaceError } = await supabase
          .from('learning_sessions')
          .select('duration_minutes')
          .eq('subspace_id', lastSession.subspace.id)
          .eq('user_id', user.id);

        if (!subspaceError && subspaceSessions) {
          const totalTime = subspaceSessions.reduce((sum, session) => 
            sum + (session.duration_minutes || 0), 0);

          console.log('Calculated total time from sessions:', {
            subspaceId: lastSession.subspace.id,
            totalMinutes: totalTime,
            sessionCount: subspaceSessions.length
          });

          return {
            ...lastSession.subspace,
            total_time_spent: totalTime,
            last_session: lastSession
          };
        }
      }

      // If still no subspace found, get the most recently created one
      console.log('No recent activity found, fetching most recent subspace...');
      const { data: fallbackSubspace, error: fallbackError } = await supabase
        .from('subspaces')
        .select(`
          *,
          subject:subjects!inner(*)
        `)
        .eq('subject.user_id', user.id)  // Ensure subject belongs to current user
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!fallbackError && fallbackSubspace) {
        // Double check user ownership
        if (fallbackSubspace.subject?.user_id !== user.id) {
          console.log('Found fallback belongs to different user, skipping...');
          return null;
        }

        console.log('Using fallback subspace:', {
          id: fallbackSubspace.id,
          name: fallbackSubspace.name,
          subjectName: fallbackSubspace.subject?.name
        });

        return {
          ...fallbackSubspace,
          total_time_spent: 0,
          last_session: null
        };
      }

      console.log('No subspaces found for user');
      return null;

    } catch (error) {
      console.error('Unexpected error in getLastAccessedSubspace:', {
        error: error,
        message: error.message,
        stack: error.stack
      });
      return null;
    }
  },

  // Update last accessed time for subspace
  updateLastAccessed: async (subspaceId) => {
    try {
      console.log('Updating last accessed for subspace:', subspaceId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get the subspace first to verify it exists
      const { data: subspace, error: subspaceError } = await supabase
        .from('subspaces')
        .select('*, subject:subjects(user_id)')
        .eq('id', subspaceId)
        .single();

      if (subspaceError) throw subspaceError;
      if (!subspace) throw new Error('Subspace not found');

      console.log('Found subspace:', {
        id: subspace.id,
        name: subspace.name,
        currentLastAccessed: subspace.last_accessed
      });

      // Verify ownership through the subject
      if (subspace.subject.user_id !== user.id) {
        throw new Error('Unauthorized access to subspace');
      }

      const now = new Date().toISOString();

      // Update the subspace last accessed time
      const { data: updatedSubspace, error: updateError } = await supabase
        .from('subspaces')
        .update({ 
          last_accessed: now,
          updated_at: now
        })
        .eq('id', subspaceId)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log('Updated subspace last_accessed:', {
        id: updatedSubspace.id,
        newLastAccessed: updatedSubspace.last_accessed
      });

      // Create a new learning session
      const { data: session, error: sessionError } = await supabase
        .from('learning_sessions')
        .insert({
          user_id: user.id,
          subject_id: subspace.subject_id,
          subspace_id: subspaceId,
          duration_minutes: 0.5,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      console.log('Created new learning session:', {
        id: session.id,
        created_at: session.created_at
      });

      return updatedSubspace;
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

  // Start a learning session when entering chat
  startLearningSession: async (subspaceId) => {
    try {
      console.log('Starting learning session for subspace:', subspaceId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get the subspace first to verify it exists and get subject_id
      const { data: subspace, error: subspaceError } = await supabase
        .from('subspaces')
        .select('*, subject:subjects(user_id)')
        .eq('id', subspaceId)
        .single();

      if (subspaceError) throw subspaceError;
      if (!subspace) throw new Error('Subspace not found');

      // Verify ownership through the subject
      if (subspace.subject.user_id !== user.id) {
        throw new Error('Unauthorized access to subspace');
      }

      const now = new Date().toISOString();

      // Create a new learning session with 0 duration initially
      const { data: session, error: sessionError } = await supabase
        .from('learning_sessions')
        .insert({
          user_id: user.id,
          subject_id: subspace.subject_id,
          subspace_id: subspaceId,
          duration_minutes: 0,
          created_at: now,
          updated_at: now,
          start_time: now,
          is_active: true
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Update the subspace last accessed time
      const { error: updateError } = await supabase
        .from('subspaces')
        .update({ 
          last_accessed: now,
          updated_at: now
        })
        .eq('id', subspaceId);

      if (updateError) throw updateError;

      console.log('Started learning session:', {
        id: session.id,
        startTime: session.start_time
      });

      return session;
    } catch (error) {
      console.error('Error in startLearningSession:', error);
      throw error;
    }
  },

  // End a learning session and update duration
  endLearningSession: async (sessionId) => {
    try {
      console.log('Ending learning session:', sessionId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get the active session
      const { data: session, error: sessionError } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (sessionError || !session) {
        throw new Error('Session not found or unauthorized');
      }

      const now = new Date();
      const startTime = new Date(session.start_time);
      const durationMinutes = Math.max(0.5, (now - startTime) / (1000 * 60)); // Minimum 30 seconds

      console.log('Calculating session duration:', {
        sessionId,
        startTime: session.start_time,
        endTime: now.toISOString(),
        calculatedDuration: durationMinutes
      });

      // Update the session with the actual duration
      const { data: updatedSession, error: updateError } = await supabase
        .from('learning_sessions')
        .update({
          duration_minutes: durationMinutes,
          updated_at: now.toISOString(),
          is_active: false,
          end_time: now.toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log('Updated session duration:', {
        id: updatedSession.id,
        duration: updatedSession.duration_minutes,
        startTime: updatedSession.start_time,
        endTime: updatedSession.end_time
      });

      return updatedSession;
    } catch (error) {
      console.error('Error in endLearningSession:', error);
      throw error;
    }
  },

  // Get active learning session if exists
  getActiveSession: async (subspaceId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: session, error } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('subspace_id', subspaceId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw error;
      }

      return session;
    } catch (error) {
      console.error('Error in getActiveSession:', error);
      throw error;
    }
  },
}; 