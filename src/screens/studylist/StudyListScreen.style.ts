import styled from '@emotion/native';
import { Theme } from '../../themes/types';

export const Container = styled.View<{ theme: Theme }>`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View<{ theme: Theme }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
`;

export const BackButton = styled.View<{ theme: Theme }>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.surface};
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const BackButtonText = styled.Text<{ theme: Theme }>`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text};
`;

export const Title = styled.Text<{ theme: Theme }>`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
  text-align: center;
`;

export const HeaderSpacer = styled.View`
  width: 40px;
`;

export const SearchContainer = styled.View<{ theme: Theme }>`
  margin: 0 20px 16px 20px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const SearchInput = styled.TextInput<{ theme: Theme }>`
  padding: 12px 16px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

export const FilterContainer = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: { paddingHorizontal: 20, paddingBottom: 16 },
})``;

export const FilterButton = styled.TouchableOpacity<{
  theme: Theme;
  isActive: boolean;
}>`
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.surface};
  border: 1px solid
    ${({ theme, isActive }) =>
      isActive ? theme.colors.primary : theme.colors.border};
  border-radius: 20px;
  padding: 8px 16px;
  margin-right: 8px;
`;

export const FilterButtonText = styled.Text<{
  theme: Theme;
  isActive: boolean;
}>`
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.white : theme.colors.text};
  font-size: 14px;
  font-weight: 500;
`;

export const ConceptItem = styled.TouchableOpacity<{ theme: Theme }>`
  background-color: ${({ theme }) => theme.colors.surface};
  margin: 0 20px 12px 20px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  shadow-color: ${({ theme }) => theme.colors.shadow};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.05;
  shadow-radius: 4px;
  elevation: 2;
`;

export const ConceptHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

export const ConceptTitle = styled.Text<{ theme: Theme }>`
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-right: 8px;
`;

export const ConceptCategory = styled.Text<{ theme: Theme }>`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
  margin-bottom: 8px;
`;

export const ConceptDescription = styled.Text<{ theme: Theme }>`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 20px;
  margin-bottom: 12px;
`;

export const ConceptFooter = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const ConceptDate = styled.Text<{ theme: Theme }>`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const DifficultyBadge = styled.View<{ theme: Theme; color: string }>`
  background-color: ${({ color }) => color}20;
  border: 1px solid ${({ color }) => color};
  border-radius: 12px;
  padding: 4px 8px;
`;

export const DifficultyText = styled.Text<{ theme: Theme }>`
  font-size: 11px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

export const FavoriteButton = styled.TouchableOpacity`
  padding: 4px;
`;

export const FavoriteIcon = styled.Text<{ theme: Theme; isFavorite: boolean }>`
  font-size: 18px;
  color: ${({ theme, isFavorite }) =>
    isFavorite ? theme.colors.warning : theme.colors.textSecondary};
`;

export const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

export const EmptyText = styled.Text<{ theme: Theme }>`
  font-size: 48px;
  margin-bottom: 16px;
`;

export const EmptySubText = styled.Text<{ theme: Theme }>`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-bottom: 8px;
`;
