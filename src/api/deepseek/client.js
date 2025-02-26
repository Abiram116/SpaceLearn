const API_KEY = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;
const API_URL = process.env.EXPO_PUBLIC_DEEPSEEK_API_URL;
const IS_DEV_MODE = true; // Toggle this for development/production

// if (!API_KEY || !API_URL) {
//   console.error('Missing DeepSeek API configuration. Please check your .env file.');
// }

const formatCodeBlock = (code, language) => {
  return `\`\`\`${language}
${code}
\`\`\`
[Copy]`;
};

const getTopicBasedResponse = (topic = '', prompt = '') => {
  const mainTopic = topic.toLowerCase();
  const userPrompt = prompt.toLowerCase();
  const isCodeQuery = userPrompt.includes('code') || 
                     userPrompt.includes('program') || 
                     userPrompt.includes('function') ||
                     userPrompt.includes('implementation') ||
                     userPrompt.includes('algorithm');

  // Enhanced greeting responses
  if (userPrompt.includes('hi') || 
      userPrompt.includes('hello') || 
      userPrompt.includes('hey')) {
    const greetings = [
      `Hello! 👋 I'm your AI learning assistant, ready to help you master ${topic || 'any subject'}! I can:
1. Break down complex concepts into simple steps
2. Provide detailed explanations with examples
3. Share practical code examples and solutions
4. Create interactive learning exercises
5. Offer study strategies tailored to your needs
6. Help you track your learning progress
7. Answer any questions you have

What would you like to explore today?`,

      `Hi there! 🌟 Welcome to your personalized learning journey! I'm here to help you with:
1. Understanding ${topic || 'various'} concepts deeply
2. Solving challenging problems step-by-step
3. Writing efficient and clean code
4. Developing strong problem-solving skills
5. Building practical projects
6. Preparing for assessments
7. Mastering advanced topics

What aspect would you like to focus on?`,

      `Greetings! 🎯 I'm your dedicated learning companion! Here's how I can support your studies:
1. Explain complex topics in simple terms
2. Provide hands-on coding exercises
3. Create custom practice problems
4. Share real-world applications
5. Guide you through difficult concepts
6. Help you develop better study habits
7. Track your learning progress

Where would you like to begin?`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  if (userPrompt.includes('what') && 
      (userPrompt.includes('can you do') || 
       userPrompt.includes('will you do') || 
       userPrompt.includes('do you do'))) {
    return `I'm here to be your personal learning assistant! Here's what I can do for you:

1. 📚 Explain complex topics in simple terms
2. 💻 Provide code examples and programming help
3. 🤔 Answer your questions about ${topic || 'any subject'}
4. 📝 Help you practice with examples and exercises
5. 🎯 Give you study strategies and tips
6. 🔍 Break down problems step by step
7. 🌟 Provide real-world applications and examples

Just ask me anything specific you'd like to learn about!`;
  }

  if (userPrompt.includes('help') || userPrompt.includes('assist')) {
    return `I'd be happy to help you! Here are some ways we can work together:

1. Ask specific questions about topics you're studying
2. Request explanations of difficult concepts
3. Get help with coding problems
4. Practice with example problems
5. Develop better study strategies

What specific area would you like help with?`;
  }

  // Define expanded topic-specific responses
  const topicResponses = {
    general: [
      `Let me help you understand ${prompt}:

1. Overview
   • Basic concepts
   • Common misconceptions
   • Real-world relevance

2. Key Points
   • Main ideas
   • Important factors
   • Critical considerations

3. Practical Applications
   • Everyday examples
   • Common situations
   • Personal relevance

4. Tips & Strategies
   • Best practices
   • Helpful approaches
   • Problem-solving methods

5. Further Learning
   • Related topics
   • Additional resources
   • Next steps`,

      `Here's a comprehensive explanation of ${prompt}:

1. Understanding the Basics
   • What it means
   • Why it matters
   • How it works

2. Common Scenarios
   • Everyday situations
   • Typical challenges
   • Practical solutions

3. Important Considerations
   • Key factors
   • Common pitfalls
   • Success strategies

4. Making it Work
   • Implementation steps
   • Useful techniques
   • Helpful tools

5. Going Further
   • Advanced aspects
   • Related concepts
   • Learning resources`
    ],

    conceptual: [
      `Let's explore the concept of ${prompt}:

1. Core Principles
   • Fundamental ideas
   • Key theories
   • Basic framework

2. Understanding Context
   • Historical background
   • Current perspectives
   • Future implications

3. Critical Analysis
   • Main arguments
   • Different viewpoints
   • Key debates

4. Practical Significance
   • Real-world impact
   • Applications
   • Benefits and challenges

5. Deeper Insights
   • Advanced concepts
   • Interconnections
   • Emerging trends`,

      `Here's a deep dive into ${prompt}:

1. Theoretical Framework
   • Basic principles
   • Core concepts
   • Underlying theories

2. Analysis & Interpretation
   • Different approaches
   • Various perspectives
   • Critical thinking

3. Practical Context
   • Real-world examples
   • Case studies
   • Applied scenarios

4. Implications & Impact
   • Social aspects
   • Cultural factors
   • Future directions

5. Advanced Understanding
   • Complex relationships
   • Emerging research
   • New developments`
    ],

    everyday: [
      `Let me explain ${prompt} in practical terms:

1. Daily Life Impact
   • Common situations
   • Regular encounters
   • Practical effects

2. Understanding the Basics
   • Simple explanations
   • Easy examples
   • Clear illustrations

3. Helpful Tips
   • Practical advice
   • Useful strategies
   • Quick solutions

4. Common Challenges
   • Typical problems
   • Simple fixes
   • Prevention methods

5. Making it Better
   • Improvement ideas
   • Easy changes
   • Helpful habits`,

      `Here's how to understand ${prompt} in everyday life:

1. Practical Overview
   • What you need to know
   • Why it matters
   • How it affects you

2. Daily Applications
   • Regular uses
   • Common situations
   • Practical examples

3. Simple Solutions
   • Easy approaches
   • Quick fixes
   • Helpful methods

4. Better Results
   • Improvement tips
   • Success strategies
   • Useful habits

5. Next Steps
   • Further learning
   • Additional resources
   • Advanced topics`
    ],

    math: [
      `Let's explore ${prompt} through these key mathematical concepts:
1. Core Definitions and Principles
   • Fundamental theorems
   • Key properties and rules
   • Important relationships

2. Problem-Solving Approach
   • Step-by-step methodology
   • Common patterns to recognize
   • Verification techniques

3. Practical Applications
   • Real-world examples
   • Industry use cases
   • Interdisciplinary connections

4. Common Challenges
   • Misconceptions to avoid
   • Typical error patterns
   • Solution strategies

5. Advanced Concepts
   • Extensions and generalizations
   • Related topics
   • Further exploration paths`,

      `Here's a comprehensive breakdown of ${prompt}:
1. Foundation
   • Basic definitions
   • Essential properties
   • Core concepts

2. Methodology
   • Systematic approach
   • Problem-solving techniques
   • Proof strategies

3. Applications
   • Practical examples
   • Real-world scenarios
   • Cross-domain applications

4. Common Pitfalls
   • Frequent mistakes
   • Understanding gaps
   • Solution strategies

5. Advanced Topics
   • Complex scenarios
   • Special cases
   • Research directions`,
    ],
    programming: {
      javascript: [
        `Here's a modern implementation of ${prompt} using JavaScript:
${formatCodeBlock(`// Modern JavaScript solution with error handling and TypeScript-like documentation
/**
 * @param {Object} params - The input parameters
 * @param {string} params.input - The input string to process
 * @param {number} params.maxIterations - Maximum number of iterations
 * @returns {Promise<Object>} - The processed result
 */
const processData = async ({ input, maxIterations = 10 }) => {
  try {
    // Input validation
    if (!input) throw new Error('Input is required');
    
    // Initialize variables
    let result = [];
    let processedCount = 0;
    
    // Main processing loop
    while (processedCount < maxIterations) {
      // Process the data
      const processed = await someAsyncOperation(input);
      result.push(processed);
      processedCount++;
      
      // Check for completion condition
      if (isProcessingComplete(processed)) break;
    }
    
    return {
      success: true,
      data: result,
      stats: {
        iterationsUsed: processedCount,
        timeSpent: performance.now()
      }
    };
  } catch (error) {
    console.error('Processing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}`, 'javascript')}`,

        `Let's implement ${prompt} with modern JavaScript best practices:
${formatCodeBlock(`// Comprehensive JavaScript implementation with modern features
class DataProcessor {
  #privateData;
  
  constructor(config) {
    this.#privateData = new Map();
    this.config = {
      maxRetries: 3,
      timeout: 5000,
      ...config
    };
  }
  
  async process(data) {
    try {
      // Data validation
      this.#validateInput(data);
      
      // Process in batches
      const batches = this.#createBatches(data);
      const results = await Promise.all(
        batches.map(batch => this.#processBatch(batch))
      );
      
      return {
        success: true,
        data: this.#mergeBatchResults(results),
        metadata: {
          processedAt: new Date().toISOString(),
          batchCount: batches.length
        }
      };
    } catch (error) {
      console.error('Processing failed:', error);
      throw new ProcessingError(error.message);
    }
  }
  
  #validateInput(data) {
    // Implementation
  }
  
  #createBatches(data) {
    // Implementation
  }
  
  #processBatch(batch) {
    // Implementation
  }
  
  #mergeBatchResults(results) {
    // Implementation
  }
}`, 'javascript')}`,
      ],
      python: [
        `Here's an efficient Python solution for ${prompt}:
${formatCodeBlock(`# Comprehensive Python implementation with type hints and documentation
from typing import List, Dict, Optional
from dataclasses import dataclass
import logging
import asyncio

@dataclass
class ProcessingConfig:
    max_retries: int = 3
    batch_size: int = 100
    timeout: float = 5.0

class DataProcessor:
    """
    A class to handle data processing with advanced features and error handling.
    """
    
    def __init__(self, config: Optional[ProcessingConfig] = None):
        self.config = config or ProcessingConfig()
        self.logger = logging.getLogger(__name__)
        
    async def process_data(self, data: List[Dict]) -> Dict:
        """
        Process the input data with advanced error handling and logging.
        
        Args:
            data: List of dictionaries containing input data
            
        Returns:
            Dict containing processing results and metadata
        """
        try:
            // Validate input
            self._validate_input(data)
            
            // Process in batches
            batches = self._create_batches(data)
            results = await asyncio.gather(
                *[self._process_batch(batch) for batch in batches]
            )
            
            // Aggregate results
            final_result = self._aggregate_results(results)
            
            return {
                "success": True,
                "data": final_result,
                "metadata": {
                    "processed_items": len(data),
                    "batch_count": len(batches)
                }
            }
            
        except Exception as e:
            self.logger.error(f"Processing failed: {str(e)}")
            raise ProcessingError(f"Failed to process data: {str(e)}")
            
    def _validate_input(self, data: List[Dict]) -> None:
        """Validate input data structure and contents."""
        pass
        
    def _create_batches(self, data: List[Dict]) -> List[List[Dict]]:
        """Split input data into processing batches."""
        pass
        
    async def _process_batch(self, batch: List[Dict]) -> List[Dict]:
        """Process a single batch of data."""
        pass
        
    def _aggregate_results(self, results: List[List[Dict]]) -> List[Dict]:
        """Combine results from all batches."""
        pass`, 'python')}`,
      ],
      rust: [
        `Here's a robust Rust implementation for ${prompt}:
${formatCodeBlock(`use std::collections::HashMap;
use tokio;
use serde::{Deserialize, Serialize};
use anyhow::{Result, Context};

#[derive(Debug, Serialize, Deserialize)]
struct ProcessingConfig {
    max_retries: u32,
    batch_size: usize,
    timeout_secs: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct ProcessingResult {
    success: bool,
    data: Vec<ProcessedItem>,
    metadata: ProcessingMetadata,
}

impl ProcessingConfig {
    fn new(max_retries: u32, batch_size: usize, timeout_secs: u64) -> Self {
        Self {
            max_retries,
            batch_size,
            timeout_secs,
        }
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    let config = ProcessingConfig::new(3, 100, 5);
    let processor = DataProcessor::new(config);
    
    let result = processor.process_data(input_data).await
        .context("Failed to process data")?;
        
    Ok(())
}`, 'rust')}`,
      ]
    },
    computerScience: [
      `Let's explore ${prompt} through key computer science concepts:
1. Theoretical Foundation
   • Mathematical basis
   • Algorithmic principles
   • Complexity analysis

2. Implementation Strategies
   • Data structures
   • Algorithm design
   • Optimization techniques

3. Best Practices
   • Code organization
   • Performance considerations
   • Testing approaches

4. Real-world Applications
   • Industry examples
   • System design
   • Scalability concerns

5. Advanced Topics
   • Research directions
   • Current developments
   • Future trends`,
    ],
    physics: [
      `Let's break down ${prompt} in physics:
1. Fundamental Principles
   • Core concepts
   • Physical laws
   • Mathematical formulation

2. Applications
   • Real-world examples
   • Experimental setups
   • Practical implications

3. Problem-solving Approach
   • Mathematical tools
   • Common techniques
   • Analysis methods

4. Advanced Concepts
   • Theoretical extensions
   • Current research
   • Future directions`,
    ],
  };

  // Enhanced follow-up questions with more variety
  const followUps = [
    "\n\nWould you like me to provide more specific examples or explain any concept in greater detail?",
    "\n\nShall we explore the practical applications of these concepts through some hands-on exercises?",
    "\n\nWould you like to see how this knowledge applies to real-world scenarios?",
    "\n\nShall we dive deeper into any particular aspect that interests you?",
    "\n\nWould you like to test your understanding with some practice problems?",
    "\n\nIs there a specific part you'd like me to elaborate on?",
    "\n\nShall we explore some advanced topics related to this subject?",
    "\n\nWould you like to see some everyday examples of this concept?",
    "\n\nShall we discuss how this relates to your daily life?",
    "\n\nWould you like to explore the practical implications of this topic?",
    "\n\nShall we look at some common misconceptions about this subject?",
    "\n\nWould you like some tips on how to apply this knowledge effectively?"
  ];

  // Get responses based on query type
  let responses;
  if (isCodeQuery) {
    responses = [
      ...topicResponses.programming.javascript,
      ...topicResponses.programming.python,
      ...topicResponses.programming.rust,
    ];
  } else if (userPrompt.includes('what is') || 
             userPrompt.includes('how does') || 
             userPrompt.includes('why do') || 
             userPrompt.includes('explain')) {
    responses = [...topicResponses.conceptual];
  } else if (userPrompt.includes('daily') || 
             userPrompt.includes('life') || 
             userPrompt.includes('everyday') || 
             userPrompt.includes('common')) {
    responses = [...topicResponses.everyday];
  } else if (mainTopic in topicResponses) {
    responses = topicResponses[mainTopic];
  } else {
    responses = [...topicResponses.general];
  }

  return responses[Math.floor(Math.random() * responses.length)] + 
         followUps[Math.floor(Math.random() * followUps.length)];
};

const simulateResponse = (prompt, context = '') => {
  // Simulate API delay (random between 1-2 seconds for more realism)
  return new Promise((resolve) => {
    const delay = Math.random() * 1000 + 1000; // 1-2 seconds
    setTimeout(() => {
      // Extract topic from context if available
      const contextMatch = context.match(/learning session about ([^.]+)/i);
      const topic = contextMatch ? contextMatch[1].trim() : '';
      
      resolve(getTopicBasedResponse(topic, prompt));
    }, delay);
  });
};

export const generateResponse = async (prompt, context = '') => {
  try {
    if (IS_DEV_MODE) {
      return await simulateResponse(prompt, context);
    }

    if (!API_KEY || !API_URL) {
      throw new Error('DeepSeek API configuration is missing');
    }

    const response = await fetch(`${API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI tutor that assists students in learning. Provide clear, concise, and accurate responses.'
          },
          {
            role: 'user',
            content: context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate response');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    if (IS_DEV_MODE) {
      return await simulateResponse(prompt, context);
    }
    throw error;
  }
};

export const generateQuiz = async (topic, difficulty = 'medium') => {
  try {
    if (IS_DEV_MODE) {
      return [
        {
          question: `Sample question about ${topic}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct_answer: 0
        },
        {
          question: `Another question about ${topic}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct_answer: 1
        }
      ];
    }

    const prompt = `Create a quiz about ${topic}. Difficulty level: ${difficulty}. Format the response as a JSON array of objects, each with 'question', 'options' (array of 4 choices), and 'correct_answer' (index of correct option).`;
    
    const response = await generateResponse(prompt);
    
    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Error parsing quiz response:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};

export const analyzeResponse = async (userResponse, expectedAnswer) => {
  try {
    if (IS_DEV_MODE) {
      return {
        score: 75,
        feedback: "Good attempt! Here's some simulated feedback.",
        suggestions: ['Sample suggestion 1', 'Sample suggestion 2']
      };
    }

    const prompt = `Analyze this student response:\n\nStudent answer: "${userResponse}"\nExpected answer: "${expectedAnswer}"\n\nProvide feedback in JSON format with 'score' (0-100), 'feedback' (string), and 'suggestions' (array of strings).`;
    
    const response = await generateResponse(prompt);
    
    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Error parsing analysis response:', parseError);
      return {
        score: 0,
        feedback: 'Error analyzing response',
        suggestions: ['Please try again'],
      };
    }
  } catch (error) {
    console.error('Error analyzing response:', error);
    throw error;
  }
}; 