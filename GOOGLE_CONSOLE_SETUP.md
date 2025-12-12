# Настройка Redirect URIs в Google Cloud Console

## Проблема

Ошибка: "Невозможно выполнить вход в приложение, поскольку оно не отвечает правилам OAuth 2.0 Google"

Это означает, что redirect_uri `https://radev-test-2.vercel.app/auth/google/callback` не зарегистрирован в Google Cloud Console.

## Решение

### Шаг 1: Откройте Google Cloud Console

Перейдите: https://console.cloud.google.com/apis/credentials

### Шаг 2: Найдите OAuth 2.0 Client ID

1. Найдите Client ID: `113145495395-ct75b7mr45pgljr0ish9s1ho188pfj9k.apps.googleusercontent.com`
2. Нажмите на него для редактирования

### Шаг 3: Добавьте Redirect URIs

В разделе **"Authorized redirect URIs"** добавьте следующие URI (каждый с новой строки):

```
https://radev.digital/auth/google/callback
https://radev-test-2.vercel.app/auth/google/callback
https://radev-test-2-*.vercel.app/auth/google/callback
```

**ВАЖНО**: 
- Убедитесь, что нет двойного слеша (`//`)
- Каждый URI должен быть на отдельной строке
- Не добавляйте trailing slash в конце

### Шаг 4: Добавьте JavaScript Origins

В разделе **"Authorized JavaScript origins"** добавьте:

```
https://radev.digital
https://www.radev.digital
https://radev-test-2.vercel.app
https://radev-test-2-*.vercel.app
```

**ВАЖНО**:
- Не добавляйте trailing slash
- Не добавляйте путь `/auth/google/callback` в JavaScript origins

### Шаг 5: Сохраните изменения

1. Нажмите "Save" внизу страницы
2. Подождите несколько секунд, пока изменения применятся

### Шаг 6: Проверьте

1. Откройте сайт: https://radev-test-2.vercel.app
2. Нажмите "Войти через Google"
3. Должно произойти перенаправление на Google OAuth без ошибки

## Текущие настройки (из JSON файла)

Сейчас в Google Console настроены:
- Redirect URIs:
  - `https://radev.digital/auth/google/callback` ✅
  - `https://radev-test-2.vercel.app//auth/google/callback` ❌ (двойной слеш - ОШИБКА!)

- JavaScript Origins:
  - `https://www.radev.digital` ✅
  - `https://radev-test-2.vercel.app` ✅

## Что нужно исправить

1. **Удалить** неправильный URI с двойным слешем: `https://radev-test-2.vercel.app//auth/google/callback`
2. **Добавить** правильный URI: `https://radev-test-2.vercel.app/auth/google/callback`
3. **Добавить** wildcard для preview деплоев: `https://radev-test-2-*.vercel.app/auth/google/callback`

## Примечание о wildcard

Vercel создает уникальные URL для каждого деплоя (например, `radev-test-2-93qyu3h1b-kolodas-projects.vercel.app`). 

Wildcard `*` позволяет использовать любой поддомен, но Google может не поддерживать wildcard в redirect URIs. В этом случае нужно добавлять каждый URL вручную или использовать основной домен.

## Альтернативное решение

Если wildcard не работает, можно:
1. Использовать только production домен: `https://radev-test-2.vercel.app`
2. Или добавить каждый preview URL вручную при необходимости


