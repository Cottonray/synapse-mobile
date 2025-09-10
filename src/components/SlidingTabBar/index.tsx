import React from 'react';
import { Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../hooks/useTheme';
import NavigationButton from '../NavigationButton';
import {
  TabBarContainer,
  TabIndicator,
  TabItemContainer,
} from './SlidingTabBar.style';

const { width: screenWidth } = Dimensions.get('window');

const shadowStyles = {
  tabBar: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.075,
    shadowRadius: 10,
    elevation: 10,
  },
  indicator: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

const SlidingTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { theme } = useTheme();
  const focusedOptions = descriptors[state.routes[state.index].key].options;

  // 탭 개수와 각 탭의 너비 계산
  const tabCount = state.routes.length;
  const tabWidth = screenWidth / tabCount;
  const indicatorWidth = 50; // 동그라미 크기

  // 현재 선택된 탭의 X 위치 계산
  const getIndicatorPosition = (index: number) => {
    return tabWidth * index + (tabWidth - indicatorWidth) / 2;
  };

  if (focusedOptions.tabBarStyle === false) {
    return null;
  }

  return (
    <TabBarContainer theme={theme} style={shadowStyles.tabBar}>
      {/* 수루룩 이동하는 배경 동그라미 */}
      <TabIndicator
        theme={theme}
        style={{
          ...shadowStyles.indicator,
          shadowColor: theme.colors.tabBarActiveBackground,
        }}
        animate={{
          translateX: getIndicatorPosition(state.index),
        }}
        transition={{
          type: 'spring',
          damping: 1500,
          stiffness: 2000,
        }}
      />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabItemContainer key={route.key}>
            {options.tabBarButton ? (
              options.tabBarButton({
                onPress,
                onLongPress,
                accessibilityState: isFocused ? { selected: true } : {},
                accessibilityRole: 'button',
                accessibilityLabel: options.tabBarAccessibilityLabel,
                testID: `tab-${route.name}`,
                style: {},
                children: null,
              })
            ) : (
              <NavigationButton
                onPress={onPress}
                onLongPress={onLongPress}
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityRole="button"
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={`tab-${route.name}`}
                style={{}}
                icon={<></>}
                children={null}
              />
            )}
          </TabItemContainer>
        );
      })}
    </TabBarContainer>
  );
};

export default SlidingTabBar;
