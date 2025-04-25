import { supabase } from '../config/supabase';
import { GOOGLE_AI_API_KEY, API_ENDPOINT } from '../config/constants';

export const generateAssignment = async (subspaceName, subspaceDescription, subjectId) => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No user logged in');

    const prompt = `Generate 10 detailed and specific questions about the topic: ${subspaceName}
    Description of the topic: ${subspaceDescription}
    
    IMPORTANT: Make sure all questions are DIRECTLY related to the topic "${subspaceName}" - do not generate generic questions or questions about unrelated topics.
    
    Create a mix of different question types:
    - 3 multiple choice questions with challenging options that test deeper understanding
    - 3 true/false questions that focus on common misconceptions about this topic
    - 4 short-answer questions that require application of knowledge about this specific topic
    
    Format the response as a JSON object with the following structure:
    {
      "questions": [
        {
          "question": "question text that is specific to ${subspaceName}",
          "type": "multiple_choice",
          "options": ["option1", "option2", "option3", "option4"],
          "correctAnswer": "correct option",
          "explanation": "explanation of the correct answer"
        },
        {
          "question": "question text that is specific to ${subspaceName}",
          "type": "true_false",
          "correctAnswer": true,
          "explanation": "explanation of why this is true/false"
        },
        {
          "question": "question text that is specific to ${subspaceName}",
          "type": "written",
          "correctAnswer": "sample answer",
          "explanation": "explanation of what a good answer should include"
        }
      ],
      "title": "A descriptive title for this ${subspaceName} assignment",
      "description": "A brief description of what this assignment covers about ${subspaceName}"
    }`;

    const response = await fetch(`${API_ENDPOINT}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const questionText = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON from the text response
    // Need to find where the JSON starts and ends since AI might add extra text
    const jsonStart = questionText.indexOf('{');
    const jsonEnd = questionText.lastIndexOf('}') + 1;
    const jsonString = questionText.substring(jsonStart, jsonEnd);
    
    const questions = JSON.parse(jsonString);
    
    // Store the assignment in Supabase with title and description
    const { data: assignment, error } = await supabase
      .from('assignments')
      .insert({
        user_id: user.id,
        subject_id: subjectId,
        subspace_name: subspaceName,
        title: questions.title || `${subspaceName} Assignment`,
        description: questions.description || `Questions about ${subspaceName}`,
        questions: questions.questions
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return assignment;
  } catch (error) {
    console.error('Error generating assignment:', error);
    throw error;
  }
};

// Evaluate user's assignment responses
export const evaluateAssignment = async (assignmentId, responses) => {
  try {
    // Get assignment data
    const { data: assignment, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();
      
    if (error) throw error;
    
    // Get original questions
    const questions = assignment.questions;
    
    // Build prompt for AI evaluation
    let prompt = `Evaluate the following assignment responses for the topic "${assignment.subspace_name}".\n\n`;
    
    let correctCount = 0;
    responses.forEach((response, index) => {
      const question = questions[index];
      prompt += `Question ${index + 1}: ${question.question}\n`;
      
      if (question.type === 'quiz') {
        prompt += `Correct answer: ${question.correctAnswer}\n`;
        prompt += `User's answer: ${response.answer}\n`;
        prompt += `Explanation: ${question.explanation}\n\n`;
        
        if (response.answer === question.correctAnswer) {
          correctCount++;
        }
      } else { // written
        prompt += `Sample answer: ${question.correctAnswer}\n`;
        prompt += `User's answer: ${response.answer}\n\n`;
      }
    });
    
    prompt += `\nProvide a detailed evaluation report with the following:
    1. Overall performance assessment
    2. Strengths demonstrated by the user
    3. Areas for improvement
    4. For each wrong answer, explain why it's wrong and what the correct approach is
    5. Suggestions for further study
    
    Format the response in markdown for readability.`;
    
    // Call AI for evaluation
    const aiResponse = await fetch(`${API_ENDPOINT}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });
    
    if (!aiResponse.ok) {
      throw new Error(`API evaluation request failed with status ${aiResponse.status}`);
    }
    
    const aiData = await aiResponse.json();
    const evaluation = aiData.candidates[0].content.parts[0].text;
    
    // Store results in Supabase (optional)
    const { data: result, resultError } = await supabase
      .from('assignment_results')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user.id,
        assignment_id: assignmentId,
        score: correctCount,
        total_questions: questions.length,
        evaluation: evaluation,
        responses: responses
      })
      .select()
      .single();
      
    if (resultError) {
      console.error('Error saving results:', resultError);
    }
    
    return {
      score: correctCount,
      totalQuestions: questions.length,
      evaluation: evaluation,
      questions: questions,
      responses: responses
    };
  } catch (error) {
    console.error('Error evaluating assignment:', error);
    throw error;
  }
};

// Get assignments by user
export const getUserAssignments = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('No user logged in');

    // Get user's assignments with subject information
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        id, 
        subspace_name, 
        questions, 
        created_at,
        subjects:subject_id (
          id, 
          name,
          space_id,
          spaces:space_id (
            id,
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
};

// Get assignment by ID
export const getAssignmentById = async (assignmentId) => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching assignment:', error);
    throw error;
  }
};