# Crypto News App

Мобильное приложение на React Native, созданное с использованием Expo и TypeScript, для просмотра новостей, видео и обновлений в социальных сетях, связанных с криптовалютами. Приложение обладает современным пользовательским интерфейсом с поддержкой тёмного и светлого режимов и использует фиктивные данные, которые можно легко заменить реальными конечными точками API.

## Features

### 🏠 Home Screen
– Предпросмотр последнего видео YouTube с интеграцией с плеером
– Последний твит X (Twitter) с поддержкой внешних ссылок
– Лента последних новостей с раскрывающимися карточками
– Функция обновления по нажатию
– Состояния загрузки и ошибок

### 🐦 X (Twitter) Tab
– Лента твитов, связанных с криптовалютами
– Аватары, имена и ники пользователей
– Количество лайков, ретвитов и ответов
– Внешняя ссылка на оригинальные твиты
– Бесконечная прокрутка с навигацией по страницам

### 📺 YouTube Tab
– Список видео, связанных с криптовалютой
– Миниатюры и названия видео
– Продолжительность и количество просмотров
– Полноэкранный видеоплеер
– Функция «Открыть в YouTube»

### 📰 RSS News Tab
– Полная лента новостей
– Функция поиска
– Расширяемые карточки новостей с полным содержанием
– Указание источника и временных меток
– Фильтрация по категориям

## Technical Stack

### Core Technologies
- **React Native** with Expo
- **TypeScript** for type safety
- **NativeWind** (Tailwind CSS for React Native)
- **TanStack Query** for data fetching and caching

### Navigation
- **React Navigation** v7
– Навигация по нижней вкладке
– Встроенная навигация по стеку для модальных окон

### Data Layer
- **Axios** for HTTP requests
- **React Native MMKV** for local storage
- Имитационная система данных с простой интеграцией API

### UI Components
- **React Native Fast Image** with web fallback
- **React Native YouTube iFrame** for video playback
- **React Native WebView** for external content
- **Expo Linking** for external URLs

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── SmartImage.tsx   # Image component with FastImage fallback
│   ├── VideoCard.tsx    # Video display component
│   ├── TweetCard.tsx    # Tweet display component
│   ├── NewsCard.tsx     # News display component
│   ├── Loading.tsx      # Loading states and skeletons
│   └── ErrorView.tsx    # Error handling components
├── screens/             # Screen components
│   ├── HomeScreen.tsx   # Main dashboard
│   ├── XScreen.tsx      # Twitter/X feed
│   ├── YouTubeListScreen.tsx  # Video list
│   ├── YouTubePlayerScreen.tsx # Video player
│   └── RSSScreen.tsx    # News feed
├── navigation/          # Navigation configuration
│   ├── RootNavigator.tsx # Main navigation setup
│   └── types.ts         # Navigation type definitions
├── hooks/               # React Query hooks
│   ├── useNews.ts       # News data hooks
│   ├── useTweets.ts     # Tweet data hooks
│   └── useVideos.ts     # Video data hooks
├── services/            # API layer
│   └── api.ts          # API service with mock integration
├── mocks/               # Mock data generators
│   ├── generateNews.ts  # News mock data
│   ├── generateTweets.ts # Tweet mock data
│   ├── generateVideos.ts # Video mock data
│   └── index.ts        # Mock data exports
├── store/               # Storage configuration
│   └── storage.ts      # MMKV storage utilities
├── types/               # TypeScript type definitions
│   └── index.ts        # Main type definitions
├── utils/               # Utility functions
│   └── format.ts       # Date, number, and text formatting
└── App.tsx             # Main app component
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crypto-news-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   # Start with mock data (recommended for development)
   npm run start:mock
   
   # Or start normally
   npm start
   ```

4. **Run on devices**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## Development Scripts

```bash
# Start development server with mock data
npm run start:mock

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web
```

## Environment Configuration

The app uses environment variables to control mock data usage:

- `EXPO_PUBLIC_USE_MOCK=1` - Enables mock data (used by `npm run start:mock`)
- When mock mode is disabled, the app will attempt to connect to real APIs

## Mock Data System

The app includes a comprehensive mock data system that simulates real API responses:

- **Videos**: 15 crypto-related videos with real YouTube IDs
- **Tweets**: 25 tweets from crypto influencers and companies
- **News**: 30 news articles with full content and metadata

### Mock Data Features
- Network delay simulation (500-1500ms)
- Random error simulation (10% chance)
- Pagination support
- Search functionality
- Realistic timestamps and user data

## API Integration

The app is designed to easily switch from mock data to real APIs:

1. **Update API endpoints** in `src/services/api.ts`
2. **Modify data structures** if needed in `src/types/index.ts`
3. **Update environment variables** to disable mock mode
4. **Test with real data** and adjust as necessary

### API Endpoints Structure
```
GET /videos/latest          # Latest video
GET /videos?page=1&limit=10 # Video list with pagination
GET /tweets/latest          # Latest tweet
GET /tweets?page=1&limit=20 # Tweet feed with pagination
GET /news/latest?limit=5    # Latest news for home
GET /news?page=1&limit=20   # Full news feed
GET /news/search?q=query    # Search news
```

## Building for Production

### Development Build
```bash
# Create development build
npx expo install --fix
npx expo prebuild
npx expo run:ios    # or npx expo run:android
```

### Production Build
```bash
# Build for app stores
eas build --platform ios
eas build --platform android

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## Customization

### Theming
The app supports light/dark mode through Tailwind CSS classes. Customize colors in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
      },
    },
  },
}
```

### Mock Data Customization
Edit mock data generators in `src/mocks/` to customize:
- Video content and YouTube IDs
- Tweet authors and content
- News articles and sources

### UI Components
All UI components are in `src/components/` and can be customized:
- Modify card layouts
- Update loading states
- Customize error messages
- Add new component variants

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **iOS build issues**
   ```bash
   cd ios && pod install && cd ..
   npx expo run:ios
   ```

3. **Android build issues**
   ```bash
   npx expo run:android --clear
   ```

4. **TypeScript errors**
   ```bash
   npx tsc --noEmit
   ```

### Performance Optimization

- Images are cached using React Native Fast Image
- Data is cached using TanStack Query
- Lists use FlatList for optimal performance
- Pull-to-refresh is implemented for all feeds

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the Expo documentation
- Review React Native documentation

---

**Note**: This app currently uses mock data. To integrate with real APIs, update the configuration in `src/services/api.ts` and set the appropriate environment variables.

