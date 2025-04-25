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
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../api/supabase/client';
import { API_ENDPOINT } from '../config/constants';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');
const IS_IPHONE_X_OR_ABOVE = Platform.OS === 'ios' && (height >= 812 || width >= 812);

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
  const [progressAnimation] = useState(new Animated.Value(0));
  const timerRef = useRef(null);
  const scrollViewRef = useRef(null);

  // Determine which questions are typed based on difficulty
  const typedQuestionIndices = useMemo(() => {
    if (difficulty === 'easy') return [];
    if (difficulty === 'medium') return [2, 5, 8]; // 3 typed questions
    if (difficulty === 'hard') return [1, 3, 6, 9]; // 4 typed questions
    return [];
  }, [difficulty]);

  useEffect(() => {
    // Set navigation options
    navigation.setOptions({
      title: '',
      headerShown: true,
      headerStyle: {
        backgroundColor: theme.colors.background,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      headerTintColor: theme.colors.primary,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerLeft: () => (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            Alert.alert(
              "Confirm Exit",
              "Are you sure you want to exit? Your progress will be lost.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Exit", style: "destructive", onPress: () => navigation.goBack() }
              ]
            );
          }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <View style={styles.headerTitle}>
          <Text style={[styles.headerText, { color: theme.colors.text }]}>
            {subspaceName}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level
          </Text>
        </View>
      ),
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

  // Update progress animation when current question changes
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: (currentQuestion + 1) / questions.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestion, questions.length, progressAnimation]);

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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
        <StatusBar barStyle="dark-content" />
        <ScrollView 
          style={styles.resultsContainer}
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsTitle, { color: theme.colors.text }]}>Quiz Results</Text>
            <View style={[styles.scoreContainer, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.scoreCircle, { 
                borderColor: score / questions.length >= 0.7 ? '#4CAF50' : 
                             score / questions.length >= 0.4 ? '#FFC107' : '#F44336' 
              }]}>
                <Text style={[styles.scoreCircleText, { 
                  color: score / questions.length >= 0.7 ? '#4CAF50' : 
                         score / questions.length >= 0.4 ? '#FFC107' : '#F44336' 
                }]}>
                  {Math.round((score / questions.length) * 100)}%
                </Text>
              </View>
              <Text style={[styles.scoreText, { color: theme.colors.text }]}>
                Your score: {score}/{questions.length} 
              </Text>
              <Text style={[styles.completionText, { color: theme.colors.textSecondary }]}>
                {score / questions.length >= 0.7 ? "Great job!" : 
                score / questions.length >= 0.4 ? "Good effort!" : "Keep practicing!"}
              </Text>
            </View>
          </View>
          
          {feedback && (
            <View style={[styles.feedbackContainer, { backgroundColor: theme.colors.card }]}>
              <View style={styles.feedbackHeaderRow}>
                <Ionicons name="chatbox-ellipses" size={20} color={theme.colors.primary} />
                <Text style={[styles.feedbackTitle, { color: theme.colors.primary }]}>AI Feedback</Text>
              </View>
              <Text style={[styles.feedbackText, { color: theme.colors.text }]}>{feedback}</Text>
            </View>
          )}
          
          <Text style={[styles.answersTitle, { color: theme.colors.text }]}>Your Answers:</Text>
          {answers.map((answer, index) => (
            <View key={index} style={[styles.resultItem, { backgroundColor: theme.colors.card }]}>
              <View style={styles.resultHeader}>
                <Text style={[styles.resultQuestion, { color: theme.colors.text }]}>
                  {index + 1}. {answer.question}
                </Text>
                <View style={[
                  styles.resultBadge, 
                  { backgroundColor: answer.isCorrect ? '#E0F2E9' : '#FCEAEA' }
                ]}>
                  <Ionicons 
                    name={answer.isCorrect ? "checkmark-circle" : "close-circle"} 
                    size={16} 
                    color={answer.isCorrect ? '#4CAF50' : '#F44336'} 
                  />
                  <Text style={{ 
                    color: answer.isCorrect ? '#4CAF50' : '#F44336',
                    fontSize: 12,
                    fontWeight: 'bold',
                    marginLeft: 4
                  }}>
                    {answer.isCorrect ? 'Correct' : 'Incorrect'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.resultContent}>
                <Text style={[styles.resultAnswerLabel, { color: theme.colors.textSecondary }]}>
                  Your answer:
                </Text>
                <Text style={[
                  styles.resultAnswerText, 
                  { color: theme.colors.text },
                  answer.isCorrect ? styles.correctAnswer : styles.wrongAnswer
                ]}>
                  {answer.selected}
                </Text>
                
                {!answer.isCorrect && (
                  <View style={styles.correctAnswerContainer}>
                    <Text style={[styles.correctAnswerLabel, { color: theme.colors.textSecondary }]}>
                      Correct answer:
                    </Text>
                    <Text style={[styles.correctAnswerText, { color: '#4CAF50', fontWeight: '600' }]}>
                      {answer.correct}
                    </Text>
                  </View>
                )}
                
                {answer.feedback && (
                  <View style={[styles.feedbackBox, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.feedbackBoxTitle, { color: theme.colors.primary }]}>
                      Feedback
                    </Text>
                    <Text style={[styles.answerFeedback, { color: theme.colors.text }]}>
                      {answer.feedback}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
          
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitAssignmentButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                // Simple navigation back to the main tab navigator
                navigation.navigate('Home');
                // Short timeout to ensure we're back at the root before navigating to Assignments tab
                setTimeout(() => {
                  navigation.navigate('Assignments');
                }, 100);
              }}
            >
              <Text style={styles.submitAssignmentText}>Return to Assignments</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const question = questions[currentQuestion];
  const isCurrentQuestionTyped = isTypedQuestion(currentQuestion);
  
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
          <StatusBar barStyle="dark-content" />
          
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
            <View style={[styles.progressBar, { backgroundColor: '#E0E0E0' }]}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { 
                    width: progressAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    }),
                    backgroundColor: theme.colors.primary 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {currentQuestion + 1}/{questions.length}
            </Text>
          </View>
          
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.questionContainer, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.questionNumber, { color: theme.colors.primary }]}>
                Question {currentQuestion + 1}
              </Text>
              <Text style={[styles.questionText, { color: theme.colors.text }]}>
                {question.question}
              </Text>
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
                  onFocus={() => {
                    // Scroll to the input when focused
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 300);
                  }}
                  blurOnSubmit={false}
                />
                
                <TouchableOpacity 
                  style={[styles.dismissKeyboardButton, { backgroundColor: theme.colors.card }]}
                  onPress={() => Keyboard.dismiss()}
                >
                  <Text style={{ color: theme.colors.primary }}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.optionsContainer}>
                {question.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      { 
                        backgroundColor: selectedAnswer === option ? 
                          `${theme.colors.primary}15` : theme.colors.card,
                        borderColor: selectedAnswer === option ? 
                          theme.colors.primary : theme.colors.border 
                      }
                    ]}
                    onPress={() => handleSelectAnswer(option)}
                  >
                    <View style={styles.optionContent}>
                      <View style={[
                        styles.optionIndicator, 
                        { 
                          borderColor: selectedAnswer === option ? 
                            theme.colors.primary : theme.colors.border,
                          backgroundColor: selectedAnswer === option ? 
                            theme.colors.primary : 'transparent'
                        }
                      ]}>
                        {selectedAnswer === option && (
                          <Ionicons name="checkmark" size={16} color="white" />
                        )}
                      </View>
                      <Text style={[
                        styles.optionText,
                        { color: theme.colors.text },
                        selectedAnswer === option && { color: theme.colors.primary, fontWeight: '600' }
                      ]}>
                        {option}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <View style={styles.spacer} />
          </ScrollView>
          
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
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 10,
    marginLeft: 6,
  },
  headerTitle: {
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  timerWarning: {
    color: '#F44336',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  questionContainer: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500',
  },
  optionsContainer: {
    marginTop: 16,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1.5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  typedAnswerContainer: {
    marginTop: 16,
  },
  typedLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  typedInput: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    minHeight: 150,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  dismissKeyboardButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    marginRight: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  spacer: {
    height: 100,
  },
  footer: {
    padding: 16,
    paddingBottom: IS_IPHONE_X_OR_ABOVE ? 30 : 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'white',
  },
  nextButton: {
    padding: 16,
    borderRadius: 16,
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
  // Results screen styles
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: 20,
    paddingBottom: IS_IPHONE_X_OR_ABOVE ? 40 : 20,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreContainer: {
    width: '100%',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, 
    shadowRadius: 8,
    elevation: 3,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },
  scoreCircleText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  completionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  feedbackHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  feedbackText: {
    fontSize: 16,
    lineHeight: 24,
  },
  answersTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultItem: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  resultQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    paddingRight: 12,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultContent: {
    padding: 16,
  },
  resultAnswerLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  resultAnswerText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  correctAnswerContainer: {
    marginTop: 8,
  },
  correctAnswerLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  correctAnswerText: {
    fontSize: 16,
  },
  correctAnswer: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  wrongAnswer: {
    color: '#F44336',
    fontWeight: '500',
  },
  feedbackBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  feedbackBoxTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  answerFeedback: {
    fontSize: 14,
    lineHeight: 20,
  },
  submitAssignmentButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: IS_IPHONE_X_OR_ABOVE ? 20 : 10,
  },
  submitAssignmentText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AssignmentQuizScreen;