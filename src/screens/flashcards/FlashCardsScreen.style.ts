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

export const ProgressContainer = styled.View`
  padding: 0 20px 20px 20px;
  align-items: center;
`;

export const ProgressBarContainer = styled.View<{ theme: Theme }>`
  width: 100%;
  height: 8px;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

export const ProgressBar = styled.View<{ theme: Theme; progress: number }>`
  height: 100%;
  width: ${({ progress }) => progress}%;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
`;

export const ProgressText = styled.Text<{ theme: Theme }>`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const CardContainer = styled.View`
  flex: 1;
  padding: 20px;
  justify-content: center;
  align-items: center;
`;

export const FlashCard = styled.View<{ theme: Theme; isFlipped: boolean }>`
  width: 100%;
  height: 300px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  shadow-color: ${({ theme }) => theme.colors.shadow};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 4;
  justify-content: center;
  align-items: center;
  padding: 20px;
  margin-bottom: 20px;
  transform: ${({ isFlipped }) =>
    isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`;

export const CardContent = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const CardTitle = styled.Text<{ theme: Theme }>`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 16px;
`;

export const CardText = styled.Text<{ theme: Theme }>`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  line-height: 24px;
`;

export const FlipButton = styled.TouchableOpacity<{ theme: Theme }>`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: 12px 24px;
  border-radius: 8px;
`;

export const FlipButtonText = styled.Text<{ theme: Theme }>`
  color: ${({ theme }) => theme.colors.white};
  font-size: 16px;
  font-weight: 600;
`;

export const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  padding: 20px;
  gap: 12px;
`;

export const ActionButton = styled.TouchableOpacity<{
  theme: Theme;
  color: string;
}>`
  flex: 1;
  background-color: ${({ color }) => color};
  padding: 12px 16px;
  border-radius: 8px;
  align-items: center;
`;

export const ActionButtonText = styled.Text<{ theme: Theme }>`
  color: ${({ theme }) => theme.colors.white};
  font-size: 14px;
  font-weight: 600;
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
