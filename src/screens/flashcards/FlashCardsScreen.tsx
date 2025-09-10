import React, { useState, useCallback, useEffect } from 'react';
import { Alert, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigations/types';
import { useTheme } from '../../hooks/useTheme';
import { Concept } from '../../types';
import { conceptService } from '../../storages/services/ConceptService';
import { studyRecordService } from '../../storages/services/StudyRecordService';
import {
  Container,
  Header,
  BackButton,
  BackButtonText,
  Title,
  HeaderSpacer,
  ProgressContainer,
  ProgressBarContainer,
  ProgressBar,
  ProgressText,
  CardContainer,
  FlashCard,
  CardContent,
  CardTitle,
  CardText,
  FlipButton,
  FlipButtonText,
  ButtonContainer,
  ActionButton,
  ActionButtonText,
  EmptyContainer,
  EmptyText,
  EmptySubText,
} from './FlashCardsScreen.style';

const { width } = Dimensions.get('window');

const FlashCardsScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadConcepts = useCallback(async () => {
    try {
      const allConcepts = await conceptService.getAllConcepts();
      setConcepts(allConcepts);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error('Error loading concepts:', error);
      Alert.alert('오류', '개념을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadConcepts();
    }, [loadConcepts]),
  );

  const currentConcept = concepts[currentIndex];
  const progress =
    concepts.length > 0 ? ((currentIndex + 1) / concepts.length) * 100 : 0;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = async (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!currentConcept) return;

    try {
      // 난이도를 정답률로 변환
      const correctness =
        difficulty === 'easy' ? 0.9 : difficulty === 'medium' ? 0.7 : 0.5;

      // 학습 기록 저장
      await studyRecordService.createStudyRecord({
        conceptId: currentConcept.id,
        correctness,
        studyType: 'flashcard',
      });

      if (currentIndex < concepts.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        // 모든 카드 완료
        Alert.alert('완료!', '모든 카드를 완료했습니다!', [
          {
            text: '다시 시작',
            onPress: () => {
              setCurrentIndex(0);
              setIsFlipped(false);
            },
          },
          {
            text: '홈으로',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error recording study:', error);
      Alert.alert('오류', '학습 기록 저장 중 오류가 발생했습니다.');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <Container theme={theme}>
          <EmptyContainer>
            <EmptyText theme={theme}>로딩 중...</EmptyText>
          </EmptyContainer>
        </Container>
      </SafeAreaView>
    );
  }

  if (concepts.length === 0) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <Container theme={theme}>
          <Header theme={theme}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <BackButton theme={theme}>
                <BackButtonText theme={theme}>←</BackButtonText>
              </BackButton>
            </TouchableOpacity>
            <Title theme={theme}>암기장</Title>
            <HeaderSpacer />
          </Header>
          <EmptyContainer>
            <EmptyText theme={theme}>📚</EmptyText>
            <EmptySubText theme={theme}>
              아직 등록된 개념이 없습니다.
            </EmptySubText>
            <EmptySubText theme={theme}>
              새로운 개념을 추가해보세요!
            </EmptySubText>
          </EmptyContainer>
        </Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Container theme={theme}>
        <Header theme={theme}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackButton theme={theme}>
              <BackButtonText theme={theme}>←</BackButtonText>
            </BackButton>
          </TouchableOpacity>
          <Title theme={theme}>암기장</Title>
          <HeaderSpacer />
        </Header>

        <ProgressContainer>
          <ProgressBarContainer theme={theme}>
            <ProgressBar theme={theme} progress={progress} />
          </ProgressBarContainer>
          <ProgressText theme={theme}>
            {currentIndex + 1} / {concepts.length}
          </ProgressText>
        </ProgressContainer>

        <CardContainer>
          <FlashCard theme={theme} isFlipped={isFlipped}>
            <CardContent>
              <CardTitle theme={theme}>{isFlipped ? '답' : '문제'}</CardTitle>
              <CardText theme={theme}>
                {isFlipped ? currentConcept.description : currentConcept.title}
              </CardText>
            </CardContent>
          </FlashCard>

          <FlipButton theme={theme} onPress={handleFlip}>
            <FlipButtonText theme={theme}>
              {isFlipped ? '문제 보기' : '답 보기'}
            </FlipButtonText>
          </FlipButton>
        </CardContainer>

        {isFlipped && (
          <ButtonContainer>
            <ActionButton
              theme={theme}
              color={theme.colors.success}
              onPress={() => handleNext('easy')}
            >
              <ActionButtonText theme={theme}>쉬움</ActionButtonText>
            </ActionButton>
            <ActionButton
              theme={theme}
              color={theme.colors.warning}
              onPress={() => handleNext('medium')}
            >
              <ActionButtonText theme={theme}>보통</ActionButtonText>
            </ActionButton>
            <ActionButton
              theme={theme}
              color={theme.colors.error}
              onPress={() => handleNext('hard')}
            >
              <ActionButtonText theme={theme}>어려움</ActionButtonText>
            </ActionButton>
          </ButtonContainer>
        )}

        {!isFlipped && currentIndex > 0 && (
          <ButtonContainer>
            <ActionButton
              theme={theme}
              color={theme.colors.text}
              onPress={handlePrevious}
            >
              <ActionButtonText theme={theme}>이전 카드</ActionButtonText>
            </ActionButton>
          </ButtonContainer>
        )}
      </Container>
    </SafeAreaView>
  );
};

export default FlashCardsScreen;
