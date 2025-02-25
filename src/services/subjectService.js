import { supabase, handleResponse } from '../api/supabase/client';

export const subjectService = {
  // Get all subjects for the current user
  getSubjects: async () => {
    try {
      console.log('Starting getSubjects...');
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Authentication error in getSubjects:', authError);
        throw new Error('Authentication failed');
      }
      
      if (!user) {
        console.error('No authenticated user found in getSubjects');
        throw new Error('No authenticated user');
      }

      console.log('Fetching subjects for user:', user.id);

      // Get subjects with their total time spent
      const { data, error } = await supabase
        .from('subjects')
        .select(`
          *,
          learning_sessions(duration_minutes)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subjects:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (!data) {
        console.log('No subjects found for user:', user.id);
        return [];
      }

      // Add logging to verify data structure
      console.log('Fetched subjects data:', data);

      // Calculate total time for each subject
      const subjectsWithTime = data.map(subject => {
        const totalTime = subject.learning_sessions?.reduce(
          (sum, session) => sum + (session.duration_minutes || 0), 
          0
        ) || 0;

        console.log(`Subject: ${subject.name}, Total Time: ${totalTime}`);

        return {
          ...subject,
          total_time_spent: totalTime
        };
      });

      console.log('Found subjects with time:', {
        userId: user.id,
        count: subjectsWithTime.length,
        subjects: subjectsWithTime.map(s => ({ 
          id: s.id, 
          name: s.name,
          timeSpent: s.total_time_spent 
        }))
      });

      return subjectsWithTime;
    } catch (error) {
      console.error('Error in getSubjects:', {
        error,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  },

  // Create a new subject
  createSubject: async (name) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get the count of existing subjects to determine the next sequence number
      const { data: subjects, error: countError } = await supabase
        .from('subjects')
        .select('sequence_id')
        .eq('user_id', user.id)
        .order('sequence_id', { ascending: false })
        .limit(1);

      const nextSequenceId = subjects && subjects.length > 0 ? subjects[0].sequence_id + 1 : 1;

      const response = await supabase
        .from('subjects')
        .insert([{ 
          name,
          user_id: user.id,
          sequence_id: nextSequenceId
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
      // Get subspaces with their total time spent
      const { data, error } = await supabase
        .from('subspaces')
        .select(`
          *,
          learning_sessions(duration_minutes)
        `)
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subspaces:', error);
        throw error;
      }

      // Add logging to verify data structure
      console.log('Fetched subspaces data:', data);

      // Calculate total time for each subspace
      const subspacesWithTime = data.map(subspace => {
        const totalTime = subspace.learning_sessions?.reduce(
          (sum, session) => sum + (session.duration_minutes || 0),
          0
        ) || 0;

        console.log(`Subspace: ${subspace.name}, Total Time: ${totalTime}`);

        return {
          ...subspace,
          total_time_spent: totalTime
        };
      });

      console.log('Found subspaces with time:', {
        subjectId,
        count: subspacesWithTime.length,
        subspaces: subspacesWithTime.map(s => ({
          id: s.id,
          name: s.name,
          timeSpent: s.total_time_spent
        }))
      });
      
      return subspacesWithTime;
    } catch (error) {
      console.error('Error in getSubspaces:', error);
      throw error;
    }
  },

  // Create a new subspace
  createSubspace: async (subjectId, name, description = '') => {
    try {
      // Get the subject's sequence_id and the count of existing subspaces
      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select('sequence_id')
        .eq('id', subjectId)
        .single();

      if (subjectError) throw subjectError;

      const { data: subspaces, error: countError } = await supabase
        .from('subspaces')
        .select('sequence_id')
        .eq('subject_id', subjectId)
        .order('sequence_id', { ascending: false })
        .limit(1);

      const nextSubspaceSequence = subspaces && subspaces.length > 0 ? subspaces[0].sequence_id + 1 : 1;
      const fullSequenceId = `${subject.sequence_id}.${nextSubspaceSequence}`;

      const response = await supabase
        .from('subspaces')
        .insert([{ 
          subject_id: subjectId, 
          name, 
          description,
          sequence_id: nextSubspaceSequence,
          full_sequence_id: fullSequenceId
        }])
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
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        return null;
      }

      // First try to get the last accessed sequence from user preferences
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('last_accessed_sequence')
        .eq('user_id', user.id)
        .single();

      if (!prefError && preferences?.last_accessed_sequence) {
        console.log('Found last accessed sequence:', preferences.last_accessed_sequence);
        
        // Parse the sequence ID to get subject and subspace sequence
        const [subjectSeq, subspaceSeq] = preferences.last_accessed_sequence.split('.');
        
        // Get the subject and subspace based on sequence IDs
        const { data: subjects, error: subjectError } = await supabase
          .from('subjects')
          .select('*')
          .eq('user_id', user.id)
          .eq('sequence_id', parseInt(subjectSeq))
          .single();

        if (!subjectError && subjects) {
          const { data: subspaces, error: subspaceError } = await supabase
            .from('subspaces')
            .select(`
              *,
              learning_sessions(duration_minutes)
            `)
            .eq('subject_id', subjects.id)
            .eq('sequence_id', parseInt(subspaceSeq))
            .single();

          if (!subspaceError && subspaces) {
            const totalTimeSpent = subspaces.learning_sessions?.reduce(
              (sum, session) => sum + (session.duration_minutes || 0),
              0
            ) || 0;

            return {
              id: subspaces.id,
              name: subspaces.name,
              description: subspaces.description,
              subject: subjects,
              subject_id: subjects.id,
              total_time_spent: totalTimeSpent
            };
          }
        }
      }

      // If no last accessed sequence or it's invalid, fall back to most recent subject
      const { data: recentSubjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (subjectsError) {
        console.error('Error fetching subjects:', subjectsError);
        return null;
      }

      if (!recentSubjects || recentSubjects.length === 0) {
        console.log('No subjects found');
        return null;
      }

      const subject = recentSubjects[0];
      console.log('Falling back to most recent subject:', subject.name);

      // Try to get any subspaces for this subject
      const { data: subspaces, error: subspacesError } = await supabase
        .from('subspaces')
        .select(`
          *,
          learning_sessions(duration_minutes)
        `)
        .eq('subject_id', subject.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (subspacesError) {
        console.error('Error fetching subspaces:', subspacesError);
        return { subject, total_time_spent: 0 };
      }

      if (!subspaces || subspaces.length === 0) {
        console.log('No subspaces found for subject:', subject.name);
        return { subject, total_time_spent: 0 };
      }

      const subspace = subspaces[0];
      const totalTimeSpent = subspace.learning_sessions?.reduce(
        (sum, session) => sum + (session.duration_minutes || 0),
        0
      ) || 0;

      return {
        id: subspace.id,
        name: subspace.name,
        description: subspace.description,
        subject,
        subject_id: subject.id,
        total_time_spent: totalTimeSpent
      };
    } catch (error) {
      console.error('Error in getLastAccessedSubspace:', error);
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

  // Update last accessed subspace ID
  updateLastAccessedId: async (fullSequenceId) => {
    try {
      console.log('Starting updateLastAccessedId with sequence:', fullSequenceId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // First check if a preference record exists
      const { data: existing, error: checkError } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing preferences:', checkError);
        throw checkError;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          id: existing?.id,
          user_id: user.id,
          last_accessed_sequence: fullSequenceId,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to update last accessed sequence:', error);
        throw error;
      }

      console.log('Successfully updated last accessed sequence:', {
        userId: user.id,
        oldSequence: existing?.last_accessed_sequence,
        newSequence: fullSequenceId
      });

      return data;
    } catch (error) {
      console.error('Error in updateLastAccessedId:', {
        error,
        message: error.message,
        details: error.details
      });
      throw error;
    }
  },
}; 