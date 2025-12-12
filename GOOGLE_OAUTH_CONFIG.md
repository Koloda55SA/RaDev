# Конфигурация Google OAuth

## Данные из JSON файла

- **Client ID**: `your_google_client_id_here.apps.googleusercontent.com`
- **Client Secret**: `your_google_client_secret_here`
- **Project ID**: `utility-time-456923-t7`

## Redirect URIs (уже настроены в Google Console)

- `https://radev.digital/auth/google/callback`
- `https://radev-test-2.vercel.app/auth/google/callback`

## JavaScript Origins (уже настроены в Google Console)

- `https://www.radev.digital`
- `https://radev-test-2.vercel.app`

## Переменные окружения для Vercel

### Для фронтенда (публичные переменные)

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

### Для серверного API route (приватные переменные)

```
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## Переменные окружения для C# бэкенда (VPS)

```
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## Как настроить в Vercel

1. Перейдите в настройки проекта: https://vercel.com/kolodas-projects/radev-test-2/settings/environment-variables
2. Добавьте переменные:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (для всех окружений)
   - `GOOGLE_CLIENT_ID` (для всех окружений)
   - `GOOGLE_CLIENT_SECRET` (для всех окружений)
3. После добавления переменных перезапустите деплой

## Проверка

После настройки переменных окружения:
1. Откройте сайт: https://radev-test-2.vercel.app
2. Нажмите "Войти через Google"
3. Должно произойти перенаправление на Google OAuth
4. После авторизации вы должны вернуться на сайт авторизованным


