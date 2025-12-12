# Настройка доменов в Firebase для OAuth

## Проблема
Если OAuth не работает на мобильных устройствах или на кастомных доменах, нужно добавить домены в Firebase Console.

## Решение

### 1. Добавить авторизованные домены в Firebase Console

1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Выберите проект `freedip-27d92`
3. Перейдите в **Authentication** → **Settings** → **Authorized domains**
4. Добавьте следующие домены (если их еще нет):
   - `radev.digital`
   - `www.radev.digital`
   - `freedip-portfolio-*.vercel.app` (или конкретный домен Vercel)
   - `localhost` (для разработки)

### 2. Проверить настройки OAuth провайдеров

1. В Firebase Console: **Authentication** → **Sign-in method**
2. Убедитесь, что **Google** провайдер включен
3. Убедитесь, что **Email/Password** провайдер включен
4. Для Google провайдера:
   - Проверьте, что указаны правильные **Authorized redirect URIs**
   - Должны быть добавлены:
     - `https://radev.digital/__/auth/handler`
     - `https://www.radev.digital/__/auth/handler`
     - `https://freedip-27d92.firebaseapp.com/__/auth/handler`

### 3. Проверить настройки в Google Cloud Console (для Google OAuth)

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите проект, связанный с Firebase
3. Перейдите в **APIs & Services** → **Credentials**
4. Найдите OAuth 2.0 Client ID для веб-приложения
5. В **Authorized JavaScript origins** добавьте:
   - `https://radev.digital`
   - `https://www.radev.digital`
   - `https://freedip-27d92.firebaseapp.com`
6. В **Authorized redirect URIs** добавьте:
   - `https://radev.digital/__/auth/handler`
   - `https://www.radev.digital/__/auth/handler`
   - `https://freedip-27d92.firebaseapp.com/__/auth/handler`

### 4. Проверить настройки в коде

Убедитесь, что в `lib/firebase/config.ts` указан правильный `authDomain`:
```typescript
authDomain: "freedip-27d92.firebaseapp.com"
```

### 5. Тестирование

После настройки:
1. Очистите кэш браузера на мобильном устройстве
2. Попробуйте войти через Google на мобильном
3. Проверьте консоль браузера на наличие ошибок
4. Проверьте логи в Firebase Console → Authentication → Users

## Частые ошибки

### `auth/unauthorized-domain`
- **Причина:** Домен не добавлен в Authorized domains
- **Решение:** Добавьте домен в Firebase Console → Authentication → Settings → Authorized domains

### `auth/operation-not-allowed`
- **Причина:** Провайдер не включен
- **Решение:** Включите провайдер в Firebase Console → Authentication → Sign-in method

### Редирект обратно на страницу логина
- **Причина:** Проблема с обработкой `getRedirectResult` или неправильный редирект
- **Решение:** Проверьте код в `AuthProvider.tsx`, убедитесь, что редирект происходит после успешной аутентификации

## Проверка работы

1. Откройте сайт на мобильном устройстве
2. Перейдите на `/login`
3. Нажмите "Войти через Google"
4. После авторизации в Google вы должны быть перенаправлены на главную страницу
5. Проверьте, что пользователь создан в Firebase Console → Authentication → Users



## Проблема
Если OAuth не работает на мобильных устройствах или на кастомных доменах, нужно добавить домены в Firebase Console.

## Решение

### 1. Добавить авторизованные домены в Firebase Console

1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Выберите проект `freedip-27d92`
3. Перейдите в **Authentication** → **Settings** → **Authorized domains**
4. Добавьте следующие домены (если их еще нет):
   - `radev.digital`
   - `www.radev.digital`
   - `freedip-portfolio-*.vercel.app` (или конкретный домен Vercel)
   - `localhost` (для разработки)

### 2. Проверить настройки OAuth провайдеров

1. В Firebase Console: **Authentication** → **Sign-in method**
2. Убедитесь, что **Google** провайдер включен
3. Убедитесь, что **Email/Password** провайдер включен
4. Для Google провайдера:
   - Проверьте, что указаны правильные **Authorized redirect URIs**
   - Должны быть добавлены:
     - `https://radev.digital/__/auth/handler`
     - `https://www.radev.digital/__/auth/handler`
     - `https://freedip-27d92.firebaseapp.com/__/auth/handler`

### 3. Проверить настройки в Google Cloud Console (для Google OAuth)

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите проект, связанный с Firebase
3. Перейдите в **APIs & Services** → **Credentials**
4. Найдите OAuth 2.0 Client ID для веб-приложения
5. В **Authorized JavaScript origins** добавьте:
   - `https://radev.digital`
   - `https://www.radev.digital`
   - `https://freedip-27d92.firebaseapp.com`
6. В **Authorized redirect URIs** добавьте:
   - `https://radev.digital/__/auth/handler`
   - `https://www.radev.digital/__/auth/handler`
   - `https://freedip-27d92.firebaseapp.com/__/auth/handler`

### 4. Проверить настройки в коде

Убедитесь, что в `lib/firebase/config.ts` указан правильный `authDomain`:
```typescript
authDomain: "freedip-27d92.firebaseapp.com"
```

### 5. Тестирование

После настройки:
1. Очистите кэш браузера на мобильном устройстве
2. Попробуйте войти через Google на мобильном
3. Проверьте консоль браузера на наличие ошибок
4. Проверьте логи в Firebase Console → Authentication → Users

## Частые ошибки

### `auth/unauthorized-domain`
- **Причина:** Домен не добавлен в Authorized domains
- **Решение:** Добавьте домен в Firebase Console → Authentication → Settings → Authorized domains

### `auth/operation-not-allowed`
- **Причина:** Провайдер не включен
- **Решение:** Включите провайдер в Firebase Console → Authentication → Sign-in method

### Редирект обратно на страницу логина
- **Причина:** Проблема с обработкой `getRedirectResult` или неправильный редирект
- **Решение:** Проверьте код в `AuthProvider.tsx`, убедитесь, что редирект происходит после успешной аутентификации

## Проверка работы

1. Откройте сайт на мобильном устройстве
2. Перейдите на `/login`
3. Нажмите "Войти через Google"
4. После авторизации в Google вы должны быть перенаправлены на главную страницу
5. Проверьте, что пользователь создан в Firebase Console → Authentication → Users








