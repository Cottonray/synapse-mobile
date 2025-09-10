import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Concept } from '../../types';
import {
  ItemContainer,
  ItemContent,
  ItemTitle,
  ItemCategory,
  ItemTags,
  TagItem,
  TagText,
  FavoriteIcon,
} from './FavoriteConceptItem.style';

interface FavoriteConceptItemProps {
  concept: Concept;
  onPress: (concept: Concept) => void;
  onToggleFavorite: (conceptId: string) => void;
}

const FavoriteConceptItem: React.FC<FavoriteConceptItemProps> = ({
  concept,
  onPress,
  onToggleFavorite,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity onPress={() => onPress(concept)} activeOpacity={0.8}>
      <ItemContainer theme={theme}>
        <ItemContent>
          <ItemTitle theme={theme}>{concept.title}</ItemTitle>
          <ItemCategory theme={theme}>{concept.category}</ItemCategory>
          {concept.tags.length > 0 && (
            <ItemTags>
              {concept.tags.slice(0, 3).map((tag, index) => (
                <TagItem key={index} theme={theme}>
                  <TagText theme={theme}>#{tag}</TagText>
                </TagItem>
              ))}
            </ItemTags>
          )}
        </ItemContent>
        <TouchableOpacity
          onPress={() => onToggleFavorite(concept.id)}
          activeOpacity={0.7}
        >
          <FavoriteIcon theme={theme} isFavorite={concept.isFavorite}>
            ⭐
          </FavoriteIcon>
        </TouchableOpacity>
      </ItemContainer>
    </TouchableOpacity>
  );
};

export default FavoriteConceptItem;
