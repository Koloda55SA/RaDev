# 🚀 Финальная настройка переменных окружения для деплоя

## 📋 Переменные окружения для Vercel

### Обязательные переменные:

```env
# C# Backend API
NEXT_PUBLIC_API_URL=https://your-vps-domain.com/api
NEXT_PUBLIC_USE_API_BACKEND=true

# Google OAuth (если используется)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Google Analytics (опционально)
NEXT_PUBLIC_GA_ID=your_ga_id
```

### Секретные переменные (для API routes):

```env
# Google OAuth Secret (для серверной части)
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 🔧 Как добавить в Vercel:

1. Перейдите в ваш проект на [Vercel](https://vercel.com/)
2. Откройте **Settings** → **Environment Variables**
3. Добавьте каждую переменную:
   - **Name**: имя переменной (например, `NEXT_PUBLIC_API_URL`)
   - **Value**: значение переменной
   - **Environment**: выберите Production, Preview, Development (или все)

## 📝 Пример для тестового проекта:

```env
NEXT_PUBLIC_API_URL=https://test-api.yourdomain.com/api
NEXT_PUBLIC_USE_API_BACKEND=true
NEXT_PUBLIC_GOOGLE_CLIENT_ID=test_client_id
GOOGLE_CLIENT_SECRET=test_client_secret
```

## ✅ Проверка после деплоя:

1. Откройте консоль браузера (F12)
2. Проверьте что нет ошибок подключения к API
3. Попробуйте войти через Firebase
4. Проверьте работу чата
5. Проверьте загрузку аватара

---

**Готово!** После добавления переменных окружения, сделайте новый деплой.


## 📋 Переменные окружения для Vercel

### Обязательные переменные:

```env
# C# Backend API
NEXT_PUBLIC_API_URL=https://your-vps-domain.com/api
NEXT_PUBLIC_USE_API_BACKEND=true

# Google OAuth (если используется)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Google Analytics (опционально)
NEXT_PUBLIC_GA_ID=your_ga_id
```

### Секретные переменные (для API routes):

```env
# Google OAuth Secret (для серверной части)
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 🔧 Как добавить в Vercel:

1. Перейдите в ваш проект на [Vercel](https://vercel.com/)
2. Откройте **Settings** → **Environment Variables**
3. Добавьте каждую переменную:
   - **Name**: имя переменной (например, `NEXT_PUBLIC_API_URL`)
   - **Value**: значение переменной
   - **Environment**: выберите Production, Preview, Development (или все)

## 📝 Пример для тестового проекта:

```env
NEXT_PUBLIC_API_URL=https://test-api.yourdomain.com/api
NEXT_PUBLIC_USE_API_BACKEND=true
NEXT_PUBLIC_GOOGLE_CLIENT_ID=test_client_id
GOOGLE_CLIENT_SECRET=test_client_secret
```

## ✅ Проверка после деплоя:

1. Откройте консоль браузера (F12)
2. Проверьте что нет ошибок подключения к API
3. Попробуйте войти через Firebase
4. Проверьте работу чата
5. Проверьте загрузку аватара

---

**Готово!** После добавления переменных окружения, сделайте новый деплой.




