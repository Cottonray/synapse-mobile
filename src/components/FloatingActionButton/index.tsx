import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { FABContainer, FABIcon } from './FloatingActionButton.style';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  size?: number;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = '+',
  size = 56,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        position: 'absolute',
        bottom: 80, // 탭바 위에 위치
        right: 20,
        elevation: 8,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        zIndex: 1000,
      }}
    >
      <FABContainer theme={theme} size={size}>
        <FABIcon theme={theme}>{icon}</FABIcon>
      </FABContainer>
    </TouchableOpacity>
  );
};

export default FloatingActionButton;
