# 🔧 СРОЧНО: Исправление Redirect URI в Google Console

## Проблема

Ошибка: "Невозможно выполнить вход в приложение, поскольку оно не отвечает правилам OAuth 2.0 Google"

Redirect URI `https://radev-test-2.vercel.app/auth/google/callback` не зарегистрирован в Google Cloud Console.

## ✅ Решение (5 минут)

### Шаг 1: Откройте Google Cloud Console

Перейдите по ссылке:
**https://console.cloud.google.com/apis/credentials?project=utility-time-456923-t7**

Или:
1. Откройте https://console.cloud.google.com/
2. Выберите проект: `utility-time-456923-t7`
3. Перейдите в **APIs & Services** → **Credentials**

### Шаг 2: Найдите OAuth 2.0 Client ID

Найдите Client ID:
**`113145495395-ct75b7mr45pgljr0ish9s1ho188pfj9k.apps.googleusercontent.com`**

Нажмите на него для редактирования.

### Шаг 3: Исправьте Authorized redirect URIs

В разделе **"Authorized redirect URIs"** вы увидите:

**Текущие (неправильные):**
```
https://radev.digital/auth/google/callback
https://radev-test-2.vercel.app//auth/google/callback  ← ДВОЙНОЙ СЛЕШ!
```

**Что нужно сделать:**

1. **Удалите** строку с двойным слешем: `https://radev-test-2.vercel.app//auth/google/callback`
2. **Добавьте** правильный URI (каждый на новой строке):

```
https://radev.digital/auth/google/callback
https://radev-test-2.vercel.app/auth/google/callback
```

**ВАЖНО:**
- ✅ Один слеш: `/auth/google/callback`
- ❌ НЕ два слеша: `//auth/google/callback`
- ✅ Без trailing slash в конце
- ✅ Каждый URI на отдельной строке

### Шаг 4: Проверьте JavaScript Origins

В разделе **"Authorized JavaScript origins"** должно быть:

```
https://www.radev.digital
https://radev-test-2.vercel.app
```

**ВАЖНО:**
- ✅ Без trailing slash
- ✅ Без пути `/auth/google/callback`

### Шаг 5: Сохраните

1. Нажмите кнопку **"Save"** внизу страницы
2. Подождите 10-30 секунд, пока изменения применятся

### Шаг 6: Проверьте

1. Откройте: https://radev-test-2.vercel.app
2. Нажмите "Войти через Google"
3. Должно произойти перенаправление на Google OAuth **БЕЗ ОШИБКИ**

## 📸 Визуальная инструкция

После открытия OAuth 2.0 Client ID вы увидите форму с двумя разделами:

### Раздел 1: Authorized redirect URIs
```
┌─────────────────────────────────────────────────────────┐
│ Authorized redirect URIs                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ https://radev.digital/auth/google/callback         │ │
│ │ https://radev-test-2.vercel.app//auth/google/...   │ │ ← УДАЛИТЬ
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [+ ADD URI]                                             │
└─────────────────────────────────────────────────────────┘
```

**Должно стать:**
```
┌─────────────────────────────────────────────────────────┐
│ Authorized redirect URIs                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ https://radev.digital/auth/google/callback         │ │
│ │ https://radev-test-2.vercel.app/auth/google/callback│ │ ← ДОБАВИТЬ
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [+ ADD URI]                                             │
└─────────────────────────────────────────────────────────┘
```

## ⚠️ Если не работает

1. **Проверьте точное совпадение URI:**
   - В Google Console: `https://radev-test-2.vercel.app/auth/google/callback`
   - В коде: `https://radev-test-2.vercel.app/auth/google/callback`
   - Должны совпадать **ТОЧНО**, включая протокол (https) и регистр

2. **Подождите 1-2 минуты** после сохранения - изменения могут применяться с задержкой

3. **Очистите кеш браузера** и попробуйте снова

4. **Проверьте в консоли браузера (F12)** - там должны быть логи с redirect_uri

## 📝 Быстрая ссылка

Прямая ссылка на редактирование Client ID:
**https://console.cloud.google.com/apis/credentials/oauthclient/113145495395-ct75b7mr45pgljr0ish9s1ho188pfj9k.apps.googleusercontent.com?project=utility-time-456923-t7**


