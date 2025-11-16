import { Video, News } from '../types';

export type RootStackParamList = {
  MainTabs: { screen?: keyof MainTabParamList };
  YouTubePlayer: { video: Video };
  ArticleDetails: { articleId: string; initialArticle?: News };
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
