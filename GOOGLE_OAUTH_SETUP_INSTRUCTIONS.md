# Инструкция по настройке Google OAuth

## ✅ Что уже сделано

1. ✅ Код обновлен для использования Google OAuth через C# бэкенд
2. ✅ JSON файл с данными найден и прочитан
3. ✅ Client ID и Client Secret извлечены из JSON файла

## 📋 Данные из JSON файла

- **Client ID**: `your_google_client_id_here.apps.googleusercontent.com`
- **Client Secret**: `your_google_client_secret_here`

## 🔧 Что нужно сделать СЕЙЧАС

### 1. Настроить переменные окружения в Vercel

Перейдите на страницу настроек проекта:
**https://vercel.com/kolodas-projects/radev-test-2/settings/environment-variables**

Добавьте следующие переменные для **Production**, **Preview** и **Development**:

#### Публичная переменная (для фронтенда):
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

#### Приватные переменные (для серверного API):
```
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 2. Настроить переменные на C# бэкенде (VPS)

Добавьте в `.env` файл или переменные окружения Docker:

```
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 3. Перезапустить деплой

После добавления переменных в Vercel:
1. Перейдите в раздел **Deployments**
2. Найдите последний деплой
3. Нажмите **Redeploy** (или просто сделайте новый коммит)

## ✅ Проверка

После настройки переменных:
1. Откройте сайт: https://radev-test-2.vercel.app
2. Нажмите "Войти через Google"
3. Должно произойти перенаправление на Google OAuth
4. После авторизации вы должны вернуться на сайт авторизованным

## ⚠️ Важно

- Redirect URIs уже настроены в Google Console:
  - `https://radev.digital/auth/google/callback`
  - `https://radev-test-2.vercel.app/auth/google/callback`
  
- JavaScript Origins уже настроены:
  - `https://www.radev.digital`
  - `https://radev-test-2.vercel.app`

Если нужно добавить новый домен, добавьте его в Google Console:
https://console.cloud.google.com/apis/credentials


