import React, { useState, useCallback } from 'react';
import {
  FlatList,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigations/types';
import { useTheme } from '../../hooks/useTheme';
import { Concept, ForgettingCurveData } from '../../types';
import { conceptService } from '../../storages/services/ConceptService';
import { studyRecordService } from '../../storages/services/StudyRecordService';
import Routes from '../../navigations/routes';
import {
  Container,
  Header,
  BackButton,
  BackButtonText,
  HeaderContent,
  Title,
  Subtitle,
  HeaderSpacer,
  ConceptItem,
  ConceptHeader,
  ConceptTitle,
  ConceptCategory,
  ConceptDescription,
  ConceptFooter,
  ConceptDate,
  ForgettingRate,
  ForgettingRateText,
  UrgencyBadge,
  UrgencyText,
  StudyButton,
  StudyButtonText,
  EmptyContainer,
  EmptyText,
  EmptySubText,
  InfoContainer,
  InfoText,
} from './ForgettingConceptsScreen.style';

interface ConceptWithForgetting extends Concept {
  forgettingRate: number;
  lastStudied?: string;
  daysUntilForgotten?: number;
}

const ForgettingConceptsScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [forgettingConcepts, setForgettingConcepts] = useState<
    ConceptWithForgetting[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadForgettingConcepts = useCallback(async () => {
    try {
      // 망각곡선 데이터 가져오기
      const forgettingData = await studyRecordService.getForgettingCurveData();

      // 망각률이 60% 이상인 개념들만 필터링
      const almostForgottenData = forgettingData.filter(
        data => data.forgettingRate >= 0.6,
      );

      // 각 개념의 상세 정보 가져오기
      const conceptsWithForgetting: ConceptWithForgetting[] = [];

      for (const data of almostForgottenData) {
        const concept = await conceptService.getConceptById(data.conceptId);
        if (concept) {
          conceptsWithForgetting.push({
            ...concept,
            forgettingRate: data.forgettingRate,
            lastStudied: data.lastStudied,
            daysUntilForgotten: data.daysUntilForgotten,
          });
        }
      }

      // 망각률 순으로 정렬 (높은 순)
      conceptsWithForgetting.sort(
        (a, b) => b.forgettingRate - a.forgettingRate,
      );

      setForgettingConcepts(conceptsWithForgetting);
    } catch (error) {
      console.error('Error loading forgetting concepts:', error);
      Alert.alert('오류', '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadForgettingConcepts();
    }, [loadForgettingConcepts]),
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadForgettingConcepts();
  }, [loadForgettingConcepts]);

  const handleConceptPress = (concept: ConceptWithForgetting) => {
    navigation.navigate(Routes.ConceptDetail, {
      conceptId: concept.id,
      mode: 'edit',
    });
  };

  const handleStudyNow = async (concept: ConceptWithForgetting) => {
    try {
      // 학습 기록 저장 (기본적으로 medium 난이도로 설정)
      await studyRecordService.createStudyRecord({
        conceptId: concept.id,
        correctness: 0.7, // medium 난이도에 해당하는 정답률
        studyType: 'review',
      });

      Alert.alert('학습 완료', '학습이 기록되었습니다!', [
        {
          text: '확인',
          onPress: () => {
            // 데이터 새로고침
            loadForgettingConcepts();
          },
        },
      ]);
    } catch (error) {
      console.error('Error recording study:', error);
      Alert.alert('오류', '학습 기록 저장 중 오류가 발생했습니다.');
    }
  };

  const getUrgencyLevel = (forgettingRate: number) => {
    if (forgettingRate >= 0.9)
      return {
        level: 'critical',
        text: '매우 위험',
        color: theme.colors.error,
      };
    if (forgettingRate >= 0.8)
      return { level: 'high', text: '위험', color: theme.colors.warning };
    if (forgettingRate >= 0.7)
      return { level: 'medium', text: '주의', color: theme.colors.info };
    return { level: 'low', text: '보통', color: theme.colors.success };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '학습 기록 없음';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  const formatForgettingRate = (rate: number) => {
    return `${Math.round(rate * 100)}%`;
  };

  const renderConceptItem = ({ item }: { item: ConceptWithForgetting }) => {
    const urgency = getUrgencyLevel(item.forgettingRate);

    return (
      <ConceptItem theme={theme} onPress={() => handleConceptPress(item)}>
        <ConceptHeader>
          <ConceptTitle theme={theme}>{item.title}</ConceptTitle>
          <UrgencyBadge theme={theme} color={urgency.color}>
            <UrgencyText theme={theme}>{urgency.text}</UrgencyText>
          </UrgencyBadge>
        </ConceptHeader>

        {item.category && (
          <ConceptCategory theme={theme}>#{item.category}</ConceptCategory>
        )}

        <ConceptDescription theme={theme} numberOfLines={2}>
          {item.description}
        </ConceptDescription>

        <ConceptFooter>
          <ConceptDate theme={theme}>
            마지막 학습: {formatDate(item.lastStudied)}
          </ConceptDate>
          <ForgettingRate theme={theme} urgency={urgency.level}>
            <ForgettingRateText theme={theme}>
              망각률: {formatForgettingRate(item.forgettingRate)}
            </ForgettingRateText>
          </ForgettingRate>
        </ConceptFooter>

        <StudyButton theme={theme} onPress={() => handleStudyNow(item)}>
          <StudyButtonText theme={theme}>지금 복습하기</StudyButtonText>
        </StudyButton>
      </ConceptItem>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Container theme={theme}>
        <Header theme={theme}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackButton theme={theme}>
              <BackButtonText theme={theme}>←</BackButtonText>
            </BackButton>
          </TouchableOpacity>
          <HeaderContent>
            <Title theme={theme}>거의 잊혀져가는 개념</Title>
            <Subtitle theme={theme}>
              망각률이 높은 개념들을 복습해보세요
            </Subtitle>
          </HeaderContent>
          <HeaderSpacer />
        </Header>

        <InfoContainer theme={theme}>
          <InfoText theme={theme}>
            💡 망각률이 60% 이상인 개념들만 표시됩니다
          </InfoText>
        </InfoContainer>

        {forgettingConcepts.length === 0 ? (
          <EmptyContainer>
            <EmptyText theme={theme}>🎉</EmptyText>
            <EmptySubText theme={theme}>
              잊혀져가는 개념이 없습니다!
            </EmptySubText>
            <EmptySubText theme={theme}>
              모든 개념을 잘 기억하고 있어요.
            </EmptySubText>
          </EmptyContainer>
        ) : (
          <FlatList
            data={forgettingConcepts}
            renderItem={renderConceptItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </Container>
    </SafeAreaView>
  );
};

export default ForgettingConceptsScreen;
