import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Routes from './routes';
import { RootStackParamList } from './types';
import MainNavigation from './MainNavigation';
import ConceptDetailScreen from '../screens/concept/ConceptDetailScreen';
import FlashCardsScreen from '../screens/flashcards/FlashCardsScreen';
import StudyListScreen from '../screens/studylist/StudyListScreen';
import ForgettingConceptsScreen from '../screens/forgetting/ForgettingConceptsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
      <Stack.Screen
        name={Routes.FlashCards}
        component={FlashCardsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Routes.StudyList}
        component={StudyListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Routes.ForgettingConcepts}
        component={ForgettingConceptsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigation;
