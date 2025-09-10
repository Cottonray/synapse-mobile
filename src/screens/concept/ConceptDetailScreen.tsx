import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Concept } from '../../types';
import {
  conceptService,
  CreateConceptData,
} from '../../storages/services/ConceptService';
import {
  Container,
  Header,
  HeaderTitle,
  HeaderButton,
  HeaderButtonText,
  FormSection,
  Label,
  TextInput,
  TextArea,
  PickerContainer,
  PickerLabel,
  TagContainer,
  TagInput,
  TagList,
  TagItem,
  TagText,
  RemoveTagButton,
  DifficultySelector,
  DifficultyOption,
  DifficultyText,
  PrioritySlider,
  PriorityLabel,
  SaveButton,
  SaveButtonText,
  LoadingContainer,
  LoadingText,
  CategoryHeader,
  AddCategoryButton,
  AddCategoryText,
  AddCategoryInput,
  CategoryInput,
  CategoryActionButton,
  CategoryActionText,
} from './ConceptDetailScreen.style';

type RootStackParamList = {
  ConceptDetail: {
    conceptId?: string;
    mode: 'create' | 'edit';
  };
};

type ConceptDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'ConceptDetail'
>;
type ConceptDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ConceptDetail'
>;

// 기본 카테고리는 빈 배열로 시작 (DB에서 로드)
const DEFAULT_CATEGORIES = ['기타']; // 최소한 하나는 있어야 함

const DIFFICULTIES: Array<'easy' | 'medium' | 'hard'> = [
  'easy',
  'medium',
  'hard',
];

const DIFFICULTY_LABELS = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
};

const ConceptDetailScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const route = useRoute<ConceptDetailScreenRouteProp>();
  const navigation = useNavigation<ConceptDetailScreenNavigationProp>();

  const { conceptId, mode } = route.params;
  const isEditMode = mode === 'edit' && conceptId;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 카테고리 관련 상태
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // 폼 상태
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    'medium',
  );
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [priority, setPriority] = useState(3);
  const [estimatedStudyTime, setEstimatedStudyTime] = useState('');

  useEffect(() => {
    loadCategories();
    if (isEditMode) {
      loadConcept();
    }
  }, [isEditMode, conceptId]);

  const loadCategories = async () => {
    try {
      const dbCategories = await conceptService.getCategories();
      if (dbCategories.length > 0) {
        setCategories(dbCategories);
        if (!category && !isEditMode) {
          setCategory(dbCategories[0]);
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // DB에서 로드 실패시 기본 카테고리 사용
      setCategories(DEFAULT_CATEGORIES);
      if (!category && !isEditMode) {
        setCategory(DEFAULT_CATEGORIES[0]);
      }
    }
  };

  const loadConcept = async () => {
    if (!conceptId) return;

    setIsLoading(true);
    try {
      const concept = await conceptService.getConceptById(conceptId);
      if (concept) {
        setTitle(concept.title);
        setSubtitle(concept.subtitle || '');
        setContent(concept.content);
        setCategory(concept.category);
        setDifficulty(concept.difficulty);
        setTags(concept.tags);
        setPriority(concept.priority);
        setEstimatedStudyTime(concept.estimatedStudyTime?.toString() || '');
      }
    } catch (error) {
      console.error('Error loading concept:', error);
      Alert.alert('오류', '개념을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddCategory = async () => {
    if (!newCategoryInput.trim()) {
      Alert.alert('오류', '카테고리 이름을 입력해주세요.');
      return;
    }

    if (categories.includes(newCategoryInput.trim())) {
      Alert.alert('오류', '이미 존재하는 카테고리입니다.');
      return;
    }

    const newCategory = newCategoryInput.trim();
    setCategories(prev => [...prev, newCategory]);
    setCategory(newCategory);
    setNewCategoryInput('');
    setShowAddCategory(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('오류', '제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('오류', '내용을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const conceptData: CreateConceptData = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        content: content.trim(),
        category,
        difficulty,
        tags,
        priority,
        estimatedStudyTime: estimatedStudyTime
          ? parseInt(estimatedStudyTime)
          : undefined,
      };

      if (isEditMode && conceptId) {
        await conceptService.updateConcept({
          id: conceptId,
          ...conceptData,
        });
        Alert.alert('성공', '개념이 수정되었습니다.');
      } else {
        await conceptService.createConcept(conceptData);
        Alert.alert('성공', '새로운 개념이 추가되었습니다.');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving concept:', error);
      Alert.alert('오류', '개념을 저장하는 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!isEditMode || !conceptId) return;

    Alert.alert(
      '개념 삭제',
      '이 개념을 정말 삭제하시겠습니까? 관련된 모든 학습 기록도 함께 삭제됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await conceptService.deleteConcept(conceptId);
              Alert.alert('삭제 완료', '개념이 삭제되었습니다.');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting concept:', error);
              Alert.alert('오류', '개념을 삭제하는 중 오류가 발생했습니다.');
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <Container theme={theme}>
        <LoadingContainer>
          <LoadingText theme={theme}>개념을 불러오는 중...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Container theme={theme}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Header theme={theme}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <HeaderButton theme={theme}>
                <HeaderButtonText theme={theme}>취소</HeaderButtonText>
              </HeaderButton>
            </TouchableOpacity>

            <HeaderTitle theme={theme}>
              {isEditMode ? '개념 편집' : '새 개념'}
            </HeaderTitle>

            {isEditMode && (
              <TouchableOpacity onPress={handleDelete}>
                <HeaderButton theme={theme}>
                  <HeaderButtonText theme={theme} color={theme.colors.error}>
                    삭제
                  </HeaderButtonText>
                </HeaderButton>
              </TouchableOpacity>
            )}
          </Header>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <FormSection theme={theme}>
              <Label theme={theme}>제목 *</Label>
              <TextInput
                theme={theme}
                value={title}
                onChangeText={setTitle}
                placeholder="개념의 제목을 입력하세요"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </FormSection>

            <FormSection theme={theme}>
              <Label theme={theme}>부제목</Label>
              <TextInput
                theme={theme}
                value={subtitle}
                onChangeText={setSubtitle}
                placeholder="부제목을 입력하세요 (선택사항)"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </FormSection>

            <FormSection theme={theme}>
              <Label theme={theme}>내용 *</Label>
              <TextArea
                theme={theme}
                value={content}
                onChangeText={setContent}
                placeholder="개념의 상세 내용을 입력하세요"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </FormSection>

            <FormSection theme={theme}>
              <CategoryHeader>
                <Label theme={theme}>카테고리</Label>
                <AddCategoryButton
                  theme={theme}
                  onPress={() => setShowAddCategory(!showAddCategory)}
                >
                  <AddCategoryText theme={theme}>+</AddCategoryText>
                  <AddCategoryText theme={theme}>추가</AddCategoryText>
                </AddCategoryButton>
              </CategoryHeader>

              {showAddCategory && (
                <AddCategoryInput theme={theme}>
                  <CategoryInput
                    theme={theme}
                    value={newCategoryInput}
                    onChangeText={setNewCategoryInput}
                    placeholder="새 카테고리 이름"
                    placeholderTextColor={theme.colors.textSecondary}
                    autoFocus
                  />
                  <CategoryActionButton
                    theme={theme}
                    variant="confirm"
                    onPress={handleAddCategory}
                  >
                    <CategoryActionText theme={theme}>추가</CategoryActionText>
                  </CategoryActionButton>
                  <CategoryActionButton
                    theme={theme}
                    variant="cancel"
                    onPress={() => {
                      setShowAddCategory(false);
                      setNewCategoryInput('');
                    }}
                  >
                    <CategoryActionText theme={theme}>취소</CategoryActionText>
                  </CategoryActionButton>
                </AddCategoryInput>
              )}

              <PickerContainer theme={theme}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={{
                      padding: 12,
                      backgroundColor:
                        category === cat
                          ? theme.colors.primary + '20'
                          : 'transparent',
                      borderRadius: 8,
                      margin: 4,
                    }}
                  >
                    <PickerLabel theme={theme} selected={category === cat}>
                      {cat}
                    </PickerLabel>
                  </TouchableOpacity>
                ))}
              </PickerContainer>
            </FormSection>

            <FormSection theme={theme}>
              <Label theme={theme}>난이도</Label>
              <DifficultySelector>
                {DIFFICULTIES.map(diff => (
                  <TouchableOpacity
                    key={diff}
                    onPress={() => setDifficulty(diff)}
                  >
                    <DifficultyOption
                      theme={theme}
                      selected={difficulty === diff}
                    >
                      <DifficultyText
                        theme={theme}
                        selected={difficulty === diff}
                      >
                        {DIFFICULTY_LABELS[diff]}
                      </DifficultyText>
                    </DifficultyOption>
                  </TouchableOpacity>
                ))}
              </DifficultySelector>
            </FormSection>

            <FormSection theme={theme}>
              <Label theme={theme}>태그</Label>
              <TagContainer>
                <TagInput
                  theme={theme}
                  value={tagInput}
                  onChangeText={setTagInput}
                  placeholder="태그를 입력하고 Enter를 누르세요"
                  placeholderTextColor={theme.colors.textSecondary}
                  onSubmitEditing={handleAddTag}
                  returnKeyType="done"
                />
              </TagContainer>
              <TagList>
                {tags.map((tag, index) => (
                  <TagItem key={index} theme={theme}>
                    <TagText theme={theme}>#{tag}</TagText>
                    <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                      <RemoveTagButton theme={theme}>×</RemoveTagButton>
                    </TouchableOpacity>
                  </TagItem>
                ))}
              </TagList>
            </FormSection>

            <FormSection theme={theme}>
              <PriorityLabel theme={theme}>우선순위: {priority}</PriorityLabel>
              <PrioritySlider
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={priority}
                onValueChange={setPriority}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
              />
            </FormSection>

            <FormSection theme={theme}>
              <Label theme={theme}>예상 학습 시간 (분)</Label>
              <TextInput
                theme={theme}
                value={estimatedStudyTime}
                onChangeText={setEstimatedStudyTime}
                placeholder="예상 학습 시간을 분 단위로 입력하세요"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </FormSection>

            <SaveButton theme={theme} onPress={handleSave} disabled={isSaving}>
              <SaveButtonText theme={theme}>
                {isSaving ? '저장 중...' : isEditMode ? '수정하기' : '추가하기'}
              </SaveButtonText>
            </SaveButton>
          </ScrollView>
        </KeyboardAvoidingView>
      </Container>
    </SafeAreaView>
  );
};

export default ConceptDetailScreen;
