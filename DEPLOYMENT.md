# Инструкция по деплою FreeDip Portfolio

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка Firebase

1. Создайте проект в [Firebase Console](https://console.firebase.google.com/)
2. Включите следующие сервисы:
   - Authentication (Email/Password, Google, GitHub)
   - Firestore Database
   - Storage
3. Скопируйте конфигурацию в `lib/firebase/config.ts`

### 3. Настройка переменных окружения

Создайте файл `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Запуск в режиме разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## 📦 Деплой на Vercel

### Автоматический деплой

1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения в настройках проекта
3. Деплой произойдет автоматически при push в main ветку

### Ручной деплой

```bash
# Установка Vercel CLI
npm i -g vercel

# Логин
vercel login

# Деплой
vercel --prod
```

## 🔐 Настройка админки

1. Создайте пользователя в Firebase Authentication
2. Войдите через `/admin/login`
3. Используйте админ-панель для управления контентом

## 📱 PWA настройка

1. Создайте иконки:
   - `public/icon-192.png` (192x192)
   - `public/icon-512.png` (512x512)
2. Обновите `public/manifest.json` при необходимости

## 🔍 SEO оптимизация

1. Обновите мета-данные в `app/metadata.ts`
2. Добавьте реальные изображения для Open Graph
3. Настройте Google Search Console и Яндекс.Вебмастер

## 📊 Аналитика

Добавьте в `app/layout.tsx`:

```tsx
// Google Analytics
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  strategy="afterInteractive"
/>
```

## 🐛 Решение проблем

### Ошибка Firebase

- Проверьте правильность конфигурации
- Убедитесь, что сервисы включены в Firebase Console

### Ошибки сборки

```bash
# Очистка кэша
rm -rf .next
npm run build
```

### Проблемы с i18n

- Проверьте наличие файлов в `public/locales/`
- Убедитесь, что i18n инициализирован в `lib/i18n/config.ts`

## 📞 Поддержка

При возникновении проблем:
- Email: team@freedip.dev
- Telegram: @freedip_team






## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка Firebase

1. Создайте проект в [Firebase Console](https://console.firebase.google.com/)
2. Включите следующие сервисы:
   - Authentication (Email/Password, Google, GitHub)
   - Firestore Database
   - Storage
3. Скопируйте конфигурацию в `lib/firebase/config.ts`

### 3. Настройка переменных окружения

Создайте файл `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Запуск в режиме разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## 📦 Деплой на Vercel

### Автоматический деплой

1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения в настройках проекта
3. Деплой произойдет автоматически при push в main ветку

### Ручной деплой

```bash
# Установка Vercel CLI
npm i -g vercel

# Логин
vercel login

# Деплой
vercel --prod
```

## 🔐 Настройка админки

1. Создайте пользователя в Firebase Authentication
2. Войдите через `/admin/login`
3. Используйте админ-панель для управления контентом

## 📱 PWA настройка

1. Создайте иконки:
   - `public/icon-192.png` (192x192)
   - `public/icon-512.png` (512x512)
2. Обновите `public/manifest.json` при необходимости

## 🔍 SEO оптимизация

1. Обновите мета-данные в `app/metadata.ts`
2. Добавьте реальные изображения для Open Graph
3. Настройте Google Search Console и Яндекс.Вебмастер

## 📊 Аналитика

Добавьте в `app/layout.tsx`:

```tsx
// Google Analytics
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  strategy="afterInteractive"
/>
```

## 🐛 Решение проблем

### Ошибка Firebase

- Проверьте правильность конфигурации
- Убедитесь, что сервисы включены в Firebase Console

### Ошибки сборки

```bash
# Очистка кэша
rm -rf .next
npm run build
```

### Проблемы с i18n

- Проверьте наличие файлов в `public/locales/`
- Убедитесь, что i18n инициализирован в `lib/i18n/config.ts`

## 📞 Поддержка

При возникновении проблем:
- Email: team@freedip.dev
- Telegram: @freedip_team











