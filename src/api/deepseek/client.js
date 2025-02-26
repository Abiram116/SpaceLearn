const API_KEY = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;
const API_URL = process.env.EXPO_PUBLIC_DEEPSEEK_API_URL;
const IS_DEV_MODE = true; // Toggle this for development/production

// if (!API_KEY || !API_URL) {
//   console.error('Missing DeepSeek API configuration. Please check your .env file.');
// }

// Add more detailed topic detection
const detectTopicSpecialization = (topic = '', prompt = '') => {
  const lowercasePrompt = prompt.toLowerCase();
  const lowercaseTopic = topic.toLowerCase();
  
  // Detect subtopics for programming/computer science
  if (lowercaseTopic.includes('program') || 
      lowercaseTopic.includes('coding') || 
      lowercaseTopic.includes('software') ||
      lowercaseTopic.includes('javascript') ||
      lowercaseTopic.includes('python') ||
      lowercaseTopic.includes('java') ||
      lowercaseTopic.includes('development')) {
    if (lowercasePrompt.includes('javascript') || lowercasePrompt.includes('js')) 
      return 'javascript';
    if (lowercasePrompt.includes('python') || lowercasePrompt.includes('py')) 
      return 'python';
    if (lowercasePrompt.includes('java')) 
      return 'java';
    if (lowercasePrompt.includes('rust')) 
      return 'rust';
    if (lowercasePrompt.includes('algorithm') || lowercasePrompt.includes('data structure')) 
      return 'algorithms';
    if (lowercasePrompt.includes('web') || lowercasePrompt.includes('frontend') || lowercasePrompt.includes('html') || lowercasePrompt.includes('css')) 
      return 'webdev';
    if (lowercasePrompt.includes('database') || lowercasePrompt.includes('sql')) 
      return 'database';
    return 'programming';
  }
  
  // Detect subtopics for math
  if (lowercaseTopic.includes('math') || 
      lowercaseTopic.includes('calculus') || 
      lowercaseTopic.includes('algebra') ||
      lowercaseTopic.includes('geometry')) {
    if (lowercasePrompt.includes('calculus') || lowercasePrompt.includes('derivative') || lowercasePrompt.includes('integral')) 
      return 'calculus';
    if (lowercasePrompt.includes('algebra') || lowercasePrompt.includes('equation')) 
      return 'algebra';
    if (lowercasePrompt.includes('geometry') || lowercasePrompt.includes('shape') || lowercasePrompt.includes('triangle')) 
      return 'geometry';
    if (lowercasePrompt.includes('statistics') || lowercasePrompt.includes('probability') || lowercasePrompt.includes('data')) 
      return 'statistics';
    return 'math';
  }
  
  // Detect subtopics for physics
  if (lowercaseTopic.includes('physics') || 
      lowercaseTopic.includes('mechanics') || 
      lowercaseTopic.includes('relativity')) {
    if (lowercasePrompt.includes('mechanics') || lowercasePrompt.includes('motion') || lowercasePrompt.includes('force')) 
      return 'mechanics';
    if (lowercasePrompt.includes('electricity') || lowercasePrompt.includes('magnetic') || lowercasePrompt.includes('electro')) 
      return 'electromagnetism';
    if (lowercasePrompt.includes('quantum') || lowercasePrompt.includes('particle')) 
      return 'quantum';
    if (lowercasePrompt.includes('relativity') || lowercasePrompt.includes('einstein')) 
      return 'relativity';
    return 'physics';
  }
  
  // General knowledge areas
  if (lowercasePrompt.includes('history')) return 'history';
  if (lowercasePrompt.includes('biology') || lowercasePrompt.includes('life') || lowercasePrompt.includes('organism')) return 'biology';
  if (lowercasePrompt.includes('chemistry') || lowercasePrompt.includes('molecule') || lowercasePrompt.includes('element')) return 'chemistry';
  if (lowercasePrompt.includes('economics') || lowercasePrompt.includes('finance')) return 'economics';
  
  return '';
};

const formatCodeBlock = (code, language) => {
  return `\`\`\`${language}
${code}
\`\`\`
[Copy]`;
};

const getTopicBasedResponse = (topic = '', prompt = '') => {
  const mainTopic = topic.toLowerCase();
  const userPrompt = prompt.toLowerCase();
  const specializedTopic = detectTopicSpecialization(topic, prompt);
  
  const isCodeQuery = userPrompt.includes('code') || 
                     userPrompt.includes('program') || 
                     userPrompt.includes('function') ||
                     userPrompt.includes('implementation') ||
                     userPrompt.includes('algorithm');

  // Enhanced query detection
  const isDefinitionQuery = userPrompt.includes('what is') || 
                           userPrompt.includes('define') || 
                           userPrompt.includes('meaning of') ||
                           userPrompt.includes('definition');
                           
  const isHowToQuery = userPrompt.includes('how to') || 
                      userPrompt.includes('how do i') || 
                      userPrompt.includes('steps to');
                      
  const isComparisonQuery = userPrompt.includes('difference between') || 
                           userPrompt.includes('compare') || 
                           userPrompt.includes('versus') ||
                           userPrompt.includes('vs');
                           
  const isProblemSolvingQuery = userPrompt.includes('solve') || 
                               userPrompt.includes('solution') || 
                               userPrompt.includes('problem');
                               
  const isExampleQuery = userPrompt.includes('example') || 
                         userPrompt.includes('instance') || 
                         userPrompt.includes('show me');
                         
  const isResourceQuery = userPrompt.includes('resources') || 
                         userPrompt.includes('learn more') || 
                         userPrompt.includes('materials') ||
                         userPrompt.includes('where can i learn');
                         
  const isHistoricalQuery = userPrompt.includes('history') || 
                           userPrompt.includes('origin') || 
                           userPrompt.includes('background') ||
                           userPrompt.includes('development');

  // Enhanced conversational patterns detection
  const isOpinionQuery = userPrompt.includes('do you think') || 
                         userPrompt.includes('your opinion') || 
                         userPrompt.includes('what do you feel');
                         
  const isPersonalQuery = userPrompt.includes('your favorite') || 
                          userPrompt.includes('do you like') || 
                          userPrompt.includes('do you enjoy');
                          
  const isExplanationRequest = userPrompt.includes('explain why') || 
                              userPrompt.includes('tell me why') || 
                              userPrompt.includes('reason for');
                              
  const isProgressQuery = userPrompt.includes('how am i doing') || 
                         userPrompt.includes('my progress') || 
                         userPrompt.includes('how well am i');
                         
  const isRecommendationQuery = userPrompt.includes('recommend') || 
                               userPrompt.includes('suggest') || 
                               userPrompt.includes('what should i');
                               
  const isFutureQuery = userPrompt.includes('future of') || 
                        userPrompt.includes('what will happen') || 
                        userPrompt.includes('trends in');
                        
  const isChallengeRequest = userPrompt.includes('challenge') || 
                            userPrompt.includes('quiz') || 
                            userPrompt.includes('test me');
  
  const isMotivationQuery = userPrompt.includes('motivate me') || 
                           userPrompt.includes('inspiration') || 
                           userPrompt.includes('encourage');
                           
  const isAnalogyRequest = userPrompt.includes('analogy') || 
                          userPrompt.includes('like what') || 
                          userPrompt.includes('similar to');
                          
  const isCorrectionRequest = userPrompt.includes('is that right') || 
                             userPrompt.includes('did i get that') || 
                             userPrompt.includes('check my');

  // Enhanced greeting responses
  if (userPrompt.includes('hi') || 
      userPrompt.includes('hello') || 
      userPrompt.includes('hey')) {
    const greetings = [
      `Hello! 👋 I'm your AI learning assistant, ready to help you master ${topic || 'any subject'}! I can:
1. 📚 Break down complex concepts into simple steps
2. 🧠 Provide detailed explanations with examples
3. 💻 Share practical code examples and solutions
4. ✍️ Create interactive learning exercises
5. 📝 Offer study strategies tailored to your needs
6. 📈 Help you track your learning progress
7. ❓ Answer any questions you have

What would you like to explore today? 🚀`,

      `Hi there! 🌟 Welcome to your personalized learning journey! I'm here to help you with:
1. 🔍 Understanding ${topic || 'various'} concepts deeply
2. 🧩 Solving challenging problems step-by-step
3. 👨‍💻 Writing efficient and clean code
4. 🤔 Developing strong problem-solving skills
5. 🛠️ Building practical projects
6. 📋 Preparing for assessments
7. 🎓 Mastering advanced topics

What aspect would you like to focus on? 💭`,

      `Greetings! 🎯 I'm your dedicated learning companion! Here's how I can support your studies:
1. 🔄 Explain complex topics in simple terms
2. 💡 Provide hands-on coding exercises
3. 🏋️ Create custom practice problems
4. 🌐 Share real-world applications
5. 🧭 Guide you through difficult concepts
6. 📚 Help you develop better study habits
7. 📊 Track your learning progress

Where would you like to begin? 🚀`
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

Just ask me anything specific you'd like to learn about! 😊`;
  }

  if (userPrompt.includes('help') || userPrompt.includes('assist')) {
    return `I'd be happy to help you! 👋 Here are some ways we can work together:

1. 🔍 Ask specific questions about topics you're studying
2. 🧩 Request explanations of difficult concepts
3. 💻 Get help with coding problems
4. 🏋️ Practice with example problems
5. 📊 Develop better study strategies

What specific area would you like help with? 💭`;
  }

  // Additional response handlers for common queries
  if (userPrompt.includes('thank')) {
    const acknowledgements = [
      `You're welcome! 😊 I'm happy I could help with your questions about ${topic || 'this topic'}. Feel free to ask if you need anything else!`,
      `Glad I could assist! 🌟 Learning about ${topic || 'these concepts'} can be fascinating. Is there anything else you'd like to explore?`,
      `My pleasure! 👍 If you have any more questions about ${topic || 'this'} or want to dive deeper, just let me know.`,
      `You're very welcome! 🙌 I'm here whenever you want to learn more about ${topic || 'this subject'} or explore related areas.`
    ];
    return acknowledgements[Math.floor(Math.random() * acknowledgements.length)];
  }

  if (userPrompt.includes('how are you') || userPrompt.includes('how do you feel')) {
    const responses = [
      `I'm functioning well, thank you for asking! 😊 I'm excited to help you learn about ${topic || 'various topics'}. What specific questions do you have?`,
      `I'm here and ready to assist with your questions about ${topic || 'any subject'}! 🌟 What would you like to explore today?`,
      `I'm always ready to help with ${topic || 'learning'}! 💪 Is there a specific aspect you'd like me to explain?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (userPrompt.includes('your name') || userPrompt.includes('who are you')) {
    return `I'm your AI learning assistant for ${topic || 'various subjects'} 🤖. I don't have a specific name, but I'm designed to help you understand concepts, solve problems, and explore new ideas. How can I assist with your learning today? 📚`;
  }

  // Opinion query responses
  if (isOpinionQuery) {
    const opinionResponses = [
      `As an AI learning assistant, I don't have personal opinions, but from an educational perspective on ${extractQueryTerm(prompt, isOpinionQuery)}, I can share that:

1. 👨‍🏫 Many experts in ${topic || 'this field'} emphasize the importance of ${generatePlaceholderContent(specializedTopic, 'expert_viewpoint1')}
2. 🔬 Research indicates that ${generatePlaceholderContent(specializedTopic, 'research_finding')}
3. ✅ Best practices generally suggest ${generatePlaceholderContent(specializedTopic, 'best_practice')}

The key is to consider different perspectives and evidence-based approaches in your learning journey. 🧠`,

      `While I don't form personal opinions, I can share what the general consensus is regarding ${extractQueryTerm(prompt, isOpinionQuery)}:

🎓 The academic community generally recognizes that ${generatePlaceholderContent(specializedTopic, 'academic_consensus')}.

📝 Some educational perspectives suggest ${generatePlaceholderContent(specializedTopic, 'educational_perspective')}.

What's most important is developing your own informed perspective based on reliable sources and evidence. 💡`
    ];
    return opinionResponses[Math.floor(Math.random() * opinionResponses.length)] + 
           followUps[Math.floor(Math.random() * followUps.length)];
  }
  
  // Personal query responses
  if (isPersonalQuery) {
    const personalResponses = [
      `As an AI learning assistant, I don't have personal preferences, but I can tell you that many students find ${extractQueryTerm(prompt, isPersonalQuery)} particularly valuable because:

• 🎓 It provides ${generatePlaceholderContent(specializedTopic, 'learning_benefit1')}
• 🧠 It helps develop ${generatePlaceholderContent(specializedTopic, 'skill_development')}
• 🔄 It connects well with ${generatePlaceholderContent(specializedTopic, 'related_concept')}

Would you like to explore this aspect of ${topic || 'the subject'} further? 💭`,

      `I don't have personal favorites, but from a learning perspective, ${extractQueryTerm(prompt, isPersonalQuery)} is considered significant because:

1. 💡 It demonstrates ${generatePlaceholderContent(specializedTopic, 'key_principle')}
2. 🌟 Many learners find it particularly engaging due to ${generatePlaceholderContent(specializedTopic, 'engagement_factor')}
3. 🔧 It has practical applications in ${generatePlaceholderContent(specializedTopic, 'application_area')}

What specific aspect interests you most? 🤔`
    ];
    return personalResponses[Math.floor(Math.random() * personalResponses.length)];
  }
  
  // Explanation request responses
  if (isExplanationRequest) {
    const explanationResponses = [
      `Here's an explanation of why ${extractQueryTerm(prompt, isExplanationRequest)}:

🔍 The fundamental reason is ${generatePlaceholderContent(specializedTopic, 'fundamental_reason')}.

Key factors include:
• 1️⃣ ${generatePlaceholderContent(specializedTopic, 'factor1')}
• 2️⃣ ${generatePlaceholderContent(specializedTopic, 'factor2')}
• 3️⃣ ${generatePlaceholderContent(specializedTopic, 'factor3')}

Understanding this helps us appreciate ${generatePlaceholderContent(specializedTopic, 'broader_implication')}. 💡`,

      `Let me explain why ${extractQueryTerm(prompt, isExplanationRequest)}:

🧩 The primary explanation is based on ${generatePlaceholderContent(specializedTopic, 'primary_principle')}.

This occurs because:
1. 🔄 ${generatePlaceholderContent(specializedTopic, 'causal_factor1')}
2. 🔄 ${generatePlaceholderContent(specializedTopic, 'causal_factor2')}
3. 🔄 ${generatePlaceholderContent(specializedTopic, 'causal_factor3')}

This explanation helps us better understand ${generatePlaceholderContent(specializedTopic, 'related_phenomenon')}. 🧠`
    ];
    return explanationResponses[Math.floor(Math.random() * explanationResponses.length)] + 
           followUps[Math.floor(Math.random() * followUps.length)];
  }
  
  // Progress query responses
  if (isProgressQuery) {
    const progressResponses = [
      `Based on our conversation about ${topic || 'this topic'}, you're showing a good understanding of the key concepts. To continue your progress:

• ✅ You've demonstrated understanding of ${generatePlaceholderContent(specializedTopic, 'demonstrated_knowledge')}
• 🔍 You might want to explore more about ${generatePlaceholderContent(specializedTopic, 'suggested_exploration')}
• 👉 A good next step would be ${generatePlaceholderContent(specializedTopic, 'next_step')}

Learning is a journey, and you're making good progress. 🚶‍♂️ Would you like some specific resources to help you advance further?`,

      `You're doing well with ${topic || 'your learning'}! 👏 Here's what I've observed:

✓ Strengths: Your questions show good engagement with ${generatePlaceholderContent(specializedTopic, 'strength_area')}
✓ Progress: You're connecting ideas and building your knowledge base 🧠
✓ Next level: Consider challenging yourself with ${generatePlaceholderContent(specializedTopic, 'challenge_suggestion')} 🏆

Would you like to test your understanding with a few practice questions? 📝`
    ];
    return progressResponses[Math.floor(Math.random() * progressResponses.length)];
  }
  
  // Recommendation query responses
  if (isRecommendationQuery) {
    const recommendationResponses = [
      `Here are my recommendations for ${extractQueryTerm(prompt, isRecommendationQuery)}:

🔝 Top suggestions:
1. 🥇 ${generatePlaceholderContent(specializedTopic, 'recommendation1')}
2. 🥈 ${generatePlaceholderContent(specializedTopic, 'recommendation2')}
3. 🥉 ${generatePlaceholderContent(specializedTopic, 'recommendation3')}

For beginners, I'd suggest starting with #1, while those with more experience might prefer #3.

These recommendations are based on educational best practices and learning efficiency. 📚`,

      `Based on your interest in ${extractQueryTerm(prompt, isRecommendationQuery)}, here's what I recommend:

For immediate learning 🚀:
• ${generatePlaceholderContent(specializedTopic, 'immediate_recommendation')}

For deeper understanding 🧠:
• ${generatePlaceholderContent(specializedTopic, 'deeper_recommendation')}

For practical application 🛠️:
• ${generatePlaceholderContent(specializedTopic, 'practical_recommendation')}

These suggestions align with effective learning pathways in ${topic || 'this field'}. 📊`
    ];
    return recommendationResponses[Math.floor(Math.random() * recommendationResponses.length)] + 
           followUps[Math.floor(Math.random() * followUps.length)];
  }
  
  // Future query responses
  if (isFutureQuery) {
    const futureResponses = [
      `Regarding the future of ${extractQueryTerm(prompt, isFutureQuery)}, current trends and research suggest:

🔮 Emerging developments:
• 📈 ${generatePlaceholderContent(specializedTopic, 'future_trend1')}
• 🚀 ${generatePlaceholderContent(specializedTopic, 'future_trend2')}
• 💡 ${generatePlaceholderContent(specializedTopic, 'future_trend3')}

These directions are being shaped by ${generatePlaceholderContent(specializedTopic, 'driving_factor')}.

For learners, this means ${generatePlaceholderContent(specializedTopic, 'implication_for_learners')}. 🎓`,

      `Looking at the future of ${extractQueryTerm(prompt, isFutureQuery)}, experts anticipate:

1. ⏱️ Short-term: ${generatePlaceholderContent(specializedTopic, 'short_term_prediction')}
2. ⏳ Medium-term: ${generatePlaceholderContent(specializedTopic, 'medium_term_prediction')}
3. ⌛ Long-term: ${generatePlaceholderContent(specializedTopic, 'long_term_prediction')}

These projections are based on ${generatePlaceholderContent(specializedTopic, 'prediction_basis')}.

To stay ahead in this evolving landscape, consider ${generatePlaceholderContent(specializedTopic, 'preparation_strategy')}. 🚀`
    ];
    return futureResponses[Math.floor(Math.random() * futureResponses.length)] + 
           followUps[Math.floor(Math.random() * followUps.length)];
  }
  
  // Challenge request responses
  if (isChallengeRequest) {
    const challengeResponses = [
      `Here's a challenge to test your knowledge of ${topic || 'this topic'}:

🧠 Challenge Question:
${generatePlaceholderContent(specializedTopic, 'challenge_question')}

Take some time to think about it, and when you're ready, share your answer. I'll provide feedback and explain the solution approach. 💪`,

      `Let's test your understanding with this ${topic || 'learning'} challenge:

📝 Problem:
${generatePlaceholderContent(specializedTopic, 'problem_statement')}

Hints to consider:
• 💡 ${generatePlaceholderContent(specializedTopic, 'hint1')}
• 🔍 ${generatePlaceholderContent(specializedTopic, 'hint2')}

Let me know when you want the answer or if you need more hints! 🤔`
    ];
    return challengeResponses[Math.floor(Math.random() * challengeResponses.length)];
  }
  
  // Motivation query responses
  if (isMotivationQuery) {
    const motivationResponses = [
      `Here's some motivation for your journey in learning ${topic || 'this subject'}:

💫 "${generatePlaceholderContent(specializedTopic, 'inspirational_quote')}"

Remember that:
• 🌱 Every expert was once a beginner
• 🧠 Understanding grows with each question you ask
• 💪 The challenges you overcome build your expertise

What specific aspect of ${topic || 'learning'} are you finding most challenging right now? 🤔`,

      `Finding motivation to learn ${topic || 'new subjects'} is so important! Here's some encouragement:

🌟 Success in ${topic || 'this field'} comes from ${generatePlaceholderContent(specializedTopic, 'success_factor')}

🌟 Many learners find that ${generatePlaceholderContent(specializedTopic, 'motivation_technique')} helps maintain momentum

🌟 Remember: "${generatePlaceholderContent(specializedTopic, 'motivational_phrase')}"

What specific goal are you working toward? Having a clear objective can help boost your motivation. 🎯`
    ];
    return motivationResponses[Math.floor(Math.random() * motivationResponses.length)];
  }
  
  // Analogy request responses
  if (isAnalogyRequest) {
    const analogyResponses = [
      `Here's an analogy to help understand ${extractQueryTerm(prompt, isAnalogyRequest)}:

🔄 ${generatePlaceholderContent(specializedTopic, 'analogy_explanation')}

This comparison helps illustrate how ${generatePlaceholderContent(specializedTopic, 'analogy_insight')}.

Does this analogy help clarify the concept for you? 💡`,

      `Think of ${extractQueryTerm(prompt, isAnalogyRequest)} like this:

🖼️ Imagine ${generatePlaceholderContent(specializedTopic, 'analogy_scenario')}.

In this analogy:
• 🔍 ${generatePlaceholderContent(specializedTopic, 'analogy_element1')}
• 🔄 ${generatePlaceholderContent(specializedTopic, 'analogy_element2')}
• 🧩 ${generatePlaceholderContent(specializedTopic, 'analogy_element3')}

This mental model can make it easier to grasp the concept. How does this analogy work for your understanding? 🤔`
    ];
    return analogyResponses[Math.floor(Math.random() * analogyResponses.length)];
  }
  
  // Correction request responses
  if (isCorrectionRequest) {
    const correctionResponses = [
      `Let me review what you've shared about ${topic || 'this topic'}:

✅ You're correct that ${generatePlaceholderContent(specializedTopic, 'correct_point')}

However, there's a small clarification needed:
🔍 ${generatePlaceholderContent(specializedTopic, 'clarification_point')}

Additionally, you might want to consider that ${generatePlaceholderContent(specializedTopic, 'additional_consideration')}.

Does this feedback help clarify things? 💭`,

      `Based on your question, let me provide some feedback:

What you got right ✅:
• ${generatePlaceholderContent(specializedTopic, 'correct_understanding1')}
• ${generatePlaceholderContent(specializedTopic, 'correct_understanding2')}

What needs refinement 🔧:
• ${generatePlaceholderContent(specializedTopic, 'refinement_point')}

The key thing to remember is ${generatePlaceholderContent(specializedTopic, 'key_reminder')}. 🧠

Would you like me to elaborate on any of these points? 💬`
    ];
    return correctionResponses[Math.floor(Math.random() * correctionResponses.length)];
  }
  
  // Definition query responses
  if (isDefinitionQuery) {
    const definitionResponses = [
      `Let me explain what ${extractQueryTerm(prompt, isDefinitionQuery)} means:

📘 A clear definition is ${generatePlaceholderContent(specializedTopic, 'definition')}.

Key characteristics include:
• 🔑 ${generatePlaceholderContent(specializedTopic, 'characteristic1')}
• 🔑 ${generatePlaceholderContent(specializedTopic, 'characteristic2')}
• 🔑 ${generatePlaceholderContent(specializedTopic, 'characteristic3')}

In the context of ${topic || 'this field'}, it's important because ${generatePlaceholderContent(specializedTopic, 'importance')}. 💡`,

      `Here's a comprehensive definition of ${extractQueryTerm(prompt, isDefinitionQuery)}:

🔍 In essence, it refers to ${generatePlaceholderContent(specializedTopic, 'definition')}.

The concept is characterized by:
• ✨ ${generatePlaceholderContent(specializedTopic, 'property1')}
• ✨ ${generatePlaceholderContent(specializedTopic, 'property2')}
• ✨ ${generatePlaceholderContent(specializedTopic, 'property3')}

This is fundamental to understanding ${generatePlaceholderContent(specializedTopic, 'related_concept')}. 🧠`
    ];
    return definitionResponses[Math.floor(Math.random() * definitionResponses.length)] + 
           followUps[Math.floor(Math.random() * followUps.length)];
  }

  // How-to query responses
  if (isHowToQuery) {
    const howToResponses = [
      `Here's how to ${extractQueryTerm(prompt, isHowToQuery)}:

Step 1: 🔍 ${generatePlaceholderContent(specializedTopic, 'step1')}
Step 2: 📝 ${generatePlaceholderContent(specializedTopic, 'step2')}
Step 3: 🔄 ${generatePlaceholderContent(specializedTopic, 'step3')}
Step 4: 🎯 ${generatePlaceholderContent(specializedTopic, 'step4')}

Tips for success:
• 💡 ${generatePlaceholderContent(specializedTopic, 'tip1')}
• 💡 ${generatePlaceholderContent(specializedTopic, 'tip2')}
• 💡 ${generatePlaceholderContent(specializedTopic, 'tip3')}`,

      `Let me walk you through the process of how to ${extractQueryTerm(prompt, isHowToQuery)}:

1️⃣ First: ${generatePlaceholderContent(specializedTopic, 'first_step')}
2️⃣ Next: ${generatePlaceholderContent(specializedTopic, 'second_step')}
3️⃣ Then: ${generatePlaceholderContent(specializedTopic, 'third_step')}
4️⃣ Finally: ${generatePlaceholderContent(specializedTopic, 'final_step')}

📌 Important considerations:
• ⚠️ ${generatePlaceholderContent(specializedTopic, 'consideration1')}
• ⚠️ ${generatePlaceholderContent(specializedTopic, 'consideration2')}`
    ];
    return howToResponses[Math.floor(Math.random() * howToResponses.length)] + 
           followUps[Math.floor(Math.random() * followUps.length)];
  }

  // Comparison query responses
  if (isComparisonQuery) {
    const terms = extractComparisonTerms(prompt);
    const comparisonResponses = [
      `Let's compare ${terms.term1} and ${terms.term2}:

📌 ${terms.term1}:
• ✨ ${generatePlaceholderContent(specializedTopic, `${terms.term1}_property1`)}
• ✨ ${generatePlaceholderContent(specializedTopic, `${terms.term1}_property2`)}
• ✨ ${generatePlaceholderContent(specializedTopic, `${terms.term1}_property3`)}

📌 ${terms.term2}:
• 🔹 ${generatePlaceholderContent(specializedTopic, `${terms.term2}_property1`)}
• 🔹 ${generatePlaceholderContent(specializedTopic, `${terms.term2}_property2`)}
• 🔹 ${generatePlaceholderContent(specializedTopic, `${terms.term2}_property3`)}

🔄 Key differences:
• ⚡ ${generatePlaceholderContent(specializedTopic, 'difference1')}
• ⚡ ${generatePlaceholderContent(specializedTopic, 'difference2')}

⏱️ When to use each:
• Use ${terms.term1} when ${generatePlaceholderContent(specializedTopic, `${terms.term1}_usage`)}
• Use ${terms.term2} when ${generatePlaceholderContent(specializedTopic, `${terms.term2}_usage`)}`
    ];
    return comparisonResponses[Math.floor(Math.random() * comparisonResponses.length)] + 
           followUps[Math.floor(Math.random() * followUps.length)];
  }

  // Problem-solving query responses
  if (isProblemSolvingQuery && !isCodeQuery) {
    const problemResponses = [
      `Let's solve this ${topic || ''} problem step-by-step:

📝 Given:
${generatePlaceholderContent(specializedTopic, 'problem_statement')}

🧩 Solution approach:
1. 🔍 ${generatePlaceholderContent(specializedTopic, 'solution_step1')}
2. 📊 ${generatePlaceholderContent(specializedTopic, 'solution_step2')}
3. 🔄 ${generatePlaceholderContent(specializedTopic, 'solution_step3')}
4. ✅ ${generatePlaceholderContent(specializedTopic, 'solution_step4')}

🎯 Therefore:
${generatePlaceholderContent(specializedTopic, 'conclusion')}

💡 Key insights from this problem:
• ${generatePlaceholderContent(specializedTopic, 'insight1')}
• ${generatePlaceholderContent(specializedTopic, 'insight2')}`
    ];
    return problemResponses[Math.floor(Math.random() * problemResponses.length)] + 
           followUps[Math.floor(Math.random() * followUps.length)];
  }

  // Example query responses
  if (isExampleQuery) {
    const exampleResponses = [
      `Here are some examples of ${extractQueryTerm(prompt, isExampleQuery)}:

📌 Example 1:
${generatePlaceholderContent(specializedTopic, 'example1')}

📌 Example 2:
${generatePlaceholderContent(specializedTopic, 'example2')}

📌 Example 3:
${generatePlaceholderContent(specializedTopic, 'example3')}

These examples illustrate ${generatePlaceholderContent(specializedTopic, 'key_point')}. 💡`
    ];
    return exampleResponses[Math.floor(Math.random() * exampleResponses.length)] + 
           followUps[Math.floor(Math.random() * followUps.length)];
  }

  // Resource query responses
  if (isResourceQuery) {
    const resourceResponses = [
      `Here are some valuable resources to learn more about ${extractQueryTerm(prompt, isResourceQuery)}:

📚 Books:
• 📘 ${generatePlaceholderContent(specializedTopic, 'book1')}
• 📕 ${generatePlaceholderContent(specializedTopic, 'book2')}

🌐 Online Courses:
• 💻 ${generatePlaceholderContent(specializedTopic, 'course1')}
• 💻 ${generatePlaceholderContent(specializedTopic, 'course2')}

📹 Video Tutorials:
• 🎬 ${generatePlaceholderContent(specializedTopic, 'video1')}
• 🎬 ${generatePlaceholderContent(specializedTopic, 'video2')}

💻 Websites:
• 🔗 ${generatePlaceholderContent(specializedTopic, 'website1')}
• 🔗 ${generatePlaceholderContent(specializedTopic, 'website2')}

🛣️ Learning path recommendation:
1. 🔰 Start with ${generatePlaceholderContent(specializedTopic, 'beginner_resource')}
2. 🔄 Then move to ${generatePlaceholderContent(specializedTopic, 'intermediate_resource')}
3. 🚀 For advanced learning, check out ${generatePlaceholderContent(specializedTopic, 'advanced_resource')}`
    ];
    return resourceResponses[Math.floor(Math.random() * resourceResponses.length)];
  }

  // Historical query responses
  if (isHistoricalQuery) {
    const historyResponses = [
      `Here's the historical development of ${extractQueryTerm(prompt, isHistoricalQuery)}:

🏛️ Early Origins:
${generatePlaceholderContent(specializedTopic, 'early_history')}

📜 Key Developments:
• ⏳ ${generatePlaceholderContent(specializedTopic, 'development1')}
• ⏳ ${generatePlaceholderContent(specializedTopic, 'development2')}
• ⏳ ${generatePlaceholderContent(specializedTopic, 'development3')}

🔄 Modern Evolution:
${generatePlaceholderContent(specializedTopic, 'modern_evolution')}

🌟 Impact and Legacy:
${generatePlaceholderContent(specializedTopic, 'impact')}`
    ];
    return historyResponses[Math.floor(Math.random() * historyResponses.length)] + 
           followUps[Math.floor(Math.random() * followUps.length)];
  }

  // Define expanded topic-specific responses
  const topicResponses = {
    general: [
      `Let me help you understand ${prompt}:

1. 📚 Overview
   • Basic concepts
   • Common misconceptions
   • Real-world relevance

2. 🔑 Key Points
   • Main ideas
   • Important factors
   • Critical considerations

3. 🛠️ Practical Applications
   • Everyday examples
   • Common situations
   • Personal relevance

4. 💡 Tips & Strategies
   • Best practices
   • Helpful approaches
   • Problem-solving methods

5. 🚀 Further Learning
   • Related topics
   • Additional resources
   • Next steps`,

      `Here's a comprehensive explanation of ${prompt}:

1. 🧠 Understanding the Basics
   • What it means
   • Why it matters
   • How it works

2. 🌐 Common Scenarios
   • Everyday situations
   • Typical challenges
   • Practical solutions

3. ⚠️ Important Considerations
   • Key factors
   • Common pitfalls
   • Success strategies

4. 🔧 Making it Work
   • Implementation steps
   • Useful techniques
   • Helpful tools

5. 🚀 Going Further
   • Advanced aspects
   • Related concepts
   • Learning resources`
    ],

    conceptual: [
      `Let's explore the concept of ${prompt}:

1. 🧩 Core Principles
   • Fundamental ideas
   • Key theories
   • Basic framework

2. 🌐 Understanding Context
   • Historical background
   • Current perspectives
   • Future implications

3. 🔍 Critical Analysis
   • Main arguments
   • Different viewpoints
   • Key debates

4. 🛠️ Practical Significance
   • Real-world impact
   • Applications
   • Benefits and challenges

5. 🧠 Deeper Insights
   • Advanced concepts
   • Interconnections
   • Emerging trends`,

      `Here's a deep dive into ${prompt}:

1. 📝 Theoretical Framework
   • Basic principles
   • Core concepts
   • Underlying theories

2. 🔍 Analysis & Interpretation
   • Different approaches
   • Various perspectives
   • Critical thinking

3. 🌐 Practical Context
   • Real-world examples
   • Case studies
   • Applied scenarios

4. 🔄 Implications & Impact
   • Social aspects
   • Cultural factors
   • Future directions

5. 🚀 Advanced Understanding
   • Complex relationships
   • Emerging research
   • New developments`
    ],

    everyday: [
      `Let me explain ${prompt} in practical terms:

1. 🏠 Daily Life Impact
   • Common situations
   • Regular encounters
   • Practical effects

2. 🔑 Understanding the Basics
   • Simple explanations
   • Easy examples
   • Clear illustrations

3. 💡 Helpful Tips
   • Practical advice
   • Useful strategies
   • Quick solutions

4. ⚠️ Common Challenges
   • Typical problems
   • Simple fixes
   • Prevention methods

5. 🔧 Making it Better
   • Improvement ideas
   • Easy changes
   • Helpful habits`,

      `Here's how to understand ${prompt} in everyday life:

1. 🔍 Practical Overview
   • What you need to know
   • Why it matters
   • How it affects you

2. 🌐 Daily Applications
   • Regular uses
   • Common situations
   • Practical examples

3. 🛠️ Simple Solutions
   • Easy approaches
   • Quick fixes
   • Helpful methods

4. 📈 Better Results
   • Improvement tips
   • Success strategies
   • Useful habits

5. 🚀 Next Steps
   • Further learning
   • Additional resources
   • Advanced topics`
    ],

    math: [
      `Let's explore ${prompt} through these key mathematical concepts:
1. 📘 Core Definitions and Principles
   • Fundamental theorems
   • Key properties and rules
   • Important relationships

2. 🧮 Problem-Solving Approach
   • Step-by-step methodology
   • Common patterns to recognize
   • Verification techniques

3. 🌐 Practical Applications
   • Real-world examples
   • Industry use cases
   • Interdisciplinary connections

4. ⚠️ Common Challenges
   • Misconceptions to avoid
   • Typical error patterns
   • Solution strategies

5. 🚀 Advanced Concepts
   • Extensions and generalizations
   • Related topics
   • Further exploration paths`,

      `Here's a comprehensive breakdown of ${prompt}:
1. 🧩 Foundation
   • Basic definitions
   • Essential properties
   • Core concepts

2. 📊 Methodology
   • Systematic approach
   • Problem-solving techniques
   • Proof strategies

3. 🛠️ Applications
   • Practical examples
   • Real-world scenarios
   • Cross-domain applications

4. ⚠️ Common Pitfalls
   • Frequent mistakes
   • Understanding gaps
   • Solution strategies

5. 🚀 Advanced Topics
   • Complex scenarios
   • Special cases
   • Research directions`,
    ],
    
    programming: {
      javascript: [
        // JavaScript content removed for brevity
      ],
      python: [
        // Python content removed for brevity
      ],
      rust: [
        // Rust content removed for brevity 
      ]
    },
    computerScience: [
      // Computer science content removed for brevity
    ],
    physics: [
      // Physics content removed for brevity
    ]
  };

  // Enhanced follow-up questions with more variety
  const followUps = [
    "\n\n❓ Would you like me to provide more specific examples or explain any concept in greater detail?",
    "\n\n🛠️ Shall we explore the practical applications of these concepts through some hands-on exercises?",
    "\n\n🌐 Would you like to see how this knowledge applies to real-world scenarios?",
    "\n\n🔍 Shall we dive deeper into any particular aspect that interests you?",
    "\n\n📝 Would you like to test your understanding with some practice problems?",
    "\n\n🧩 Is there a specific part you'd like me to elaborate on?",
    "\n\n🚀 Shall we explore some advanced topics related to this subject?",
    "\n\n🏠 Would you like to see some everyday examples of this concept?",
    "\n\n🔄 Shall we discuss how this relates to your daily life?",
    "\n\n💡 Would you like to explore the practical implications of this topic?",
    "\n\n⚠️ Shall we look at some common misconceptions about this subject?",
    "\n\n📚 Would you like some tips on how to apply this knowledge effectively?"
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

// Helper functions for advanced query processing
const extractQueryTerm = (prompt, queryType) => {
  prompt = prompt.toLowerCase();
  
  if (prompt.includes('what is') || prompt.includes('what are')) {
    const match = prompt.match(/what (?:is|are) (.*?)(?:\?|$)/i);
    return match ? match[1].trim() : prompt;
  }
  
  if (prompt.includes('how to')) {
    const match = prompt.match(/how to (.*?)(?:\?|$)/i);
    return match ? match[1].trim() : prompt;
  }
  
  if (prompt.includes('example of') || prompt.includes('examples of')) {
    const match = prompt.match(/examples? of (.*?)(?:\?|$)/i);
    return match ? match[1].trim() : prompt;
  }
  
  return prompt;
};

const extractComparisonTerms = (prompt) => {
  prompt = prompt.toLowerCase();
  
  // Check for "difference between X and Y" pattern
  if (prompt.includes('difference between')) {
    const match = prompt.match(/difference between (.*?) and (.*?)(?:\?|$)/i);
    if (match) {
      return {
        term1: match[1].trim(),
        term2: match[2].trim()
      };
    }
  }
  
  // Check for "X vs Y" or "X versus Y" pattern
  if (prompt.includes(' vs ') || prompt.includes(' versus ')) {
    const match = prompt.match(/(.*?) (?:vs|versus) (.*?)(?:\?|$)/i);
    if (match) {
      return {
        term1: match[1].trim(),
        term2: match[2].trim()
      };
    }
  }
  
  // Check for "compare X and Y" pattern
  if (prompt.includes('compare')) {
    const match = prompt.match(/compare (.*?) (?:and|to|with) (.*?)(?:\?|$)/i);
    if (match) {
      return {
        term1: match[1].trim(),
        term2: match[2].trim()
      };
    }
  }
  
  return {
    term1: 'first item',
    term2: 'second item'
  };
};

// Generate placeholder content based on topic specialization
const generatePlaceholderContent = (specializedTopic, contentType) => {
  // This would be expanded with real content in a production system
  // For simulation, we'll return topic-aware placeholder content
  
  const generalResponses = {
    'definition': 'a fundamental concept with wide-ranging applications',
    'characteristic1': 'exhibits consistent behavior under various conditions',
    'characteristic2': 'follows established principles of the field',
    'characteristic3': 'can be measured and analyzed objectively',
    'importance': 'it forms the foundation for more advanced concepts',
    'property1': 'standardized approach to solving problems',
    'property2': 'widely accepted in the scientific community',
    'property3': 'continuously evolving based on new research',
    'related_concept': 'broader principles in this field',
    'step1': 'understand the underlying principles',
    'step2': 'identify the key components involved',
    'step3': 'apply the appropriate methodology',
    'step4': 'evaluate and refine your solution',
    'tip1': 'focus on understanding fundamentals before advancing',
    'tip2': 'practice with varied examples to build intuition',
    'tip3': 'connect concepts to real-world applications',
    'difference1': 'scope and primary applications',
    'difference2': 'underlying theoretical foundations',
    'book1': '"The Essential Guide" by Leading Expert',
    'book2': '"Advanced Concepts" by Academic Professional',
    'course1': 'Comprehensive Introduction on learning platforms',
    'course2': 'Advanced Applications in the field',
    'video1': 'Beginner-friendly tutorials on educational channels',
    'video2': 'In-depth explanation series by field experts',
    'website1': 'Educational resource site with interactive examples',
    'website2': 'Professional community forum with discussions',
    'example1': 'a straightforward implementation demonstrating core principles',
    'example2': 'a practical application showing real-world usage',
    'example3': 'an advanced implementation showcasing optimization techniques',
    'early_history': 'originally developed to address specific needs in the field',
    'development1': 'major breakthrough that established foundational concepts',
    'development2': 'refinement of methodologies based on practical applications',
    'development3': 'standardization and widespread adoption across industries',
    'modern_evolution': 'continual advancement driven by technological innovation and research',
    'impact': 'significant influence on related fields and practical applications',
    'problem_statement': 'a typical challenge requiring application of core principles',
    'solution_step1': 'identify the key variables and constraints',
    'solution_step2': 'apply the appropriate formulas or methods',
    'solution_step3': 'work through the calculations systematically',
    'solution_step4': 'verify your answer and check for reasonableness',
    'conclusion': 'the final answer, derived through careful application of principles',
    'insight1': 'understanding the approach can be applied to similar problems',
    'insight2': 'recognizing pattern relationships improves problem-solving efficiency',
    'first_step': 'set up your environment and prepare necessary tools',
    'second_step': 'understand the core concepts and requirements',
    'third_step': 'implement the solution methodically',
    'final_step': 'test and validate your approach',
    'consideration1': 'ensure you have the prerequisites before starting',
    'consideration2': 'plan for potential challenges or edge cases',
    'key_point': 'the fundamental principles that connect these examples',
    
    // New conversation-related content
    'expert_viewpoint1': 'starting with foundational concepts before advancing to complex topics',
    'research_finding': 'consistent practice and application leads to better retention',
    'best_practice': 'connecting theoretical concepts with practical applications',
    'academic_consensus': 'a structured approach yields better long-term understanding',
    'educational_perspective': 'active learning is more effective than passive consumption of information',
    'learning_benefit1': 'a clear framework for understanding complex concepts',
    'skill_development': 'critical thinking and analytical reasoning abilities',
    'key_principle': 'the core principles that underlie advanced applications',
    'engagement_factor': 'its practical relevance and real-world applications',
    'application_area': 'many contemporary professional fields',
    'fundamental_reason': 'the underlying principles that govern this behavior',
    'factor1': 'the intrinsic properties of the components involved',
    'factor2': 'the environmental conditions that influence the process',
    'factor3': 'the interactions between various elements in the system',
    'broader_implication': 'how these principles apply in various contexts',
    'primary_principle': 'fundamental laws that govern this phenomenon',
    'causal_factor1': 'initial conditions establish the foundation for what follows',
    'causal_factor2': 'interactions between components lead to emergent behavior',
    'causal_factor3': 'feedback mechanisms reinforce or balance the system',
    'related_phenomenon': 'similar patterns in different contexts',
    'demonstrated_knowledge': 'the fundamental concepts and their relationships',
    'suggested_exploration': 'how these concepts apply in more complex scenarios',
    'next_step': 'to work through some practical applications',
    'strength_area': 'connecting theoretical concepts with practical examples',
    'challenge_suggestion': 'more advanced problem-solving scenarios',
    'recommendation1': 'focus on understanding core principles through structured practice',
    'recommendation2': 'apply concepts in real-world scenarios to deepen understanding',
    'recommendation3': 'explore connections between related topics to build a comprehensive knowledge framework',
    'immediate_recommendation': 'interactive tutorials that provide immediate feedback',
    'deeper_recommendation': 'comprehensive resources that explore theoretical foundations',
    'practical_recommendation': 'hands-on projects that apply concepts in realistic contexts',
    'future_trend1': 'integration with other disciplines for more comprehensive solutions',
    'future_trend2': 'more accessible tools and resources for learners at all levels',
    'future_trend3': 'increased emphasis on practical applications and real-world relevance',
    'driving_factor': 'advances in technology and evolving educational approaches',
    'implication_for_learners': 'the importance of developing adaptable skills and foundational understanding',
    'short_term_prediction': 'refinement of current approaches with better tools and methodologies',
    'medium_term_prediction': 'integration of advanced technologies to enhance learning and application',
    'long_term_prediction': 'fundamental shifts in how these concepts are taught and applied',
    'prediction_basis': 'current research trends and technological developments',
    'preparation_strategy': 'building strong fundamentals while staying informed about new developments',
    'challenge_question': 'a thought-provoking question that tests understanding of core concepts',
    'hint1': 'consider how the fundamental principles apply in this specific context',
    'hint2': 'think about the relationships between key components in the system',
    'inspirational_quote': 'The more you learn, the more you realize how much more there is to discover',
    'success_factor': 'consistent practice and application of concepts',
    'motivation_technique': 'connecting abstract concepts to personal interests or goals',
    'motivational_phrase': 'Every question brings you closer to understanding',
    'analogy_explanation': 'think of it like a familiar system with similar components and interactions',
    'analogy_insight': 'complex concepts can be understood through familiar comparisons',
    'analogy_scenario': 'a familiar everyday situation with similar properties',
    'analogy_element1': 'the first component represents the foundational concept',
    'analogy_element2': 'the interactions demonstrate the key relationships',
    'analogy_element3': 'the outcomes parallel what happens in the actual system',
    'correct_point': 'you\'ve identified the core principle correctly',
    'clarification_point': 'there\'s an important distinction in how this applies in different contexts',
    'additional_consideration': 'there are additional factors that influence outcomes in complex scenarios',
    'correct_understanding1': 'your grasp of the fundamental concept is solid',
    'correct_understanding2': 'you\'ve correctly identified the key relationships',
    'refinement_point': 'consider how this applies in edge cases or special circumstances',
    'key_reminder': 'the core principles remain consistent even as applications vary'
  };
  
  // Topic-specific content generators could be implemented here
  const topicSpecificResponses = {
    'javascript': {
      'definition': 'a high-level, interpreted programming language that conforms to the ECMAScript specification',
      'step1': 'set up your development environment with Node.js and npm',
      'step2': 'understand the basic syntax and control structures',
      'step3': 'learn about asynchronous programming with Promises and async/await',
      'book1': '"Eloquent JavaScript" by Marijn Haverbeke',
      'book2': '"JavaScript: The Good Parts" by Douglas Crockford',
      'website1': 'MDN Web Docs for comprehensive JavaScript reference',
      'website2': 'JavaScript.info for beginner to advanced tutorials',
      'example1': 'a simple web application using modern ES6+ features',
      'example2': 'an interactive form with real-time validation',
      'example3': 'a data visualization using libraries like D3.js',
      'tip1': 'understand asynchronous programming deeply',
      'tip2': 'practice using modern ES6+ features',
      'tip3': 'learn proper error handling techniques',
      'consideration1': 'browser compatibility for your target audience',
      'consideration2': 'performance optimization for resource-intensive operations'
    },
    'python': {
      'definition': 'a high-level, interpreted programming language known for its readability and versatility',
      'step1': 'install Python and set up a virtual environment',
      'step2': 'learn the basic syntax and data structures',
      'step3': 'explore Python\'s extensive standard library',
      'book1': '"Python Crash Course" by Eric Matthes',
      'book2': '"Fluent Python" by Luciano Ramalho',
      'website1': 'Real Python for practical tutorials and examples',
      'website2': 'Python.org official documentation and guides',
      'example1': 'a command-line utility for file processing',
      'example2': 'a data analysis script using pandas and matplotlib',
      'example3': 'a web application using Flask or Django',
      'tip1': 'follow PEP 8 style guidelines for clean code',
      'tip2': 'leverage Python\'s built-in functions and libraries',
      'tip3': 'use virtual environments for project isolation',
      'consideration1': 'Python 2 vs Python 3 compatibility if relevant',
      'consideration2': 'performance considerations for large-scale applications'
    },
    'math': {
      'definition': 'a foundational branch of mathematics dealing with quantity, structure, space, and change',
      'step1': 'understand the core principles and notation',
      'step2': 'practice with worked examples to build intuition',
      'step3': 'solve progressively more challenging problems',
      'book1': '"Mathematics: Its Content, Methods and Meaning" by Aleksandrov, Kolmogorov, and Lavrentev',
      'book2': '"What Is Mathematics?" by Richard Courant and Herbert Robbins',
      'website1': 'Khan Academy for structured learning paths',
      'website2': 'Brilliant.org for interactive problem-solving',
      'example1': 'solving equations by isolating variables',
      'example2': 'applying theorems to geometric problems',
      'example3': 'working with complex functions and transformations',
      'tip1': 'focus on understanding concepts rather than memorizing formulas',
      'tip2': 'practice regularly with a variety of problems',
      'tip3': 'learn to check your answers for reasonableness'
    },
    'physics': {
      'definition': 'the natural science that studies matter, its motion and behavior through space and time, and the related entities of energy and force',
      'characteristic1': 'employs mathematical models to explain natural phenomena',
      'characteristic2': 'relies on experimental verification of theories',
      'characteristic3': 'applies across scales from subatomic particles to the entire universe',
      'book1': '"The Feynman Lectures on Physics" by Richard Feynman',
      'book2': '"A Brief History of Time" by Stephen Hawking',
      'website1': 'HyperPhysics for concept exploration and calculations',
      'website2': 'MIT OpenCourseWare physics lectures and materials',
      'example1': 'calculating projectile motion trajectories',
      'example2': 'analyzing forces in equilibrium systems',
      'example3': 'applying conservation laws to collision problems',
      'problem_statement': 'an object moving under the influence of multiple forces',
      'solution_step1': 'draw a free body diagram identifying all forces',
      'solution_step2': 'apply Newton\'s laws of motion to set up equations',
      'solution_step3': 'solve the equations for the unknowns',
      'solution_step4': 'verify the solution using dimensional analysis'
    },
    'mechanics': {
      'definition': 'the branch of physics dealing with the motion of objects and the forces acting on them',
      'early_history': 'foundations laid by Newton\'s laws of motion in the 17th century',
      'development1': 'Newton\'s formulation of the laws of motion and universal gravitation',
      'development2': 'Lagrangian and Hamiltonian reformulations in the 18th-19th centuries',
      'development3': 'applications to complex systems and engineering problems',
      'book1': '"Classical Mechanics" by John R. Taylor',
      'book2': '"Introduction to Classical Mechanics" by David Morin'
    },
    'quantum': {
      'definition': 'the branch of physics dealing with the behavior of matter and light on the atomic and subatomic scale',
      'characteristic1': 'exhibits wave-particle duality for matter and energy',
      'characteristic2': 'governed by probability rather than deterministic laws',
      'characteristic3': 'demonstrates quantum entanglement and superposition',
      'book1': '"Quantum Mechanics: The Theoretical Minimum" by Leonard Susskind',
      'book2': '"Quantum Mechanics: Concepts and Applications" by Nouredine Zettili',
      'development1': 'Planck\'s quantum hypothesis in 1900',
      'development2': 'Schrödinger\'s wave equation and Heisenberg\'s uncertainty principle',
      'development3': 'development of quantum field theory and the Standard Model'
    },
    'biology': {
      'definition': 'the scientific study of life and living organisms, including their physical structure, chemical processes, molecular interactions, development and evolution',
      'book1': '"Campbell Biology" by Lisa Urry, Michael Cain, and Steven Wasserman',
      'book2': '"The Cell: A Molecular Approach" by Geoffrey Cooper',
      'website1': 'Khan Academy Biology for structured learning',
      'website2': 'National Center for Biotechnology Information (NCBI) resources',
      'example1': 'cellular respiration converting glucose to ATP',
      'example2': 'DNA replication during cell division',
      'example3': 'natural selection driving evolutionary adaptations',
      'development1': 'discovery of cells as the basic unit of life',
      'development2': 'Darwin\'s theory of evolution by natural selection',
      'development3': 'discovery of DNA structure and the genetic code'
    },
    'chemistry': {
      'definition': 'the scientific discipline involved with compounds composed of atoms, i.e. elements, and molecules, i.e. combinations of atoms, and their composition, structure, properties, behavior and changes they undergo during reactions',
      'book1': '"Chemistry: The Central Science" by Brown, LeMay, and Bursten',
      'book2': '"Organic Chemistry" by Clayden, Greeves, and Warren',
      'website1': 'Chemguide for detailed explanations of concepts',
      'website2': 'Royal Society of Chemistry educational resources',
      'example1': 'balancing chemical equations',
      'example2': 'predicting products of acid-base reactions',
      'example3': 'analyzing reaction mechanisms in organic chemistry'
    },
    'algorithms': {
      'definition': 'step-by-step procedures or formulas for solving problems, especially in computing',
      'characteristic1': 'evaluated based on time and space complexity',
      'characteristic2': 'can be represented using pseudocode or flowcharts',
      'characteristic3': 'designed to be correct, efficient, and maintainable',
      'book1': '"Introduction to Algorithms" by Cormen, Leiserson, Rivest, and Stein',
      'book2': '"Algorithms" by Robert Sedgewick and Kevin Wayne',
      'website1': 'Visualgo.net for algorithm visualizations',
      'website2': 'GeeksforGeeks for algorithm tutorials and problems',
      'example1': 'sorting an array using quicksort or mergesort',
      'example2': 'finding the shortest path in a graph using Dijkstra\'s algorithm',
      'example3': 'searching for patterns in text using KMP algorithm'
    },
    'webdev': {
      'definition': 'the work involved in developing websites or web applications for the internet or intranet',
      'step1': 'learn HTML for structure, CSS for styling, and JavaScript for interactivity',
      'step2': 'understand responsive design principles and accessibility',
      'step3': 'explore frontend frameworks like React, Vue, or Angular',
      'step4': 'learn backend development with Node.js, Python, or other languages',
      'book1': '"JavaScript: The Definitive Guide" by David Flanagan',
      'book2': '"Learning Web Design" by Jennifer Niederst Robbins',
      'website1': 'MDN Web Docs for comprehensive web development guides',
      'website2': 'freeCodeCamp for interactive learning and projects',
      'example1': 'a responsive landing page with modern CSS',
      'example2': 'an interactive form with client-side validation',
      'example3': 'a single-page application with API integration'
    },
    'database': {
      'definition': 'an organized collection of structured data stored electronically and accessed via a database management system',
      'characteristic1': 'ensures data integrity through constraints and normalization',
      'characteristic2': 'provides query languages for data retrieval and manipulation',
      'characteristic3': 'implements transaction management for consistency',
      'book1': '"Database System Concepts" by Silberschatz, Korth, and Sudarshan',
      'book2': '"SQL Performance Explained" by Markus Winand',
      'website1': 'PostgreSQL documentation for in-depth database concepts',
      'website2': 'Mode Analytics SQL Tutorial for practical learning',
      'example1': 'designing a normalized schema for a business application',
      'example2': 'optimizing complex queries for better performance',
      'example3': 'implementing transactions for data consistency'
    },
    'calculus': {
      'definition': 'the mathematical study of continuous change and motion',
      'characteristic1': 'divided into differential calculus (rates of change) and integral calculus (accumulation)',
      'characteristic2': 'uses limits to analyze infinitesimal changes',
      'characteristic3': 'forms the foundation for most advanced mathematics and physics',
      'book1': '"Calculus: Early Transcendentals" by James Stewart',
      'book2': '"Calculus" by Michael Spivak',
      'website1': '3Blue1Brown for intuitive visual explanations',
      'website2': 'Paul\'s Online Math Notes for comprehensive tutorials',
      'example1': 'finding the derivative of a polynomial function',
      'example2': 'calculating the area under a curve using integration',
      'example3': 'solving optimization problems with calculus'
    },
    'algebra': {
      'definition': 'the branch of mathematics dealing with symbols and the rules for manipulating these symbols to form equations',
      'characteristic1': 'uses variables to represent unknown quantities',
      'characteristic2': 'follows precise rules of operations and equality',
      'characteristic3': 'provides tools for modeling real-world relationships',
      'book1': '"Algebra" by Israel M. Gelfand and Alexander Shen',
      'book2': '"Linear Algebra Done Right" by Sheldon Axler',
      'website1': 'Khan Academy Algebra courses for structured learning',
      'website2': 'Purplemath for clear explanations and examples',
      'example1': 'solving a system of linear equations',
      'example2': 'factoring polynomial expressions',
      'example3': 'working with matrices and determinants'
    },
    'history': {
      'definition': 'the study of past events, particularly human affairs',
      'characteristic1': 'relies on primary and secondary sources for evidence',
      'characteristic2': 'examines causes, effects, and patterns across time',
      'characteristic3': 'involves multiple perspectives and interpretations',
      'book1': '"Guns, Germs, and Steel" by Jared Diamond',
      'book2': '"A People\'s History of the United States" by Howard Zinn',
      'website1': 'Khan Academy History for structured learning paths',
      'website2': 'World History Encyclopedia for comprehensive articles',
      'example1': 'analyzing the causes of World War II',
      'example2': 'examining the impact of technological innovations throughout history',
      'example3': 'comparing different historical accounts of the same event'
    },
    'economics': {
      'definition': 'the social science that studies the production, distribution, and consumption of goods and services',
      'characteristic1': 'analyzes individual decision-making (microeconomics) and economy-wide phenomena (macroeconomics)',
      'characteristic2': 'employs models to simplify and understand complex relationships',
      'characteristic3': 'bridges theory and empirical analysis of economic data',
      'book1': '"Economics" by Paul Samuelson and William Nordhaus',
      'book2': '"Freakonomics" by Steven Levitt and Stephen Dubner',
      'website1': 'Khan Academy Economics for structured learning',
      'website2': 'The Economist for current economic analysis',
      'example1': 'analyzing supply and demand in specific markets',
      'example2': 'understanding inflation and monetary policy',
      'example3': 'examining economic growth and development across countries'
    }
  };
  
  // Return topic-specific content if available, otherwise general content
  if (specializedTopic in topicSpecificResponses && contentType in topicSpecificResponses[specializedTopic]) {
    return topicSpecificResponses[specializedTopic][contentType];
  }
  
  return generalResponses[contentType] || 'relevant information based on principle concepts';
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