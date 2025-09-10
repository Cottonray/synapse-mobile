import styled from '@emotion/native';
import { Theme } from '../../themes/types';

export const FABContainer = styled.View<{ theme: Theme; size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => size / 2}px;
  background-color: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  align-items: center;
`;

export const FABIcon = styled.Text<{ theme: Theme }>`
  font-size: 24px;
  font-weight: bold;
  color: white;
`;
