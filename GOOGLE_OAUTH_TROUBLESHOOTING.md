# Устранение ошибки 401: invalid_client

## Причины ошибки

Ошибка `401: invalid_client` возникает когда:
1. **Client ID неверный или не настроен** - переменная `NEXT_PUBLIC_GOOGLE_CLIENT_ID` не установлена в Vercel
2. **Client Secret неверный** - переменная `GOOGLE_CLIENT_SECRET` не установлена или неверна
3. **Redirect URI не совпадает** - redirect URI в коде не совпадает с настроенным в Google Console

## Решение

### 1. Проверьте переменные окружения в Vercel

Перейдите: https://vercel.com/kolodas-projects/radev-test-2/settings/environment-variables

Убедитесь, что установлены:
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = `your_google_client_id_here.apps.googleusercontent.com`
- `GOOGLE_CLIENT_ID` = `your_google_client_id_here.apps.googleusercontent.com`
- `GOOGLE_CLIENT_SECRET` = `your_google_client_secret_here`

### 2. Проверьте Redirect URIs в Google Console

Перейдите: https://console.cloud.google.com/apis/credentials

**КРИТИЧНО**: В JSON файле есть ошибка - redirect_uri с двойным слешем:
- ❌ Неправильно: `https://radev-test-2.vercel.app//auth/google/callback` (двойной слеш)
- ✅ Правильно: `https://radev-test-2.vercel.app/auth/google/callback` (один слеш)

**Что нужно сделать:**
1. Откройте OAuth 2.0 Client ID в Google Console
2. **Удалите** неправильный URI с двойным слешем
3. **Добавьте** правильный URI: `https://radev-test-2.vercel.app/auth/google/callback`
4. Сохраните изменения

Убедитесь, что в OAuth 2.0 Client ID настроены следующие Redirect URIs:
- `https://radev.digital/auth/google/callback` ✅
- `https://radev-test-2.vercel.app/auth/google/callback` ✅ (добавьте, если отсутствует)

**Примечание**: Google может не поддерживать wildcard (`*`) в redirect URIs. Если нужны preview деплои, добавляйте каждый URL вручную.

### 3. Проверьте JavaScript Origins

В Google Console должны быть настроены:
- `https://www.radev.digital`
- `https://radev.digital`
- `https://radev-test-2.vercel.app`
- `https://radev-test-2-*.vercel.app`

### 4. Перезапустите деплой

После изменения переменных окружения:
1. Перейдите в раздел Deployments
2. Найдите последний деплой
3. Нажмите "Redeploy" или сделайте новый коммит

### 5. Проверьте логи

Откройте консоль браузера (F12) и проверьте логи. Должны быть сообщения:
```
[Auth] Google OAuth config: { clientId: '...', redirectUri: '...', origin: '...' }
[Auth] Redirecting to Google OAuth...
```

Если видите ошибку "Google Client ID не настроен", значит переменная `NEXT_PUBLIC_GOOGLE_CLIENT_ID` не установлена.

## Временное решение (хардкод)

В коде добавлен fallback с хардкодом Client ID и Secret, чтобы OAuth работал даже если переменные не настроены. Это временное решение для тестирования.

**ВНИМАНИЕ**: Не используйте хардкод в production! Всегда используйте переменные окружения.

## Проверка после исправления

1. Откройте сайт: https://radev-test-2.vercel.app
2. Откройте консоль браузера (F12)
3. Нажмите "Войти через Google"
4. Проверьте логи в консоли
5. Должно произойти перенаправление на Google OAuth без ошибки 401

