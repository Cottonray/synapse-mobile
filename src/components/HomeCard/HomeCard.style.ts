import styled from '@emotion/native';
import { Theme } from '../../themes/types';

export const CardContainer = styled.View<{ theme: Theme; color: string }>`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  padding: 20px;
  margin: 8px;
  elevation: 4;
  shadow-color: ${({ theme }) => theme.colors.shadow};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  border-left-width: 4px;
  border-left-color: ${({ color }) => color};
  min-height: 140px;
  justify-content: space-between;
`;

export const CardContent = styled.View`
  flex: 1;
  justify-content: space-between;
`;

export const CardIcon = styled.Text`
  font-size: 32px;
  margin-bottom: 8px;
`;

export const CardTitle = styled.Text<{ theme: Theme }>`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

export const CardSubtitle = styled.Text<{ theme: Theme }>`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 12px;
  line-height: 20px;
`;

export const CardCount = styled.View<{ theme: Theme; color: string }>`
  background-color: ${({ color }) => color}20;
  border-radius: 20px;
  padding: 8px 12px;
  align-self: flex-start;
  min-width: 40px;
  align-items: center;
`;

export const CardCountText = styled.Text<{ theme: Theme }>`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;
