// Simple test script to verify API key works
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent';

console.log('Testing Google AI API Key...');
console.log('API Key (first 10 chars):', API_KEY ? API_KEY.substring(0, 10) + '...' : 'not found');

async function testApiKey() {
  try {
    // Test network first
    console.log('Testing network connection...');
    const googleTest = await fetch('https://www.google.com');
    if (!googleTest.ok) {
      throw new Error('Network test failed');
    }
    console.log('Network connection successful!');
    
    // Test the actual API call
    console.log('Testing API key with Gemini API...');
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello, please respond with just the phrase "API IS WORKING" if you can read this.'
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 100,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status);
      console.error('Error details:', errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No text in response');
    console.log('\n✅ SUCCESS! Your API key is working properly!');
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Please double-check that:');
    console.error('1. Your API key is correctly formatted');
    console.error('2. The API key is enabled for the Gemini API in Google Cloud Console');
    console.error('3. Billing is set up correctly (if required)');
    console.error('4. You have the necessary permissions');
    console.error('\nFull error:', error);
  }
}

testApiKey(); 