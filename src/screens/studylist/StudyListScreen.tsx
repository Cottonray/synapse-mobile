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
import { Concept } from '../../types';
import { conceptService } from '../../storages/services/ConceptService';
import Routes from '../../navigations/routes';
import FloatingActionButton from '../../components/FloatingActionButton';
import {
  Container,
  Header,
  BackButton,
  BackButtonText,
  Title,
  HeaderSpacer,
  SearchContainer,
  SearchInput,
  FilterContainer,
  FilterButton,
  FilterButtonText,
  ConceptItem,
  ConceptHeader,
  ConceptTitle,
  ConceptCategory,
  ConceptDescription,
  ConceptFooter,
  ConceptDate,
  DifficultyBadge,
  DifficultyText,
  FavoriteButton,
  FavoriteIcon,
  EmptyContainer,
  EmptyText,
  EmptySubText,
} from './StudyListScreen.style';

type FilterType = 'all' | 'favorites' | 'recent' | 'difficult';

const StudyListScreen = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [filteredConcepts, setFilteredConcepts] = useState<Concept[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadConcepts = useCallback(async () => {
    try {
      const allConcepts = await conceptService.getAllConcepts();
      setConcepts(allConcepts);
      setFilteredConcepts(allConcepts);
    } catch (error) {
      console.error('Error loading concepts:', error);
      Alert.alert('오류', '개념을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadConcepts();
    }, [loadConcepts]),
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadConcepts();
  }, [loadConcepts]);

  const applyFilters = useCallback(() => {
    let filtered = [...concepts];

    // 검색어 필터링
    if (searchQuery) {
      filtered = filtered.filter(
        concept =>
          concept.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          concept.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (concept.category &&
            concept.category.toLowerCase().includes(searchQuery.toLowerCase())),
      );
    }

    // 카테고리 필터링
    switch (activeFilter) {
      case 'favorites':
        filtered = filtered.filter(concept => concept.isFavorite);
        break;
      case 'recent':
        filtered = filtered.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        break;
      case 'difficult':
        filtered = filtered.filter(concept => concept.difficulty === 'hard');
        break;
      default:
        break;
    }

    setFilteredConcepts(filtered);
  }, [concepts, searchQuery, activeFilter]);

  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return theme.colors.success;
      case 'medium':
        return theme.colors.warning;
      case 'hard':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '쉬움';
      case 'medium':
        return '보통';
      case 'hard':
        return '어려움';
      default:
        return '미설정';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  const renderConceptItem = ({ item }: { item: Concept }) => (
    <ConceptItem theme={theme} onPress={() => handleConceptPress(item)}>
      <ConceptHeader>
        <ConceptTitle theme={theme}>{item.title}</ConceptTitle>
        <FavoriteButton onPress={() => handleToggleFavorite(item.id)}>
          <FavoriteIcon theme={theme} isFavorite={item.isFavorite}>
            {item.isFavorite ? '★' : '☆'}
          </FavoriteIcon>
        </FavoriteButton>
      </ConceptHeader>

      {item.category && (
        <ConceptCategory theme={theme}>#{item.category}</ConceptCategory>
      )}

      <ConceptDescription theme={theme} numberOfLines={2}>
        {item.description}
      </ConceptDescription>

      <ConceptFooter>
        <ConceptDate theme={theme}>{formatDate(item.updatedAt)}</ConceptDate>
        <DifficultyBadge
          theme={theme}
          color={getDifficultyColor(item.difficulty)}
        >
          <DifficultyText theme={theme}>
            {getDifficultyText(item.difficulty)}
          </DifficultyText>
        </DifficultyBadge>
      </ConceptFooter>
    </ConceptItem>
  );

  const filters = [
    { key: 'all', label: '전체' },
    { key: 'favorites', label: '즐겨찾기' },
    { key: 'recent', label: '최근' },
    { key: 'difficult', label: '어려움' },
  ] as const;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Container theme={theme}>
        <Header theme={theme}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackButton theme={theme}>
              <BackButtonText theme={theme}>←</BackButtonText>
            </BackButton>
          </TouchableOpacity>
          <Title theme={theme}>암기목록</Title>
          <HeaderSpacer />
        </Header>

        <SearchContainer theme={theme}>
          <SearchInput
            theme={theme}
            placeholder="개념 검색..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </SearchContainer>

        <FilterContainer>
          {filters.map(filter => (
            <FilterButton
              key={filter.key}
              theme={theme}
              isActive={activeFilter === filter.key}
              onPress={() => setActiveFilter(filter.key)}
            >
              <FilterButtonText
                theme={theme}
                isActive={activeFilter === filter.key}
              >
                {filter.label}
              </FilterButtonText>
            </FilterButton>
          ))}
        </FilterContainer>

        {filteredConcepts.length === 0 ? (
          <EmptyContainer>
            <EmptyText theme={theme}>📚</EmptyText>
            <EmptySubText theme={theme}>
              {searchQuery || activeFilter !== 'all'
                ? '검색 결과가 없습니다.'
                : '아직 등록된 개념이 없습니다.'}
            </EmptySubText>
            <EmptySubText theme={theme}>
              {searchQuery || activeFilter !== 'all'
                ? '다른 검색어나 필터를 시도해보세요.'
                : '새로운 개념을 추가해보세요!'}
            </EmptySubText>
          </EmptyContainer>
        ) : (
          <FlatList
            data={filteredConcepts}
            renderItem={renderConceptItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 80 }}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            }
          />
        )}

        <FloatingActionButton onPress={handleAddConcept} />
      </Container>
    </SafeAreaView>
  );
};

export default StudyListScreen;
