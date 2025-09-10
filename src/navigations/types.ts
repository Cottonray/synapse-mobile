import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

export type MainNavigationItem = {
  route: string;
  component: () => React.JSX.Element;
  options: BottomTabNavigationOptions;
};

export type RootStackParamList = {
  Main: undefined;
  ConceptDetail: {
    conceptId?: string;
    mode: 'create' | 'edit';
  };
  FlashCards: undefined;
  StudyList: undefined;
  ForgettingConcepts: undefined;
};
