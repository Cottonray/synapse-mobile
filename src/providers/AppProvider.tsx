import React, { ReactNode, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, Text, ActivityIndicator } from 'react-native';
import '../locales/i18n'; // i18n 초기화
import { useTheme } from '../hooks/useTheme';
import { ThemeProvider } from './ThemeProvider';
import { initializeDatabase } from '../storages/database';

export interface AppProviderProps {
  children: ReactNode;
}

const queryClient = new QueryClient();

// NavigationContainer를 테마와 함께 사용하기 위한 내부 컴포넌트
const ThemedNavigationContainer = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();

  const navigationTheme = {
    dark: theme.isDark,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.primary,
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: 'normal' as const,
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500' as const,
      },
      bold: {
        fontFamily: 'System',
        fontWeight: 'bold' as const,
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '900' as const,
      },
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {children}
    </NavigationContainer>
  );
};

const AppProvider = ({ children }: AppProviderProps) => {
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const initDb = async () => {
      try {
        console.log('🔄 Starting database initialization...');

        // 일단 데이터베이스 초기화를 건너뛰고 앱을 먼저 실행
        if (__DEV__) {
          console.log(
            '⚠️ Development mode: Skipping database initialization for now',
          );
          setIsDbInitialized(true);
          return;
        }

        await initializeDatabase();
        setIsDbInitialized(true);
        console.log('✅ Database initialized in AppProvider');
      } catch (error) {
        console.error('❌ Database initialization failed:', error);

        // 에러가 발생해도 앱은 실행되도록 함
        console.log('⚠️ Continuing without database...');
        setIsDbInitialized(true);

        if (__DEV__) {
          console.error('Detailed error:', error);
        }
      }
    };

    // 약간의 지연 후 초기화 (React Native 초기화 완료 대기)
    const timer = setTimeout(initDb, 500);

    return () => clearTimeout(timer);
  }, []);

  // 데이터베이스 초기화 중 로딩 화면
  if (!isDbInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        {dbError ? (
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Text
              style={{
                color: '#ff0000',
                fontSize: 16,
                textAlign: 'center',
                marginBottom: 10,
              }}
            >
              데이터베이스 초기화 오류
            </Text>
            <Text
              style={{ color: '#666666', fontSize: 14, textAlign: 'center' }}
            >
              {dbError}
            </Text>
          </View>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={{ marginTop: 16, fontSize: 16, color: '#666666' }}>
              앱을 준비하고 있습니다...
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemedNavigationContainer>{children}</ThemedNavigationContainer>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default AppProvider;
