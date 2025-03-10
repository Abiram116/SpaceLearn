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

      // Get subjects with their sessions (only including columns that exist in DB)
      const { data, error } = await supabase
        .from('subjects')
        .select(`
          *,
          subspaces(id, name, description),
          learning_sessions(id, duration_minutes, subspace_id, created_at)
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
        // Ensure we handle missing or null learning_sessions gracefully
        if (!subject.learning_sessions || !Array.isArray(subject.learning_sessions)) {
          console.warn(`No learning sessions data for subject: ${subject.name}`);
          return {
            ...subject,
            total_time_spent: 0
          };
        }

        // Calculate total time, ensuring we use numerical values
        const totalTime = subject.learning_sessions.reduce(
          (sum, session) => {
            // Default to at least 0 if duration is null/undefined
            // For brand new sessions, ensure we count at least some time
            let mins = 0;
            
            if (session.duration_minutes === 0) {
              // For new sessions with 0 duration, check how old they are
              if (session.created_at) {
                const createdAt = new Date(session.created_at);
                const now = new Date();
                const ageInMinutes = (now - createdAt) / (1000 * 60);
                
                // If the session is newer than 5 minutes, count at least some time
                if (ageInMinutes < 5) {
                  mins = 1; // Count at least 1 minute for very new sessions
                }
              }
            } else {
              // Normal case - use the stored duration
              mins = typeof session.duration_minutes === 'number' ? 
                session.duration_minutes : 
                parseInt(session.duration_minutes || 0);
            }
            
            return sum + mins;
          }, 
          0
        );

        console.log(`Subject: ${subject.name}, Total Time: ${totalTime} mins, Sessions: ${subject.learning_sessions.length}`);
        
        // Log detailed session data for debugging
        subject.learning_sessions.forEach((session, idx) => {
          console.log(`  Session ${idx+1}: ${session.duration_minutes} mins`);
        });

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
          timeSpent: s.total_time_spent,
          hasTime: s.total_time_spent > 0 ? 'YES' : 'NO' // For easier debugging
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
      console.log('Getting subspaces for subject:', subjectId);
      
      // Get subspaces with learning sessions data - only include columns that exist
      const { data, error } = await supabase
        .from('subspaces')
        .select(`
          *,
          learning_sessions(id, duration_minutes, created_at)
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
        // Calculate total time, ensuring we handle new sessions properly
        const totalTime = subspace.learning_sessions?.reduce(
          (sum, session) => {
            // Get duration from the session
            let duration = session.duration_minutes || 0;
            
            // If duration is 0 but session is very new (created within last 5 minutes)
            // show a small time value so it appears in the UI
            if (duration === 0 && session.created_at) {
              const sessionAge = (new Date() - new Date(session.created_at)) / (1000 * 60);
              if (sessionAge < 5) {
                console.log(`New session detected for subspace ${subspace.name}, age: ${sessionAge.toFixed(1)} minutes`);
                return sum + 1; // Show a minimal time for very new sessions
              }
            }
            
            return sum + duration;
          },
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
      // Important: Handle case where subject might not be found
      const { data: subjects, error: subjectError } = await supabase
        .from('subjects')
        .select('sequence_id')
        .eq('id', subjectId);

      if (subjectError) {
        console.error('Error fetching subject for sequence ID:', subjectError);
        throw subjectError;
      }
      
      // Check if we got any results
      if (!subjects || subjects.length === 0) {
        console.error('Subject not found for ID:', subjectId);
        throw new Error(`Subject with ID ${subjectId} not found`);
      }
      
      // Now we safely have the subject
      const subject = subjects[0];
      
      // Get next sequence number for subspace
      const { data: subspaces, error: countError } = await supabase
        .from('subspaces')
        .select('sequence_id')
        .eq('subject_id', subjectId)
        .order('sequence_id', { ascending: false })
        .limit(1);

      if (countError) {
        console.error('Error checking existing subspaces:', countError);
      }

      const nextSubspaceSequence = subspaces && subspaces.length > 0 ? subspaces[0].sequence_id + 1 : 1;
      const fullSequenceId = `${subject.sequence_id}.${nextSubspaceSequence}`;
      
      console.log('Creating subspace with sequence:', {
        subjectId,
        subjectSequence: subject.sequence_id,
        nextSubspaceSequence,
        fullSequenceId
      });

      // Insert the new subspace, using our array result handling to avoid .single() issues
      const response = await supabase
        .from('subspaces')
        .insert([{ 
          subject_id: subjectId, 
          name, 
          description,
          sequence_id: nextSubspaceSequence,
          full_sequence_id: fullSequenceId
        }])
        .select();
      
      // Handle response carefully to avoid 'no rows' errors
      const result = handleResponse(response);
      return Array.isArray(result) && result.length > 0 ? result[0] : result;
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
      
      // Get the current user and verify they're authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Authentication error in getLastAccessedSubspace:', authError);
        return null;
      }
      
      if (!user || !user.id) {
        console.error('No authenticated user found in getLastAccessedSubspace');
        return null;
      }

      console.log('Getting last accessed subspace for user:', user.id);

      // First try to get the last accessed sequence from user preferences
      // Use limit(1) and order by created_at instead of single() to prevent multiple rows error
      const { data: preferencesArray, error: prefError } = await supabase
        .from('user_preferences')
        .select('last_accessed_sequence')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      // Get the first preference if available
      const preferences = preferencesArray && preferencesArray.length > 0 ? preferencesArray[0] : null;

      if (prefError) {
        console.error('Error fetching user preferences:', prefError);
        // Continue to fallback - don't return yet
      } else if (preferences?.last_accessed_sequence) {
        console.log('Found last accessed sequence:', preferences.last_accessed_sequence);
        
        // Parse the sequence ID to get subject and subspace sequence
        const parts = preferences.last_accessed_sequence.split('.');
        
        if (parts.length === 2) {
          const [subjectSeq, subspaceSeq] = parts;
          const subjectSequenceId = parseInt(subjectSeq);
          const subspaceSequenceId = parseInt(subspaceSeq);
          
          if (!isNaN(subjectSequenceId) && !isNaN(subspaceSequenceId)) {
            // Get the subject based on sequence ID
            const { data: subject, error: subjectError } = await supabase
              .from('subjects')
              .select('*')
              .eq('user_id', user.id)
              .eq('sequence_id', subjectSequenceId)
              .single();

            if (subjectError) {
              console.error('Error fetching subject by sequence ID:', subjectError);
              // Continue to fallback
            } else if (subject && subject.id) {
              // Get the subspace based on sequence ID
              const { data: subspace, error: subspaceError } = await supabase
                .from('subspaces')
                .select(`
                  *,
                  learning_sessions(duration_minutes)
                `)
                .eq('subject_id', subject.id)
                .eq('sequence_id', subspaceSequenceId)
                .single();

              if (subspaceError) {
                console.error('Error fetching subspace by sequence ID:', subspaceError);
                // Continue with fallback
              } else if (subspace && subspace.id) {
                console.log('Successfully found last accessed subspace by sequence:', subspace.name);
                
                // Calculate total time spent
                const totalTimeSpent = subspace.learning_sessions?.reduce(
                  (sum, session) => sum + (session.duration_minutes || 0),
                  0
                ) || 0;

                return {
                  id: subspace.id,
                  name: subspace.name,
                  description: subspace.description || '',
                  subject: subject,
                  subject_id: subject.id,
                  total_time_spent: totalTimeSpent
                };
              }
            }
          } else {
            console.error('Invalid sequence format:', preferences.last_accessed_sequence);
          }
        } else {
          console.error('Invalid last_accessed_sequence format:', preferences.last_accessed_sequence);
        }
      }

      console.log('Falling back to most recent subject for user:', user.id);
      
      // If no last accessed sequence or it's invalid, fall back to most recent subject
      const { data: recentSubjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (subjectsError) {
        console.error('Error fetching recent subjects:', subjectsError);
        return null;
      }

      if (!recentSubjects || recentSubjects.length === 0) {
        console.log('No subjects found for user:', user.id);
        return null;
      }

      const subject = recentSubjects[0];
      console.log('Found most recent subject:', subject.name);

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
        console.error('Error fetching subspaces for subject:', subspacesError);
        // Return just the subject if we can't get subspaces
        return { 
          subject: subject,
          subject_id: subject.id,
          total_time_spent: 0 
        };
      }

      if (!subspaces || subspaces.length === 0) {
        console.log('No subspaces found for subject:', subject.name);
        return { 
          subject: subject,
          subject_id: subject.id,
          total_time_spent: 0 
        };
      }

      const subspace = subspaces[0];
      console.log('Found most recent subspace:', subspace.name);
      
      // Calculate total time spent
      const totalTimeSpent = subspace.learning_sessions?.reduce(
        (sum, session) => sum + (Number(session.duration_minutes) || 0),
        0
      ) || 0;

      return {
        id: subspace.id,
        name: subspace.name,
        description: subspace.description || '',
        subject: subject,
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
      // const { data: session, error: sessionError } = await supabase
      //   .from('learning_sessions')
      //   .insert({
      //     user_id: user.id,
      //     subject_id: subspace.subject_id,
      //     subspace_id: subspaceId,
      //     duration_minutes: 0.5,
      //     created_at: now,
      //     updated_at: now
      //   })
      //   .select()
      //   .single();

      // if (sessionError) throw sessionError;

      // console.log('Created new learning session:', {
      //   id: session.id,
      //   created_at: session.created_at
      // });

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
      // Only include columns that actually exist in your schema
      const { data: session, error: sessionError } = await supabase
        .from('learning_sessions')
        .insert({
          user_id: user.id,
          subject_id: subspace.subject_id,
          subspace_id: subspaceId,
          duration_minutes: 0,
          created_at: now
          // removed columns that don't exist: updated_at, start_time, is_active
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
      // Only include columns that exist in your schema
      const { data: updatedSession, error: updateError } = await supabase
        .from('learning_sessions')
        .update({
          duration_minutes: durationMinutes
          // removed columns that don't exist: updated_at, is_active, end_time
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

  // Get subspace by sequence ID
  getSubspaceBySequenceId: async (sequenceId) => {
    try {
      console.log('Getting subspace by sequence ID:', sequenceId);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        throw new Error('Authentication failed');
      }
      
      // Get the subspace without using single() to avoid errors
      const { data, error } = await supabase
        .from('subspaces')
        .select('*')
        .eq('full_sequence_id', sequenceId);

      if (error) {
        console.error('Error fetching subspace by sequence ID:', error);
        throw error;
      }
      
      // Handle case where no subspaces are found
      if (!data || data.length === 0) {
        console.log('No subspace found with sequence ID:', sequenceId);
        return null;
      }
      
      // Return the first match
      return data[0];
    } catch (error) {
      console.error('Error in getSubspaceBySequenceId:', error);
      // Return null instead of throwing to avoid crashes
      return null;
    }
  },
  
  // Get most recent learning session for a subspace
  getActiveSession: async (subspaceId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get the most recently created session instead of using is_active flag
      // which doesn't exist in the schema
      const { data, error } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('subspace_id', subspaceId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }
      
      // Return null if no sessions found
      if (!data || data.length === 0) {
        return null;
      }
      
      // Return the most recent session
      return data[0];
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