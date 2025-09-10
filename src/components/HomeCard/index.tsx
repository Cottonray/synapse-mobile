import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { HomeCard as HomeCardType } from '../../types';
import {
  CardContainer,
  CardContent,
  CardIcon,
  CardTitle,
  CardSubtitle,
  CardCount,
  CardCountText,
} from './HomeCard.style';

interface HomeCardProps {
  card: HomeCardType;
}

const HomeCard: React.FC<HomeCardProps> = ({ card }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity onPress={card.onPress} activeOpacity={0.8}>
      <CardContainer theme={theme} color={card.color}>
        <CardContent>
          <CardIcon>{card.icon}</CardIcon>
          <CardTitle theme={theme}>{card.title}</CardTitle>
          <CardSubtitle theme={theme}>{card.subtitle}</CardSubtitle>
          <CardCount theme={theme} color={card.color}>
            <CardCountText theme={theme}>{card.count}</CardCountText>
          </CardCount>
        </CardContent>
      </CardContainer>
    </TouchableOpacity>
  );
};

export default HomeCard;
