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

export const HeaderContent = styled.View`
  flex: 1;
  align-items: center;
`;

export const Title = styled.Text<{ theme: Theme }>`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
  text-align: center;
`;

export const Subtitle = styled.Text<{ theme: Theme }>`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;

export const HeaderSpacer = styled.View`
  width: 40px;
`;

export const InfoContainer = styled.View<{ theme: Theme }>`
  margin: 0 20px 16px 20px;
  background-color: ${({ theme }) => theme.colors.info}20;
  border: 1px solid ${({ theme }) => theme.colors.info};
  border-radius: 8px;
  padding: 12px;
`;

export const InfoText = styled.Text<{ theme: Theme }>`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

export const ConceptItem = styled.TouchableOpacity<{ theme: Theme }>`
  background-color: ${({ theme }) => theme.colors.surface};
  margin: 0 20px 16px 20px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  shadow-color: ${({ theme }) => theme.colors.shadow};
  shadow-offset: 0px 3px;
  shadow-opacity: 0.1;
  shadow-radius: 6px;
  elevation: 3;
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
  margin-bottom: 12px;
`;

export const ConceptDate = styled.Text<{ theme: Theme }>`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex: 1;
`;

export const ForgettingRate = styled.View<{
  theme: Theme;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}>`
  background-color: ${({ theme, urgency }) => {
    switch (urgency) {
      case 'critical':
        return theme.colors.error + '20';
      case 'high':
        return theme.colors.warning + '20';
      case 'medium':
        return theme.colors.info + '20';
      default:
        return theme.colors.success + '20';
    }
  }};
  border: 1px solid
    ${({ theme, urgency }) => {
      switch (urgency) {
        case 'critical':
          return theme.colors.error;
        case 'high':
          return theme.colors.warning;
        case 'medium':
          return theme.colors.info;
        default:
          return theme.colors.success;
      }
    }};
  border-radius: 12px;
  padding: 4px 8px;
`;

export const ForgettingRateText = styled.Text<{ theme: Theme }>`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export const UrgencyBadge = styled.View<{ theme: Theme; color: string }>`
  background-color: ${({ color }) => color}20;
  border: 1px solid ${({ color }) => color};
  border-radius: 12px;
  padding: 4px 8px;
`;

export const UrgencyText = styled.Text<{ theme: Theme }>`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export const StudyButton = styled.TouchableOpacity<{ theme: Theme }>`
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  padding: 10px;
  align-items: center;
`;

export const StudyButtonText = styled.Text<{ theme: Theme }>`
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
