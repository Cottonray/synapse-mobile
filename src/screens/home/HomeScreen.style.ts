import styled from '@emotion/native';
import { Theme } from '../../themes/types';

export const Container = styled.View<{ theme: Theme }>`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View`
  padding: 20px;
  padding-bottom: 10px;
`;

export const Title = styled.Text<{ theme: Theme }>`
  font-size: 28px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

export const Welcome = styled.Text<{ theme: Theme }>`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const CardsGrid = styled.View`
  padding: 10px;
`;

export const CardsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const FavoritesSection = styled.View`
  padding: 20px;
  padding-top: 10px;
`;

export const FavoritesTitle = styled.Text<{ theme: Theme }>`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 16px;
`;

export const FavoritesList = styled.View`
  gap: 8px;
`;

export const EmptyFavorites = styled.Text<{ theme: Theme }>`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: 40px 20px;
  font-style: italic;
`;
