import styled from '@emotion/native';
import { Theme } from '../../themes/types';

export const ItemContainer = styled.View<{ theme: Theme }>`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  padding: 16px;
  margin: 6px 0;
  flex-direction: row;
  align-items: center;
  elevation: 2;
  shadow-color: ${({ theme }) => theme.colors.shadow};
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 4px;
`;

export const ItemContent = styled.View`
  flex: 1;
`;

export const ItemTitle = styled.Text<{ theme: Theme }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

export const ItemCategory = styled.Text<{ theme: Theme }>`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 8px;
`;

export const ItemTags = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

export const TagItem = styled.View<{ theme: Theme }>`
  background-color: ${({ theme }) => theme.colors.primary}20;
  border-radius: 12px;
  padding: 4px 8px;
  margin-right: 6px;
  margin-bottom: 4px;
`;

export const TagText = styled.Text<{ theme: Theme }>`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
`;

export const FavoriteIcon = styled.Text<{ theme: Theme; isFavorite: boolean }>`
  font-size: 20px;
  opacity: ${({ isFavorite }) => (isFavorite ? 1 : 0.3)};
`;
