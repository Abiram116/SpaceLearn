import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Alert,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../styles/theme';
import { getAssignmentById } from '../services/assignmentService';

const { width } = Dimensions.get('window');

const AssignmentQuizScreen = ({ route, navigation }) => {
  const { assignment } = route.params;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showAnswerExplanation, setShowAnswerExplanation] = useState(false);
  
  const flatListRef = useRef(null);
  
  useEffect(() => {
    // Initialize answers array
    if (assignment && assignment.questions) {
      const initialAnswers = assignment.questions.map(() => ({
        answer: null,
        isCorrect: false,
        submitted: false
      }));
      setUserAnswers(initialAnswers);
    }
  }, [assignment]);
  
  useEffect(() => {
    console.log('Assignment data loaded:', assignment?.title || 'No title');
    console.log('Number of questions:', assignment?.questions?.length || 0);
    if (assignment?.questions?.length > 0) {
      console.log('Question types:', assignment.questions.map(q => q.type).join(', '));
    }
  }, [assignment]);
  
  const handleAnswer = (answer) => {
    const currentQuestion = assignment.questions[currentQuestionIndex];
    const isCorrect = 
      currentQuestion.type === 'written' 
        ? null // Written answers need manual evaluation
        : (currentQuestion.type === 'true_false' 
           ? answer === currentQuestion.correctAnswer 
           : answer === currentQuestion.correctAnswer);
    
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = {
      answer,
      isCorrect,
      submitted: true
    };
    setUserAnswers(updatedAnswers);
    
    // For text input, clear the field
    if (assignment.questions[currentQuestionIndex].type === 'written') {
      setTextInput('');
    }
    
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < assignment.questions.length - 1) {
        goToNextQuestion();
      }
    }, 500);
  };
  
  const goToNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setShowAnswerExplanation(false);
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
      setShowAnswerExplanation(false);
    }
  };
  
  const handleTextInputSubmit = () => {
    if (textInput.trim()) {
      handleAnswer(textInput.trim());
    }
  };
  
  const handleSubmit = () => {
    // Check if all questions are answered
    const unansweredCount = userAnswers.filter(a => !a.submitted).length;
    if (unansweredCount > 0) {
      Alert.alert(
        'Incomplete Assignment',
        `You have ${unansweredCount} unanswered questions. Do you want to continue?`,
        [
          {
            text: 'Continue Answering',
            style: 'cancel'
          },
          {
            text: 'Submit Anyway',
            onPress: () => submitAssignment()
          }
        ]
      );
    } else {
      submitAssignment();
    }
  };
  
  const submitAssignment = async () => {
    setLoading(true);
    try {
      // Calculate score - only for multiple choice and true/false
      let correctCount = 0;
      let totalGraded = 0;
      
      assignment.questions.forEach((question, index) => {
        if (question.type !== 'written') {
          totalGraded++;
          if (userAnswers[index]?.isCorrect) {
            correctCount++;
          }
        }
      });
      
      const scorePercentage = totalGraded > 0 
        ? Math.round((correctCount / totalGraded) * 100) 
        : 0;
      
      setScore(scorePercentage);
      setSubmitted(true);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      Alert.alert('Error', 'Failed to submit assignment');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !showResults) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (!assignment || !assignment.questions) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No assignment data available</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (showResults) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Assignments')}
          >
            <Ionicons name="close" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.title}>Assignment Results</Text>
        </View>
        
        <ScrollView style={styles.resultsContainer}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Your Score</Text>
            <Text style={styles.scoreValue}>{score}%</Text>
            {score >= 70 ? (
              <Text style={[styles.scoreFeedback, { color: '#4CAF50' }]}>Great job!</Text>
            ) : score >= 50 ? (
              <Text style={[styles.scoreFeedback, { color: '#FF9800' }]}>Good effort!</Text>
            ) : (
              <Text style={[styles.scoreFeedback, { color: '#F44336' }]}>Keep practicing!</Text>
            )}
          </View>
          
          <Text style={styles.resultsHeading}>Question Review</Text>
          
          {assignment.questions.map((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = question.type !== 'written' && userAnswer?.isCorrect;
            const isWrong = question.type !== 'written' && userAnswer?.submitted && !isCorrect;
            
            return (
              <View key={index} style={styles.resultItem}>
                <Text style={styles.resultQuestion}>
                  {index + 1}. {question.question}
                </Text>
                
                <View style={styles.resultAnswerContainer}>
                  <Text style={styles.resultLabel}>Your Answer:</Text>
                  <Text style={[
                    styles.resultAnswer,
                    isCorrect && styles.correctAnswer,
                    isWrong && styles.wrongAnswer
                  ]}>
                    {userAnswer?.answer !== null && userAnswer?.answer !== undefined 
                      ? (question.type === 'true_false' 
                         ? String(userAnswer.answer) 
                         : userAnswer.answer)
                      : 'Not answered'}
                  </Text>
                </View>
                
                {question.type !== 'written' && (
                  <View style={styles.resultAnswerContainer}>
                    <Text style={styles.resultLabel}>Correct Answer:</Text>
                    <Text style={styles.correctAnswer}>
                      {question.type === 'true_false' 
                       ? String(question.correctAnswer) 
                       : question.correctAnswer}
                    </Text>
                  </View>
                )}
                
                <View style={styles.resultExplanationContainer}>
                  <Text style={styles.resultLabel}>Explanation:</Text>
                  <Text style={styles.resultExplanation}>{question.explanation}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
        
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitAssignmentButton}
            onPress={() => navigation.navigate('Assignments')}
          >
            <Text style={styles.submitAssignmentText}>Return to Assignments</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const currentQuestion = assignment.questions[currentQuestionIndex];
  
  const renderQuestion = ({ item, index }) => {
    const isActive = index === currentQuestionIndex;
    const userAnswer = userAnswers[index];
    const isSubmittedQuestion = userAnswer?.submitted;
    
    return (
      <View style={[styles.questionContainer, { width }]}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>Question {index + 1}/{assignment.questions.length}</Text>
          <Text style={styles.questionType}>
            {item.type === 'multiple_choice' ? 'Multiple Choice' : 
             item.type === 'true_false' ? 'True/False' : 'Written Answer'}
          </Text>
        </View>
        
        <ScrollView style={styles.questionScroll}>
          <Text style={styles.questionText}>{item.question}</Text>
          
          {/* Multiple Choice Questions */}
          {item.type === 'multiple_choice' && (
            <View style={styles.optionsContainer}>
              {item.options.map((option, optionIndex) => (
                <TouchableOpacity
                  key={optionIndex}
                  style={[
                    styles.optionButton,
                    userAnswer?.answer === option && styles.selectedOption,
                    isSubmittedQuestion && option === item.correctAnswer && styles.correctOptionHighlight
                  ]}
                  onPress={() => handleAnswer(option)}
                  disabled={userAnswer?.submitted}
                >
                  <Text style={[
                    styles.optionText,
                    userAnswer?.answer === option && styles.selectedOptionText,
                    isSubmittedQuestion && option === item.correctAnswer && styles.correctOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {/* True/False Questions */}
          {item.type === 'true_false' && (
            <View style={styles.trueFalseContainer}>
              <TouchableOpacity
                style={[
                  styles.trueFalseButton,
                  userAnswer?.answer === true && styles.selectedOption,
                  isSubmittedQuestion && item.correctAnswer === true && styles.correctOptionHighlight
                ]}
                onPress={() => handleAnswer(true)}
                disabled={userAnswer?.submitted}
              >
                <Text style={[
                  styles.trueFalseText,
                  userAnswer?.answer === true && styles.selectedOptionText,
                  isSubmittedQuestion && item.correctAnswer === true && styles.correctOptionText
                ]}>
                  True
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.trueFalseButton,
                  userAnswer?.answer === false && styles.selectedOption,
                  isSubmittedQuestion && item.correctAnswer === false && styles.correctOptionHighlight
                ]}
                onPress={() => handleAnswer(false)}
                disabled={userAnswer?.submitted}
              >
                <Text style={[
                  styles.trueFalseText,
                  userAnswer?.answer === false && styles.selectedOptionText,
                  isSubmittedQuestion && item.correctAnswer === false && styles.correctOptionText
                ]}>
                  False
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Written Answer Questions */}
          {item.type === 'written' && (
            <View style={styles.writtenContainer}>
              <TextInput
                style={styles.writtenInput}
                placeholder="Type your answer..."
                multiline
                value={isActive ? textInput : userAnswer?.answer || ''}
                onChangeText={isActive ? setTextInput : () => {}}
                editable={isActive && !userAnswer?.submitted}
              />
              {isActive && !userAnswer?.submitted && (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleTextInputSubmit}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {/* Show explanation after answering */}
          {isSubmittedQuestion && showAnswerExplanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explanation</Text>
              <Text style={styles.explanationText}>{item.explanation}</Text>
            </View>
          )}
          
          {isSubmittedQuestion && (
            <TouchableOpacity
              style={styles.explanationToggle}
              onPress={() => setShowAnswerExplanation(!showAnswerExplanation)}
            >
              <Text style={styles.explanationToggleText}>
                {showAnswerExplanation ? 'Hide Explanation' : 'Show Explanation'}
              </Text>
              <Ionicons
                name={showAnswerExplanation ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{assignment.title || assignment.subspace_name}</Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={assignment.questions}
        renderItem={renderQuestion}
        keyExtractor={(_, index) => `question-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentQuestionIndex(newIndex);
        }}
        initialScrollIndex={currentQuestionIndex}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
      
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
          onPress={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Ionicons name="chevron-back" size={24} color={currentQuestionIndex === 0 ? "#AAAAAA" : "#000000"} />
          <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.disabledText]}>Previous</Text>
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          {assignment.questions.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.progressDot,
                index === currentQuestionIndex && styles.activeDot,
                userAnswers[index]?.submitted && styles.answeredDot
              ]}
              onPress={() => {
                setCurrentQuestionIndex(index);
                flatListRef.current?.scrollToIndex({ index, animated: true });
              }}
            />
          ))}
        </View>
        
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === assignment.questions.length - 1 && styles.disabledButton]}
          onPress={goToNextQuestion}
          disabled={currentQuestionIndex === assignment.questions.length - 1}
        >
          <Text style={[styles.navButtonText, currentQuestionIndex === assignment.questions.length - 1 && styles.disabledText]}>Next</Text>
          <Ionicons name="chevron-forward" size={24} color={currentQuestionIndex === assignment.questions.length - 1 ? "#AAAAAA" : "#000000"} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitAssignmentButton}
          onPress={handleSubmit}
          disabled={submitted}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitAssignmentText}>Submit Assignment</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 16,
  },
  questionContainer: {
    flex: 1,
    padding: 16,
  },
  questionScroll: {
    flex: 1,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  questionType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  questionText: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 24,
  },
  optionsContainer: {
    marginTop: 16,
  },
  optionButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  optionText: {
    fontSize: 16,
    color: '#000000',
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  correctOptionHighlight: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  correctOptionText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  trueFalseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  trueFalseButton: {
    width: '45%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  trueFalseText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  writtenContainer: {
    marginTop: 16,
  },
  writtenInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#000000',
  },
  explanationContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB74D',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  explanationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 8,
  },
  explanationToggleText: {
    color: colors.primary,
    marginRight: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#AAAAAA',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#007AFF',
    width: 12,
    height: 12,
  },
  answeredDot: {
    backgroundColor: '#4CAF50',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitAssignmentButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitAssignmentText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreTitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  scoreFeedback: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultsHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  resultItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resultQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  resultAnswerContainer: {
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  resultAnswer: {
    fontSize: 16,
    color: '#000000',
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  correctAnswer: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  wrongAnswer: {
    color: '#F44336',
    fontWeight: '500',
  },
  resultExplanationContainer: {
    marginTop: 12,
  },
  resultExplanation: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF0000',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default AssignmentQuizScreen;