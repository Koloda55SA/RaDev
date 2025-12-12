# Исправление redirect_uri согласно документации Google

## Проблема из документации

Согласно [официальной документации Google](https://developers.google.com/identity/protocols/oauth2/web-server?hl=ru#authorization-errors-redirect-uri-mismatch):

> **redirect_uri_mismatch**: The redirect URI in the request does not match the ones authorized for the OAuth client.

**Ключевой момент:** `redirect_uri` должен **ТОЧНО** совпадать с одним из авторизованных URI в Google Console, включая:
- ✅ Схему (http или https)
- ✅ Домен
- ✅ Порт (если указан)
- ✅ Путь
- ✅ Регистр символов

## Текущая ситуация

В Google Console настроено:
- `https://radev-test-2.vercel.app/auth/google/callback` ✅

В коде формируется:
- `window.location.origin + '/auth/google/callback'`

**Проблема:** Если `window.location.origin` возвращает preview URL (например, `https://radev-test-2-93qyu3h1b-kolodas-projects.vercel.app`), то redirect_uri не совпадет с Google Console.

## Решение

### Вариант 1: Использовать фиксированный redirect_uri для production

Использовать фиксированный redirect_uri для production домена, а не динамический из `window.location.origin`.

### Вариант 2: Проверять и использовать только production URL

Проверять, является ли текущий домен production, и использовать соответствующий redirect_uri.

### Вариант 3: Добавить все возможные preview URLs в Google Console

Добавить все preview URLs в Google Console (но это неудобно, так как каждый деплой создает новый URL).

## Рекомендуемое решение

Использовать фиксированный redirect_uri для production домена, так как это основной домен, который будет использоваться.


