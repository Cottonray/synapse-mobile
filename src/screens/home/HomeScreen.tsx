import React, { useState, useCallback } from 'react';
import { ScrollView, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigations/types';
import { useTheme } from '../../hooks/useTheme';
import {
  HomeCard as HomeCardType,
  Concept,
  ForgettingCurveData,
} from '../../types';
import { conceptService } from '../../storages/services/ConceptService';
import { studyRecordService } from '../../storages/services/StudyRecordService';
import HomeCard from '../../components/HomeCard';
import FavoriteConceptItem from '../../components/FavoriteConceptItem';
import FloatingActionButton from '../../components/FloatingActionButton';
import Routes from '../../navigations/routes';
import {
  Container,
  Header,
  Title,
  Welcome,
  CardsGrid,
  CardsRow,
  FavoritesSection,
  FavoritesTitle,
  FavoritesList,
  EmptyFavorites,
} from './HomeScreen.style';

const HomeScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [forgettingData, setForgettingData] = useState<ForgettingCurveData[]>(
    [],
  );
  const [favoriteConcepts, setFavoriteConcepts] = useState<Concept[]>([]);
  const [_isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      // 모든 개념 로드
      const allConcepts = await conceptService.getAllConcepts();
      setConcepts(allConcepts);

      // 즐겨찾기 개념 로드
      const favorites = await conceptService.getFavoriteConcepts();
      setFavoriteConcepts(favorites);

      // 망각곡선 데이터 로드
      const forgettingCurveData =
        await studyRecordService.getForgettingCurveData();
      setForgettingData(forgettingCurveData);
    } catch (error) {
      console.error('Error loading home screen data:', error);
      Alert.alert('오류', '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // 화면이 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData();
  }, [loadData]);

  const almostForgottenConcepts = forgettingData.filter(
    data => data.forgettingRate >= 0.6,
  );

  const homeCards: HomeCardType[] = [
    {
      id: 'flashcards',
      title: t('screens.home.cards.flashcards.title'),
      subtitle: t('screens.home.cards.flashcards.subtitle'),
      icon: '🃏',
      count: concepts.length,
      color: theme.colors.primary,
      onPress: () => navigation.navigate(Routes.FlashCards),
    },
    {
      id: 'studyList',
      title: t('screens.home.cards.studyList.title'),
      subtitle: t('screens.home.cards.studyList.subtitle'),
      icon: '📚',
      count: concepts.length,
      color: theme.colors.info,
      onPress: () => navigation.navigate(Routes.StudyList),
    },
    {
      id: 'forgetting',
      title: t('screens.home.cards.forgetting.title'),
      subtitle: t('screens.home.cards.forgetting.subtitle'),
      icon: '⚠️',
      count: almostForgottenConcepts.length,
      color: theme.colors.warning,
      onPress: () => navigation.navigate(Routes.ForgettingConcepts),
    },
  ];

  const handleConceptPress = (concept: Concept) => {
    navigation.navigate(Routes.ConceptDetail, {
      conceptId: concept.id,
      mode: 'edit',
    });
  };

  const handleAddConcept = () => {
    navigation.navigate(Routes.ConceptDetail, {
      mode: 'create',
    });
  };

  const handleToggleFavorite = async (conceptId: string) => {
    try {
      const newFavoriteStatus = await conceptService.toggleFavorite(conceptId);

      // 로컬 상태 업데이트
      setConcepts(prev =>
        prev.map(concept =>
          concept.id === conceptId
            ? { ...concept, isFavorite: newFavoriteStatus }
            : concept,
        ),
      );

      // 즐겨찾기 목록 업데이트
      if (newFavoriteStatus) {
        const updatedConcept = await conceptService.getConceptById(conceptId);
        if (updatedConcept) {
          setFavoriteConcepts(prev => [...prev, updatedConcept]);
        }
      } else {
        setFavoriteConcepts(prev =>
          prev.filter(concept => concept.id !== conceptId),
        );
      }

      Alert.alert(
        '즐겨찾기',
        newFavoriteStatus
          ? '즐겨찾기에 추가되었습니다.'
          : '즐겨찾기에서 제거되었습니다.',
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('오류', '즐겨찾기 설정 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Container theme={theme}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          <Header>
            <Title theme={theme}>{t('screens.home.title')}</Title>
            <Welcome theme={theme}>{t('screens.home.welcome')}</Welcome>
          </Header>

          <CardsGrid>
            <CardsRow>
              <HomeCard card={homeCards[0]} />
              <HomeCard card={homeCards[1]} />
            </CardsRow>
            <CardsRow>
              <HomeCard card={homeCards[2]} />
            </CardsRow>
          </CardsGrid>

          <FavoritesSection>
            <FavoritesTitle theme={theme}>
              {t('screens.home.favorites.title')}
            </FavoritesTitle>
            <FavoritesList>
              {favoriteConcepts.length > 0 ? (
                favoriteConcepts.map(concept => (
                  <FavoriteConceptItem
                    key={concept.id}
                    concept={concept}
                    onPress={handleConceptPress}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))
              ) : (
                <EmptyFavorites theme={theme}>
                  {t('screens.home.favorites.empty')}
                </EmptyFavorites>
              )}
            </FavoritesList>
          </FavoritesSection>
        </ScrollView>

        <FloatingActionButton onPress={handleAddConcept} />
      </Container>
    </SafeAreaView>
  );
};

export default HomeScreen;
