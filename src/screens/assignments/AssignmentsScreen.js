import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  Keyboard,
  Platform,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../styles/theme';
import { subjectService } from '../../services/subjectService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as assignmentService from '../../services/assignmentService';
import { generateAIResponse } from '../../services/googleAI';
import { sampleQuestionsByTopic } from '../../data/sampleQuestions';

const { width, height } = Dimensions.get('window');
const IS_IPHONE_X_OR_ABOVE = Platform.OS === 'ios' && (height >= 812 || width >= 812);

const AssignmentsScreen = ({ navigation }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [subspaces, setSubspaces] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [loadingSubspaces, setLoadingSubspaces] = useState({});
  const [subspaceLastLoaded, setSubspaceLastLoaded] = useState({});
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [selectedSubspace, setSelectedSubspace] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const insets = useSafeAreaInsets();
  
  // Add a header logo reference
  const headerHeight = 60;

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setError(null);
    try {
      setLoading(true);
      const data = await subjectService.getSubjects();
      setSubjects(data || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
      setError(error.message || 'Failed to load subjects');
      Alert.alert('Error', error.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    setRefreshing(true);
    setSubspaces({});
    setSubspaceLastLoaded({});
    loadSubjects();
  };

  const loadSubspaces = async (subjectId) => {
    setError(null);
    try {
      setLoadingSubspaces(prev => ({ ...prev, [subjectId]: true }));
      
      const now = Date.now();
      const lastLoaded = subspaceLastLoaded[subjectId] || 0;
      const needsRefresh = (now - lastLoaded) > 5000; // 5 seconds
      
      if (needsRefresh || !subspaces[subjectId]) {
        console.log('Reloading subspaces for subject:', subjectId);
        const data = await subjectService.getSubspaces(subjectId);
        setSubspaces(prev => ({ ...prev, [subjectId]: data }));
        
        setSubspaceLastLoaded(prev => ({ ...prev, [subjectId]: now }));
      } else {
        console.log('Using cached subspaces for subject:', subjectId);
      }
    } catch (error) {
      console.error('Error loading subspaces:', error);
      setError(error.message || 'Failed to load subspaces');
      Alert.alert('Error', error.message || 'Failed to load subspaces');
    } finally {
      setLoadingSubspaces(prev => ({ ...prev, [subjectId]: false }));
    }
  };

  const handleSubspacePress = (subspace, subject) => {
    setSelectedSubspace(subspace);
    setSelectedSubject(subject);
    
    Alert.alert(
      "Create Assignment",
      `Would you like to create an assignment for "${subspace.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Use AI",
          onPress: () => {
            setCustomPrompt(`Generate 10 questions about ${subspace.name}:
- 6 multiple choice questions
- 2 true/false questions
- 2 written answer questions`);
            setAiModalVisible(true);
          }
        },
        {
          text: "Use Sample Questions",
          onPress: () => createAssignmentWithSampleQuestions(subspace, subject)
        }
      ]
    );
  };

  const createAssignmentWithSampleQuestions = async (subspace, subject) => {
    try {
      setLoading(true);
      
      // Get predefined questions for this topic if available, or use generic questions if not found
      let topicQuestions = sampleQuestionsByTopic[subspace.name] || 
        (sampleQuestionsByTopic["CNN"] || []); // Default to CNN questions if available
      
      if (topicQuestions.length === 0) {
        // If no predefined questions, create mock data
        topicQuestions = [
          {
            question: "What is the main purpose of a convolutional neural network?",
            type: "multiple_choice",
            options: [
              "Natural language processing",
              "Image recognition and classification",
              "Time series prediction",
              "Audio processing"
            ],
            correctAnswer: "Image recognition and classification",
            explanation: "CNNs are designed to automatically detect patterns in images."
          },
          {
            question: "Is backpropagation used in CNNs?",
            type: "true_false",
            correctAnswer: true,
            explanation: "Yes, backpropagation is used to update weights in CNNs."
          },
          {
            question: "Explain the concept of a kernel or filter in a CNN.",
            type: "written",
            correctAnswer: "A kernel or filter in a CNN is a small matrix used to apply convolution operations on input data, detecting features like edges or textures.",
            explanation: "A good answer should explain that kernels are weight matrices that slide across the input to create feature maps."
          }
        ];
      }
      
      // Create the assignment object
      const assignment = {
        id: Date.now().toString(),
        subspace_name: subspace.name,
        subject_id: subject.id,
        title: `${subspace.name} Assignment`,
        description: `Practice questions about ${subspace.name}`,
        questions: topicQuestions
      };
      
      // Navigate with the assignment data
      navigation.navigate('AssignmentQuiz', {
        assignment: assignment
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      Alert.alert("Error", "Failed to create assignment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateAIQuestions = async () => {
    if (!selectedSubspace || !selectedSubject) return;
    
    try {
      setGeneratingQuestions(true);
      
      // Build a more specific prompt that includes customizations if provided
      let topicSpecificPrompt = customPrompt ? 
        `${customPrompt} about the topic: ${selectedSubspace.name}` : 
        `Generate 10 specific and challenging questions about the topic: ${selectedSubspace.name}`;
        
      const prompt = `${topicSpecificPrompt}

IMPORTANT INSTRUCTIONS:
1. ALL questions MUST be DIRECTLY related to ${selectedSubspace.name} - do not generate generic questions or questions about unrelated topics
2. Create questions that demonstrate deep understanding of the topic
3. Include challenging questions that require application of knowledge 
4. Focus on important concepts, theories, and applications specific to ${selectedSubspace.name}

Include the following mix of question types:
- 6 multiple choice questions with 4 options each (make sure distractors are plausible but clearly incorrect)
- 2 true/false questions that focus on common misconceptions about ${selectedSubspace.name}
- 2 written answer questions that require detailed explanation about ${selectedSubspace.name}

Format the response EXACTLY as a valid JSON object with the following structure (and nothing else):
{
  "questions": [
    {
      "question": "Specific question about ${selectedSubspace.name}?",
      "type": "multiple_choice",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option that is correct",
      "explanation": "Brief explanation of the answer"
    },
    {
      "question": "Specific statement about ${selectedSubspace.name} that is either true or false",
      "type": "true_false",
      "correctAnswer": true,
      "explanation": "Explanation of why it is true"
    },
    {
      "question": "Specific question requiring detailed explanation about ${selectedSubspace.name}",
      "type": "written",
      "correctAnswer": "Sample answer that would be considered correct",
      "explanation": "What a good answer should include"
    }
  ]
}

IMPORTANT: Respond with ONLY the JSON object, no additional text before or after. Make sure the JSON is properly formatted, valid, and follows the exact structure specified above. Do not include code blocks, markdown formatting, or any explanatory text.`;

      // Call the AI API to generate questions
      console.log('Sending prompt to AI...');
      const aiResponse = await generateAIResponse(prompt);
      console.log('AI response received, length:', aiResponse?.length || 0);
      
      // Parse the AI response to extract JSON
      let questions;
      try {
        // Try to find JSON in the response or directly parse it
        let jsonString = aiResponse.trim();
        
        // If response contains markdown code blocks, extract the content
        if (jsonString.includes("```json")) {
          const startIdx = jsonString.indexOf("```json") + 7;
          const endIdx = jsonString.indexOf("```", startIdx);
          if (startIdx > 7 && endIdx > startIdx) {
            jsonString = jsonString.substring(startIdx, endIdx).trim();
          }
        } else if (jsonString.includes("```")) {
          const startIdx = jsonString.indexOf("```") + 3;
          const endIdx = jsonString.indexOf("```", startIdx);
          if (startIdx > 3 && endIdx > startIdx) {
            jsonString = jsonString.substring(startIdx, endIdx).trim();
          }
        }
        
        // Find json object if it's surrounded by text
        if (jsonString.indexOf('{') > 0 || jsonString.lastIndexOf('}') < jsonString.length - 1) {
          const jsonStartIndex = jsonString.indexOf('{');
          const jsonEndIndex = jsonString.lastIndexOf('}') + 1;
          
          if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
            jsonString = jsonString.substring(jsonStartIndex, jsonEndIndex);
          }
        }

        console.log('Attempting to parse JSON from response...');
        const parsedResponse = JSON.parse(jsonString);
        console.log('JSON parsed successfully');
        
        if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
          throw new Error('Response does not contain a questions array');
        }
        
        questions = parsedResponse.questions;
        
        // Validate question format
        const validQuestions = questions.filter(q => {
          if (!q.question || !q.type || !q.explanation) return false;
          if (q.type === 'multiple_choice' && (!Array.isArray(q.options) || q.options.length < 2)) return false;
          if (q.type === 'true_false' && typeof q.correctAnswer !== 'boolean') return false;
          if (q.type === 'written' && !q.correctAnswer) return false;
          return true;
        });
        
        if (validQuestions.length < questions.length) {
          console.warn(`Filtered out ${questions.length - validQuestions.length} invalid questions`);
          questions = validQuestions;
        }
        
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.error('AI response causing error:', aiResponse);
        Alert.alert(
          'Error', 
          'Failed to parse AI response into valid questions. Please try again or use sample questions instead.'
        );
        setGeneratingQuestions(false);
        return;
      }
      
      if (!questions || questions.length === 0) {
        Alert.alert('Error', 'No valid questions were generated. Please try again or use sample questions.');
        setGeneratingQuestions(false);
        return;
      }
      
      console.log(`Generated ${questions.length} questions successfully`);
      
      // Create assignment with AI-generated questions
      const assignment = {
        id: Date.now().toString(),
        subspace_name: selectedSubspace.name,
        subject_id: selectedSubject.id,
        title: `${selectedSubspace.name} Assignment`,
        description: `AI-generated questions about ${selectedSubspace.name}`,
        questions: questions
      };
      
      // Reset state and navigate
      setAiModalVisible(false);
      setCustomPrompt('');
      
      navigation.navigate('AssignmentQuiz', {
        assignment: assignment
      });
    } catch (error) {
      console.error('Error generating AI questions:', error);
      Alert.alert(
        'AI Generation Error', 
        `Failed to generate questions: ${error.message}. Please try again or use sample questions.`
      );
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleSubjectPress = (subjectId) => {
    const isExpanding = expandedSubject !== subjectId;
    setExpandedSubject(isExpanding ? subjectId : null);
    
    if (isExpanding) {
      loadSubspaces(subjectId);
    }
  };

  const renderSubject = ({ item }) => (
    <View style={styles.subjectCard}>
      <TouchableOpacity 
        style={styles.subjectHeader}
        onPress={() => handleSubjectPress(item.id)}
      >
        <View style={styles.subjectTitleContainer}>
          <View style={[
            styles.iconContainer, 
            { backgroundColor: expandedSubject === item.id ? `${colors.primary}20` : 'transparent' }
          ]}>
            <Ionicons
              name={expandedSubject === item.id ? 'book' : 'book-outline'}
              size={22}
              color={colors.primary}
            />
          </View>
          <Text style={styles.subjectTitle}>{item.name}</Text>
        </View>
        
        <View style={[
          styles.chevronContainer,
          { backgroundColor: expandedSubject === item.id ? `${colors.primary}15` : 'transparent' }
        ]}>
          <Ionicons
            name={expandedSubject === item.id ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={expandedSubject === item.id ? colors.primary : colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {expandedSubject === item.id && (
        <View style={styles.subspacesList}>
          {loadingSubspaces[item.id] ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={styles.loadingSubspacesText}>Loading topics...</Text>
            </View>
          ) : subspaces[item.id]?.length > 0 ? (
            subspaces[item.id].map(subspace => (
              <TouchableOpacity
                key={subspace.id}
                style={styles.subspaceItem}
                onPress={() => handleSubspacePress(subspace, item)}
              >
                <View style={styles.subspaceContent}>
                  <View style={styles.subspaceIconContainer}>
                    <Ionicons name="document-text-outline" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.subspaceName}>{subspace.name}</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptySubspacesContainer}>
              <Ionicons name="alert-circle-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.noSubspacesText}>No topics available</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingOverlay}>
        <View style={styles.loaderCard}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading assignments...</Text>
        </View>
      </View>
    );
  }

  if (subjects.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No assignments available</Text>
        <Text style={styles.emptySubtitle}>
          Select a subject and topic to create an assignment
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Premium Header */}
      <View style={[
        styles.header, 
        { 
          paddingTop: insets.top + 12,
          height: headerHeight + insets.top 
        }
      ]}>
        <Text style={styles.headerTitle}>Assignments</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={subjects}
        renderItem={renderSubject}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 20 }
        ]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            progressViewOffset={IS_IPHONE_X_OR_ABOVE ? 20 : 0}
          />
        }
        showsVerticalScrollIndicator={false}
      />
      
      {/* AI Question Generation Modal */}
      <Modal
        visible={aiModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAiModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
            style={styles.modalOverlay}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={IS_IPHONE_X_OR_ABOVE ? 40 : 20}
          >
            <View style={[
              styles.modalContainer, 
              {
                marginTop: insets.top,
                marginBottom: insets.bottom + 20
              }
            ]}>
              <View style={styles.modalIndicator} />
              
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Generate AI Questions</Text>
                  <TouchableOpacity 
                    onPress={() => setAiModalVisible(false)}
                    disabled={generatingQuestions}
                    style={styles.closeButton}
                    hitSlop={{top: 15, right: 15, bottom: 15, left: 15}}
                  >
                    <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.modalSubtitle}>
                  Customize your request to generate questions
                </Text>
                
                <View style={styles.promptInputContainer}>
                  <TextInput
                    style={styles.promptInput}
                    multiline
                    value={customPrompt}
                    onChangeText={setCustomPrompt}
                    placeholder="Describe what questions you want to generate..."
                    placeholderTextColor={colors.textSecondary}
                    autoFocus={true}
                    keyboardType="default"
                    returnKeyType="default"
                    blurOnSubmit={false}
                  />
                </View>
                
                {Platform.OS === 'ios' && (
                  <TouchableOpacity 
                    style={styles.keyboardDismissButton}
                    onPress={() => Keyboard.dismiss()}
                  >
                    <Text style={styles.keyboardDismissText}>Done</Text>
                  </TouchableOpacity>
                )}
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setAiModalVisible(false)}
                    disabled={generatingQuestions}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.modalButton, 
                      styles.generateButton,
                      customPrompt.trim().length < 10 && styles.disabledButton
                    ]}
                    onPress={generateAIQuestions}
                    disabled={generatingQuestions || customPrompt.trim().length < 10}
                  >
                    {generatingQuestions ? (
                      <View style={styles.loadingButtonContent}>
                        <ActivityIndicator color="#FFFFFF" size="small" />
                        <Text style={[styles.generateButtonText, {marginLeft: 8}]}>
                          Generating...
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <Ionicons name="create-outline" size={18} color="#FFFFFF" style={{marginRight: 6}} />
                        <Text style={styles.generateButtonText}>Generate</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    zIndex: 10,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  refreshButton: {
    padding: 6,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    minWidth: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  list: {
    padding: 16,
    paddingTop: 12,
  },
  subjectCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  subjectTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  subspacesList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 8,
  },
  subspaceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  subspaceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subspaceIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(82, 130, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subspaceName: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingSubspacesText: {
    marginLeft: 10,
    color: colors.textSecondary,
    fontSize: 14,
  },
  emptySubspacesContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSubspacesText: {
    marginTop: 8,
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 15,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: '85%',
  },
  modalIndicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#DDD',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  modalContent: {
    padding: 20,
    paddingBottom: IS_IPHONE_X_OR_ABOVE ? 36 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 2,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  promptInputContainer: {
    backgroundColor: '#F9F9FA',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 16,
    marginBottom: 16,
  },
  promptInput: {
    padding: 16,
    minHeight: 150,
    maxHeight: 300,
    fontSize: 16,
    color: colors.text,
    textAlignVertical: 'top',
  },
  keyboardDismissButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  keyboardDismissText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#F0F0F5',
  },
  generateButton: {
    backgroundColor: colors.primary,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AssignmentsScreen; 