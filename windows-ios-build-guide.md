# Создание iOS сборки с Windows

## Проблема

На Windows нельзя локально создать iOS проект (`.xcworkspace`), так как это требует macOS и Xcode. Команда `npx expo prebuild --platform ios` не работает на Windows.

## Решения

### Вариант 1: EAS Build (Рекомендуется) ⭐

**Expo Application Services (EAS)** позволяет создавать iOS сборки в облаке, даже с Windows.

#### Установка EAS CLI

```bash
npm install -g eas-cli
```

#### Настройка EAS

1. **Войдите в аккаунт Expo:**
   ```bash
   eas login
   ```

2. **Инициализируйте EAS:**
   ```bash
   eas build:configure
   ```

3. **Создайте iOS сборку:**
   ```bash
   # Development build
   eas build --platform ios --profile development
   
   # Production build
   eas build --platform ios --profile production
   ```

4. **Скачайте готовый .xcworkspace:**
   После завершения сборки, EAS создаст iOS проект, который можно скачать.

#### Преимущества:
- ✅ Работает с Windows
- ✅ Не требует macOS
- ✅ Автоматическая настройка
- ✅ Готовые сборки для App Store

---

### Вариант 2: Удаленный доступ к macOS

Если у вас есть доступ к Mac (через удаленный доступ, виртуальную машину, или другой компьютер):

1. **Скопируйте проект на macOS:**
   ```bash
   # Используйте Git, USB, или облачное хранилище
   git clone <your-repo>
   ```

2. **На macOS выполните:**
   ```bash
   cd crypto-news-app
   npm install
   npm run prebuild:ios
   npm run ios:pod-install
   ```

3. **Скопируйте папку `ios/` обратно на Windows** (если нужно)

---

### Вариант 3: GitHub Actions (Автоматизация)

Настройте автоматическую сборку iOS проекта через GitHub Actions:

1. **Создайте файл `.github/workflows/ios-build.yml`:**
   ```yaml
   name: iOS Build
   
   on:
     workflow_dispatch:
   
   jobs:
     build:
       runs-on: macos-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm install
         - run: npm run prebuild:ios
         - run: cd ios && pod install && cd ..
         - uses: actions/upload-artifact@v3
           with:
             name: ios-project
             path: ios/
   ```

2. **Запустите workflow в GitHub:**
   - Перейдите в раздел "Actions"
   - Выберите "iOS Build"
   - Нажмите "Run workflow"
   - После завершения скачайте артефакт с папкой `ios/`

---

### Вариант 4: Использование Expo Go (Для разработки)

Для разработки и тестирования можно использовать Expo Go без создания нативного проекта:

```bash
# Запустите Expo сервер
npm start

# Отсканируйте QR-код в приложении Expo Go на iPhone
```

**Ограничения:**
- Не все нативные модули поддерживаются
- Нельзя создать финальную сборку для App Store

---

## Рекомендации

### Для разработки:
- Используйте **Expo Go** или **EAS Build (development profile)**

### Для продакшена:
- Используйте **EAS Build (production profile)** - самый простой способ
- Или используйте **GitHub Actions** для автоматизации

### Для получения .xcworkspace файла:
- **EAS Build** создаст проект, который можно скачать
- **GitHub Actions** создаст артефакт с готовым проектом
- **Удаленный доступ к macOS** - если есть доступ к Mac

---

## Быстрый старт с EAS Build

```bash
# 1. Установите EAS CLI
npm install -g eas-cli

# 2. Войдите в аккаунт
eas login

# 3. Настройте проект
eas build:configure

# 4. Создайте iOS сборку
eas build --platform ios

# 5. После завершения, скачайте проект
# EAS предоставит ссылку для скачивания
```

---

## Дополнительная информация

- [Документация EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Build для iOS](https://docs.expo.dev/build/building-on-ci/)
- [GitHub Actions для Expo](https://docs.expo.dev/build/building-on-ci/)

