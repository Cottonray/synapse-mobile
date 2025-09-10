import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Routes from './routes';
import MainNavigation from './MainNavigation';
import ConceptDetailScreen from '../screens/concept/ConceptDetailScreen';

const Stack = createNativeStackNavigator();

const RootNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={Routes.Main}
        component={MainNavigation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Routes.ConceptDetail}
        component={ConceptDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigation;
