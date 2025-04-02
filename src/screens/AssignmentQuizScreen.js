import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../api/supabase/client';
import { API_ENDPOINT } from '../config/constants';
import Constants from 'expo-constants';

const GOOGLE_AI_API_KEY = Constants.expoConfig.extra.EXPO_PUBLIC_GOOGLE_AI_API_KEY;

const AssignmentQuizScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { subspaceName, difficulty, questions, assignmentId, subjectId } = route.params;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(difficulty === 'easy' ? 600 : null); // 10 min for easy
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const timerRef = useRef(null);

  // Determine which questions are typed based on difficulty
  const typedQuestionIndices = useMemo(() => {
    if (difficulty === 'easy') return [];
    if (difficulty === 'medium') return [2, 5, 8]; // 3 typed questions
    if (difficulty === 'hard') return [1, 3, 6, 9]; // 4 typed questions
    return [];
  }, [difficulty]);

  useEffect(() => {
    // Set navigation title
    navigation.setOptions({
      title: `${subspaceName} - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`,
      headerShown: true,
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTintColor: theme.colors.text,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });

    // Setup timer for easy difficulty
    if (difficulty === 'easy' && timeRemaining !== null) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            Alert.alert("Time's up!", "Your quiz will be submitted now.");
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [navigation, subspaceName, difficulty, theme]);

  const isTypedQuestion = (index) => {
    return typedQuestionIndices.includes(index);
  };

  const handleSelectAnswer = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    // Validate answer input for typed questions
    if (isTypedQuestion(currentQuestion) && !typedAnswer.trim()) {
      Alert.alert("Empty Answer", "Please provide an answer before continuing.");
      return;
    }

    // Save answer
    const currentQuestionObj = questions[currentQuestion];
    const isTyped = isTypedQuestion(currentQuestion);
    
    let isCorrect = false;
    if (isTyped) {
      // For typed questions, we'll evaluate later with AI
      isCorrect = null; // To be determined by AI
    } else {
      isCorrect = selectedAnswer === currentQuestionObj.correctAnswer;
      if (isCorrect) {
        setScore(score + 1);
      }
    }
    
    setAnswers([...answers, { 
      question: currentQuestionObj.question,
      selected: isTyped ? typedAnswer : selectedAnswer,
      correct: currentQuestionObj.correctAnswer,
      isCorrect: isCorrect,
      isTyped: isTyped
    }]);
    
    // Move to next question or show results
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTypedAnswer('');
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    setLoading(true);
    try {
      // First handle multiple choice score
      let currentScore = 0;
      answers.forEach(answer => {
        if (answer.isCorrect === true) {
          currentScore += 1;
        }
      });

      // If we have typed answers, evaluate with AI
      const typedAnswers = answers.filter(a => a.isTyped);
      if (typedAnswers.length > 0) {
        await evaluateTypedAnswers(typedAnswers);
      } else {
        setShowResults(true);
      }

      // Update user's score in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('flex_points')
          .eq('user_id', user.id)
          .single();

        if (!profileError) {
          await supabase
            .from('user_profiles')
            .update({ 
              flex_points: (userProfile?.flex_points || 0) + currentScore 
            })
            .eq('user_id', user.id);
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setLoading(false);
      setShowResults(true);
    }
  };

  const evaluateTypedAnswers = async (typedAnswers) => {
    try {
      // Prepare the evaluation prompt
      const evaluationPrompt = `
        Please evaluate the following answers for questions on the topic: ${subspaceName}.
        
        ${typedAnswers.map((a, i) => 
          `Question ${i+1}: ${a.question}
           User's Answer: ${a.selected}
           Correct Answer: ${a.correct}`
        ).join('\n\n')}
        
        For each answer, determine if it's correct (full point), partially correct (half point), or incorrect (no points).
        Provide detailed feedback on each answer and explain why it's correct or incorrect.
        
        Finally, provide an overall assessment of the user's understanding and areas for improvement.
        
        Format your response as a JSON object with the following structure:
        {
          "evaluations": [
            {
              "questionIndex": 0,
              "score": 1.0, // 1.0, 0.5, or 0
              "feedback": "Detailed feedback on this answer"
            },
            ...
          ],
          "totalScore": 2.5, // Sum of all scores
          "overallFeedback": "Overall assessment and improvement areas"
        }
      `;

      const response = await fetch(`${API_ENDPOINT}?key=${GOOGLE_AI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: evaluationPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const evaluationText = data.candidates[0].content.parts[0].text;
      
      // Parse the JSON from the text response
      const jsonStart = evaluationText.indexOf('{');
      const jsonEnd = evaluationText.lastIndexOf('}') + 1;
      const jsonString = evaluationText.substring(jsonStart, jsonEnd);
      
      const evaluation = JSON.parse(jsonString);

      // Update answers with evaluation
      let updatedScore = score;
      const updatedAnswers = [...answers];
      
      evaluation.evaluations.forEach(evaluation => {
        // Find the corresponding typed question in our answers array
        const typedQuestionIndices = answers
          .map((a, i) => a.isTyped ? i : -1)
          .filter(i => i !== -1);
        
        if (typedQuestionIndices[evaluation.questionIndex] !== undefined) {
          const answerIndex = typedQuestionIndices[evaluation.questionIndex];
          updatedAnswers[answerIndex].isCorrect = evaluation.score > 0;
          updatedAnswers[answerIndex].feedback = evaluation.feedback;
          updatedScore += evaluation.score;
        }
      });
      
      setAnswers(updatedAnswers);
      setScore(updatedScore);
      setFeedback(evaluation.overallFeedback);
    } catch (error) {
      console.error('Error evaluating typed answers:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (showResults) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView style={styles.resultsContainer}>
          <Text style={[styles.resultsTitle, { color: theme.colors.text }]}>Quiz Results</Text>
          <View style={[styles.scoreContainer, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.scoreText, { color: theme.colors.text }]}>
              Your score: {score}/{questions.length} 
              ({Math.round((score / questions.length) * 100)}%)
            </Text>
          </View>
          
          {feedback && (
            <View style={[styles.feedbackContainer, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.feedbackTitle, { color: theme.colors.primary }]}>AI Feedback</Text>
              <Text style={[styles.feedbackText, { color: theme.colors.text }]}>{feedback}</Text>
            </View>
          )}
          
          <Text style={[styles.answersTitle, { color: theme.colors.text }]}>Your Answers:</Text>
          {answers.map((answer, index) => (
            <View key={index} style={[styles.resultItem, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.resultQuestion, { color: theme.colors.text }]}>
                {index + 1}. {answer.question}
              </Text>
              <Text style={[styles.resultAnswer, { color: theme.colors.text }]}>
                Your answer: <Text style={answer.isCorrect ? styles.correctAnswer : styles.wrongAnswer}>
                  {answer.selected}
                </Text>
              </Text>
              {!answer.isCorrect && (
                <Text style={[styles.correctAnswerText, { color: theme.colors.text }]}>
                  Correct answer: <Text style={styles.correctAnswer}>{answer.correct}</Text>
                </Text>
              )}
              {answer.feedback && (
                <Text style={[styles.answerFeedback, { color: theme.colors.textSecondary }]}>
                  {answer.feedback}
                </Text>
              )}
            </View>
          ))}
          
          <TouchableOpacity 
            style={[styles.doneButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const question = questions[currentQuestion];
  const isCurrentQuestionTyped = isTypedQuestion(currentQuestion);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {timeRemaining !== null && (
        <View style={[styles.timerContainer, { backgroundColor: theme.colors.card }]}>
          <Ionicons 
            name="timer-outline" 
            size={20} 
            color={timeRemaining < 60 ? "#F44336" : theme.colors.text} 
          />
          <Text style={[
            styles.timerText, 
            { color: theme.colors.text },
            timeRemaining < 60 && styles.timerWarning
          ]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>
      )}
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                backgroundColor: theme.colors.primary 
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
          {currentQuestion + 1}/{questions.length}
        </Text>
      </View>
      
      <View style={[styles.questionContainer, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.questionText, { color: theme.colors.text }]}>{question.question}</Text>
      </View>
      
      {isCurrentQuestionTyped ? (
        <View style={styles.typedAnswerContainer}>
          <Text style={[styles.typedLabel, { color: theme.colors.text }]}>Type your answer:</Text>
          <TextInput
            style={[
              styles.typedInput, 
              { 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                color: theme.colors.text 
              }
            ]}
            value={typedAnswer}
            onChangeText={setTypedAnswer}
            multiline
            placeholder="Enter your answer here..."
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
      ) : (
        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                { 
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border 
                },
                selectedAnswer === option && { 
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary 
                }
              ]}
              onPress={() => handleSelectAnswer(option)}
            >
              <Text style={[
                styles.optionText,
                { color: theme.colors.text },
                selectedAnswer === option && styles.selectedOptionText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: theme.colors.primary },
            (!selectedAnswer && !isCurrentQuestionTyped) && styles.disabledButton,
            (isCurrentQuestionTyped && !typedAnswer.trim()) && styles.disabledButton
          ]}
          onPress={handleNextQuestion}
          disabled={(!selectedAnswer && !isCurrentQuestionTyped) || (isCurrentQuestionTyped && !typedAnswer.trim())}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  timerWarning: {
    color: '#F44336',
  },
  progressContainer: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
  },
  questionContainer: {
    padding: 20,
    margin: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
  },
  optionsContainer: {
    padding: 15,
  },
  optionButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {
    color: 'white',
  },
  typedAnswerContainer: {
    padding: 15,
  },
  typedLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  typedInput: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 15,
    marginTop: 'auto',
  },
  nextButton: {
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  resultsContainer: {
    flex: 1,
    padding: 15,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreContainer: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  feedbackContainer: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  feedbackText: {
    fontSize: 16,
    lineHeight: 24,
  },
  answersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  resultQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultAnswer: {
    fontSize: 15,
    marginBottom: 5,
  },
  correctAnswerText: {
    fontSize: 15,
  },
  correctAnswer: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  wrongAnswer: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  answerFeedback: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    padding: 8,
    borderRadius: 5,
  },
  doneButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AssignmentQuizScreen;