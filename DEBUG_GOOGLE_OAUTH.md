# Отладка Google OAuth

## Текущая ситуация

✅ Google Console настроен правильно:
- Authorized JavaScript origins: `https://www.radev.digital`, `https://radev-test-2.vercel.app`
- Authorized redirect URIs: `https://radev.digital/auth/google/callback`, `https://radev-test-2.vercel.app/auth/google/callback`

❌ Но все равно ошибка: "Невозможно выполнить вход в приложение, поскольку оно не отвечает правилам OAuth 2.0 Google"

## Возможные причины

### 1. Изменения еще не применились
Google говорит: "It may take 5 minutes to a few hours for settings to take effect"

**Решение:** Подождите 5-10 минут и попробуйте снова.

### 2. Используется preview URL вместо production
Vercel создает уникальные URL для каждого деплоя:
- Production: `https://radev-test-2.vercel.app`
- Preview: `https://radev-test-2-93qyu3h1b-kolodas-projects.vercel.app`

Если вы открываете preview URL, он не будет работать, так как не зарегистрирован в Google Console.

**Решение:** Используйте только production URL: `https://radev-test-2.vercel.app`

### 3. Проблема с переменными окружения
Если `NEXT_PUBLIC_GOOGLE_CLIENT_ID` не установлен в Vercel, используется fallback, но может быть проблема с кешированием.

**Решение:** Проверьте переменные окружения в Vercel и перезапустите деплой.

### 4. Проблема с регистром или протоколом
Google чувствителен к точному совпадению:
- `https://radev-test-2.vercel.app` ✅
- `http://radev-test-2.vercel.app` ❌ (http вместо https)
- `HTTPS://radev-test-2.vercel.app` ❌ (верхний регистр)

**Решение:** Убедитесь, что используется точно `https://` (нижний регистр).

## Как проверить

### Шаг 1: Откройте консоль браузера

1. Откройте сайт: https://radev-test-2.vercel.app
2. Нажмите F12 (открыть DevTools)
3. Перейдите на вкладку "Console"

### Шаг 2: Нажмите "Войти через Google"

В консоли должны появиться логи:
```
[Auth] Google OAuth config: {
  clientId: '113145495395-ct75b7mr45...',
  redirectUri: 'https://radev-test-2.vercel.app/auth/google/callback',
  origin: 'https://radev-test-2.vercel.app'
}
[Auth] Redirecting to Google OAuth...
```

### Шаг 3: Проверьте URL в адресной строке

После нажатия "Войти через Google" вы будете перенаправлены на Google. 

**Проверьте URL в адресной строке браузера.** Он должен содержать:
```
redirect_uri=https%3A%2F%2Fradev-test-2.vercel.app%2Fauth%2Fgoogle%2Fcallback
```

Если URL отличается, значит проблема в коде.

### Шаг 4: Проверьте Network tab

1. В DevTools перейдите на вкладку "Network"
2. Нажмите "Войти через Google"
3. Найдите запрос к `accounts.google.com`
4. Посмотрите параметры запроса

## Быстрое решение

### Вариант 1: Подождать
Если вы только что изменили настройки в Google Console, подождите 5-10 минут.

### Вариант 2: Использовать production URL
Убедитесь, что используете именно: `https://radev-test-2.vercel.app` (не preview URL).

### Вариант 3: Проверить переменные окружения
1. Перейдите: https://vercel.com/kolodas-projects/radev-test-2/settings/environment-variables
2. Убедитесь, что `NEXT_PUBLIC_GOOGLE_CLIENT_ID` установлен
3. Перезапустите деплой

### Вариант 4: Добавить preview URL в Google Console
Если нужно использовать preview деплои, добавьте в Google Console:
- `https://radev-test-2-*.vercel.app/auth/google/callback` (wildcard)

Но Google может не поддерживать wildcard. В этом случае нужно добавлять каждый preview URL вручную.

## Проверка в коде

Код формирует redirect_uri так:
```typescript
const origin = window.location.origin.replace(/\/+$/, '') // Убираем trailing slash
const redirectUri = `${origin}/auth/google/callback`
```

Это должно дать: `https://radev-test-2.vercel.app/auth/google/callback`

Если `window.location.origin` возвращает что-то другое (например, preview URL), то redirect_uri не совпадет с Google Console.


