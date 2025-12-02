# Инструкция по созданию iOS сборки (.xcworkspace)

> **⚠️ ВАЖНО:** Эта инструкция предназначена для macOS. Если вы используете Windows, см. [windows-ios-build-guide.md](./windows-ios-build-guide.md) для альтернативных решений.

## Требования
- macOS (обязательно)
- Xcode установлен
- CocoaPods установлен (`sudo gem install cocoapods`)
- Node.js и npm установлены

## Шаги для создания iOS проекта

### 1. Создание нативных iOS файлов

Выполните команду для генерации iOS проекта:

```bash
npx expo prebuild --platform ios
```

Эта команда создаст папку `ios/` с нативным iOS проектом.

### 2. Установка CocoaPods зависимостей

Перейдите в папку ios и установите зависимости:

```bash
cd ios
pod install
cd ..
```

Команда `pod install` создаст файл `crypto-news-app.xcworkspace` в папке `ios/`.

### 3. Открытие проекта в Xcode

Откройте файл `.xcworkspace` (НЕ `.xcodeproj`):

```bash
open ios/crypto-news-app.xcworkspace
```

Или через Finder:
- Перейдите в папку `ios/`
- Дважды кликните на `crypto-news-app.xcworkspace`

### 4. Настройка проекта в Xcode

1. Выберите схему сборки (Scheme): `crypto-news-app`
2. Выберите устройство или симулятор
3. Нажмите Run (⌘R) для запуска или Product > Archive для создания архива

## Альтернативный способ (через npm скрипты)

Вы также можете использовать добавленные npm скрипты:

```bash
# Создать iOS проект
npm run prebuild:ios

# Установить CocoaPods зависимости
npm run ios:pod-install
```

## Важные замечания

- **Всегда используйте `.xcworkspace`**, а не `.xcodeproj` для открытия проекта
- После изменения зависимостей в `package.json` или `app.json`, выполните `npx expo prebuild --platform ios` снова
- После добавления новых нативных модулей, выполните `pod install` в папке `ios/`
- Убедитесь, что в Xcode выбран правильный Team для подписи кода (Signing & Capabilities)

## Структура после создания

```
crypto-news-app/
├── ios/
│   ├── crypto-news-app.xcworkspace  ← Открывайте этот файл в Xcode
│   ├── crypto-news-app.xcodeproj
│   ├── Podfile
│   ├── Pods/
│   └── ...
```

