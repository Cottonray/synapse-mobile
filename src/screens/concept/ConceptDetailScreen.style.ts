import styled from '@emotion/native';
import Slider from '@react-native-community/slider';
import { Theme } from '../../themes/types';

export const Container = styled.View<{ theme: Theme }>`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Header = styled.View<{ theme: Theme }>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: ${({ theme }) => theme.colors.card};
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const HeaderTitle = styled.Text<{ theme: Theme }>`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export const HeaderButton = styled.View<{ theme: Theme }>`
  padding: 8px 12px;
  border-radius: 8px;
`;

export const HeaderButtonText = styled.Text<{ theme: Theme; color?: string }>`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme, color }) => color || theme.colors.primary};
`;

export const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const LoadingText = styled.Text<{ theme: Theme }>`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 16px;
`;

export const FormSection = styled.View<{ theme: Theme }>`
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.separator};
`;

export const Label = styled.Text<{ theme: Theme }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
`;

export const TextInput = styled.TextInput<{ theme: Theme }>`
  background-color: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  min-height: 50px;
`;

export const TextArea = styled(TextInput)<{ theme: Theme }>`
  min-height: 120px;
  text-align-vertical: top;
`;

export const PickerContainer = styled.View<{ theme: Theme }>`
  flex-direction: row;
  flex-wrap: wrap;
  margin: -4px;
`;

export const PickerLabel = styled.Text<{ theme: Theme; selected: boolean }>`
  font-size: 14px;
  color: ${({ theme, selected }) =>
    selected ? theme.colors.primary : theme.colors.text};
  font-weight: ${({ selected }) => (selected ? '600' : '400')};
`;

export const DifficultySelector = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

export const DifficultyOption = styled.View<{
  theme: Theme;
  selected: boolean;
}>`
  flex: 1;
  padding: 16px;
  margin: 0 4px;
  border-radius: 12px;
  background-color: ${({ theme, selected }) =>
    selected ? theme.colors.primary + '20' : theme.colors.card};
  border: 2px solid
    ${({ theme, selected }) =>
      selected ? theme.colors.primary : theme.colors.border};
  align-items: center;
`;

export const DifficultyText = styled.Text<{ theme: Theme; selected: boolean }>`
  font-size: 16px;
  font-weight: ${({ selected }) => (selected ? '600' : '400')};
  color: ${({ theme, selected }) =>
    selected ? theme.colors.primary : theme.colors.text};
`;

export const TagContainer = styled.View`
  margin-bottom: 12px;
`;

export const TagInput = styled(TextInput)<{ theme: Theme }>`
  margin-bottom: 0;
`;

export const TagList = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 8px;
`;

export const TagItem = styled.View<{ theme: Theme }>`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.primary}20;
  border-radius: 16px;
  padding: 6px 12px;
  margin: 4px 8px 4px 0;
`;

export const TagText = styled.Text<{ theme: Theme }>`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
`;

export const RemoveTagButton = styled.Text<{ theme: Theme }>`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.primary};
  margin-left: 8px;
  font-weight: bold;
`;

export const PriorityLabel = styled.Text<{ theme: Theme }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 16px;
`;

export const PrioritySlider = styled(Slider)`
  width: 100%;
  height: 40px;
`;

export const SaveButton = styled.TouchableOpacity<{
  theme: Theme;
  disabled?: boolean;
}>`
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textDisabled : theme.colors.primary};
  border-radius: 12px;
  padding: 18px;
  margin: 20px;
  align-items: center;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

export const SaveButtonText = styled.Text<{ theme: Theme }>`
  font-size: 18px;
  font-weight: 600;
  color: white;
`;

export const CategoryHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

export const AddCategoryButton = styled.TouchableOpacity<{ theme: Theme }>`
  background-color: ${({ theme }) => theme.colors.primary}20;
  border-radius: 16px;
  padding: 4px 8px;
  flex-direction: row;
  align-items: center;
`;

export const AddCategoryText = styled.Text<{ theme: Theme }>`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: 500;
  margin-left: 4px;
`;

export const AddCategoryInput = styled.View<{ theme: Theme }>`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
`;

export const CategoryInput = styled(TextInput)<{ theme: Theme }>`
  flex: 1;
  margin-bottom: 0;
`;

export const CategoryActionButton = styled.TouchableOpacity<{
  theme: Theme;
  variant: 'confirm' | 'cancel';
}>`
  background-color: ${({ theme, variant }) =>
    variant === 'confirm' ? theme.colors.primary : theme.colors.textSecondary};
  border-radius: 8px;
  padding: 12px 16px;
  min-width: 60px;
  align-items: center;
`;

export const CategoryActionText = styled.Text<{ theme: Theme }>`
  color: white;
  font-size: 14px;
  font-weight: 500;
`;
