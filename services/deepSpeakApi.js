const API_URL = process.env.EXPO_PUBLIC_DEEPSPEAK_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_DEEPSPEAK_API_KEY;

if (!API_URL || !API_KEY) {
  console.error('Missing DeepSpeak API configuration');
}

export const generateResponse = async (prompt, subject) => {
  try {
    const response = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        subject,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error calling DeepSpeak API:', error.message);
    throw error;
  }
};

export const generateQuiz = async (topic, difficulty) => {
  try {
    const response = await fetch(`${API_URL}/generate-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        topic,
        difficulty,
        num_questions: 5,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.questions;
  } catch (error) {
    console.error('Error generating quiz:', error.message);
    throw error;
  }
};

export const analyzeResponse = async (response, expectedAnswer) => {
  try {
    const result = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        response,
        expected_answer: expectedAnswer,
      }),
    });

    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }

    const data = await result.json();
    return {
      score: data.score,
      feedback: data.feedback,
      suggestions: data.suggestions,
    };
  } catch (error) {
    console.error('Error analyzing response:', error.message);
    throw error;
  }
}; 