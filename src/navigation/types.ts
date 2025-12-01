import { News } from '../types';

export type RootStackParamList = {
  MainTabs: { screen?: keyof MainTabParamList };
  ArticleDetails: { articleId: string; initialArticle?: News };
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  X: undefined;
  YouTube: undefined;
  RSS: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
