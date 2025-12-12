# 🔐 Полная инструкция по настройке Google OAuth через C# бэкенд

## 📋 Содержание
1. [Настройка Google Cloud Console](#1-настройка-google-cloud-console)
2. [Настройка C# бэкенда](#2-настройка-c-бэкенда)
3. [Настройка Frontend (Next.js)](#3-настройка-frontend-nextjs)
4. [Проверка работы](#4-проверка-работы)
5. [Решение проблем](#5-решение-проблем)

---

## 1. Настройка Google Cloud Console

### Шаг 1: Создание проекта
1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Запомните **Project ID**

### Шаг 2: Включение Google+ API
1. В меню слева выберите **APIs & Services** → **Library**
2. Найдите **Google+ API** или **Google Identity Services API**
3. Нажмите **Enable**

### Шаг 3: Создание OAuth 2.0 Credentials
1. Перейдите в **APIs & Services** → **Credentials**
2. Нажмите **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Если появится запрос на настройку OAuth consent screen:
   - Выберите **External** (для тестирования) или **Internal** (для G Suite)
   - Заполните обязательные поля:
     - **App name**: FreeDip
     - **User support email**: ваш email
     - **Developer contact information**: ваш email
   - Нажмите **Save and Continue**
   - На шаге **Scopes** нажмите **Save and Continue**
   - На шаге **Test users** добавьте тестовые email (если External)
   - Нажмите **Save and Continue** → **Back to Dashboard**

4. Создайте OAuth Client ID:
   - **Application type**: Web application
   - **Name**: FreeDip Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://your-domain.com
     https://your-vercel-domain.vercel.app
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/auth/google/callback
     https://your-domain.com/auth/google/callback
     https://your-vercel-domain.vercel.app/auth/google/callback
     ```
   - Нажмите **Create**

5. **ВАЖНО**: Скопируйте:
   - **Client ID** (например: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
   - **Client Secret** (например: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

---

## 2. Настройка C# бэкенда

### Шаг 1: Переменные окружения на VPS
Подключитесь к VPS по SSH и отредактируйте файл `.env` в папке `backend`:

```bash
cd ~/FreeDip/backend
nano .env
```

Добавьте или обновите следующие переменные:

```env
# Google OAuth
GOOGLE_CLIENT_ID=ваш_client_id_из_google_cloud
GOOGLE_CLIENT_SECRET=ваш_client_secret_из_google_cloud

# JWT настройки
JWT_SECRET=ваш_секретный_ключ_для_jwt_минимум_32_символа
JWT_ISSUER=FreeDip
JWT_AUDIENCE=FreeDipUsers

# Email настройки (для верификации)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ваш_email@gmail.com
SMTP_PASSWORD=ваш_пароль_приложения
FROM_EMAIL=ваш_email@gmail.com
```

### Шаг 2: Проверка контроллера AuthController
Убедитесь, что в `backend/FreeDip.Api/Controllers/AuthController.cs` есть метод для Google OAuth:

```csharp
[HttpPost("google")]
public async Task<IActionResult> SignInWithGoogle([FromBody] GoogleSignInRequest request)
{
    // Ваш код обработки Google OAuth
}
```

### Шаг 3: Перезапуск бэкенда
```bash
cd ~/FreeDip/backend
docker-compose down
docker-compose up -d
```

Проверьте логи:
```bash
docker-compose logs -f api
```

---

## 3. Настройка Frontend (Next.js)

### Шаг 1: Переменные окружения для Vercel
1. Перейдите в ваш проект на [Vercel](https://vercel.com/)
2. Откройте **Settings** → **Environment Variables**
3. Добавьте следующие переменные:

```
NEXT_PUBLIC_API_URL=https://your-vps-domain.com/api
NEXT_PUBLIC_USE_API_BACKEND=true
NEXT_PUBLIC_GOOGLE_CLIENT_ID=ваш_client_id_из_google_cloud
```

**ВАЖНО**: `GOOGLE_CLIENT_SECRET` НЕ должен быть в `NEXT_PUBLIC_*` переменных! Он используется только на сервере.

4. Добавьте секретную переменную (для API route):
   - **Name**: `GOOGLE_CLIENT_SECRET`
   - **Value**: ваш_client_secret_из_google_cloud
   - **Environment**: Production, Preview, Development

### Шаг 2: Локальная разработка (.env.local)
Создайте файл `.env.local` в корне проекта:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_USE_API_BACKEND=true
NEXT_PUBLIC_GOOGLE_CLIENT_ID=ваш_client_id_из_google_cloud
GOOGLE_CLIENT_SECRET=ваш_client_secret_из_google_cloud
```

### Шаг 3: Проверка файлов
Убедитесь, что существуют следующие файлы:
- ✅ `app/auth/google/callback/page.tsx` - страница обработки callback
- ✅ `app/api/auth/google-callback/route.ts` - API route для обмена кода на токен
- ✅ `components/auth/ApiAuthProvider.tsx` - провайдер аутентификации
- ✅ `lib/api/client.ts` - API клиент

---

## 4. Проверка работы

### Тест 1: Локальная разработка
1. Запустите бэкенд:
   ```bash
   cd backend
   docker-compose up -d
   ```

2. Запустите frontend:
   ```bash
   npm run dev
   ```

3. Откройте `http://localhost:3000/login`
4. Нажмите "Войти через Google"
5. Выберите аккаунт Google
6. Должен произойти редирект на `/auth/google/callback` и затем на главную страницу

### Тест 2: Production (Vercel)
1. Закоммитьте изменения:
   ```bash
   git add .
   git commit -m "Настройка Google OAuth"
   git push
   ```

2. Дождитесь деплоя на Vercel
3. Откройте ваш сайт и попробуйте войти через Google

---

## 5. Решение проблем

### Проблема: "redirect_uri_mismatch"
**Решение**: 
- Проверьте, что в Google Cloud Console в **Authorized redirect URIs** добавлен точный URL: `https://your-domain.com/auth/google/callback`
- Убедитесь, что нет лишних слешей или протокола

### Проблема: "invalid_client"
**Решение**:
- Проверьте, что `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` правильно скопированы
- Убедитесь, что они установлены в переменных окружения на VPS и Vercel

### Проблема: "access_denied"
**Решение**:
- Если используете **External** OAuth consent screen, добавьте свой email в **Test users**
- Или опубликуйте приложение (для Production)

### Проблема: API не отвечает
**Решение**:
- Проверьте, что бэкенд запущен: `docker-compose ps`
- Проверьте логи: `docker-compose logs api`
- Проверьте, что `NEXT_PUBLIC_API_URL` указывает на правильный адрес

### Проблема: Токен не сохраняется
**Решение**:
- Проверьте консоль браузера на ошибки
- Убедитесь, что `localStorage` доступен (не в режиме Incognito)
- Проверьте, что `apiClient.setToken()` вызывается после успешной авторизации

---

## 📝 Чек-лист

- [ ] Создан проект в Google Cloud Console
- [ ] Включен Google+ API
- [ ] Создан OAuth 2.0 Client ID
- [ ] Добавлены Authorized redirect URIs
- [ ] Переменные окружения настроены на VPS
- [ ] Переменные окружения настроены на Vercel
- [ ] Бэкенд перезапущен
- [ ] Frontend задеплоен
- [ ] Тест локально прошел успешно
- [ ] Тест на production прошел успешно

---

## 🔗 Полезные ссылки

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Готово!** Теперь Google OAuth должен работать через ваш C# бэкенд без Firebase! 🎉


## 📋 Содержание
1. [Настройка Google Cloud Console](#1-настройка-google-cloud-console)
2. [Настройка C# бэкенда](#2-настройка-c-бэкенда)
3. [Настройка Frontend (Next.js)](#3-настройка-frontend-nextjs)
4. [Проверка работы](#4-проверка-работы)
5. [Решение проблем](#5-решение-проблем)

---

## 1. Настройка Google Cloud Console

### Шаг 1: Создание проекта
1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Запомните **Project ID**

### Шаг 2: Включение Google+ API
1. В меню слева выберите **APIs & Services** → **Library**
2. Найдите **Google+ API** или **Google Identity Services API**
3. Нажмите **Enable**

### Шаг 3: Создание OAuth 2.0 Credentials
1. Перейдите в **APIs & Services** → **Credentials**
2. Нажмите **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Если появится запрос на настройку OAuth consent screen:
   - Выберите **External** (для тестирования) или **Internal** (для G Suite)
   - Заполните обязательные поля:
     - **App name**: FreeDip
     - **User support email**: ваш email
     - **Developer contact information**: ваш email
   - Нажмите **Save and Continue**
   - На шаге **Scopes** нажмите **Save and Continue**
   - На шаге **Test users** добавьте тестовые email (если External)
   - Нажмите **Save and Continue** → **Back to Dashboard**

4. Создайте OAuth Client ID:
   - **Application type**: Web application
   - **Name**: FreeDip Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://your-domain.com
     https://your-vercel-domain.vercel.app
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/auth/google/callback
     https://your-domain.com/auth/google/callback
     https://your-vercel-domain.vercel.app/auth/google/callback
     ```
   - Нажмите **Create**

5. **ВАЖНО**: Скопируйте:
   - **Client ID** (например: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
   - **Client Secret** (например: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)

---

## 2. Настройка C# бэкенда

### Шаг 1: Переменные окружения на VPS
Подключитесь к VPS по SSH и отредактируйте файл `.env` в папке `backend`:

```bash
cd ~/FreeDip/backend
nano .env
```

Добавьте или обновите следующие переменные:

```env
# Google OAuth
GOOGLE_CLIENT_ID=ваш_client_id_из_google_cloud
GOOGLE_CLIENT_SECRET=ваш_client_secret_из_google_cloud

# JWT настройки
JWT_SECRET=ваш_секретный_ключ_для_jwt_минимум_32_символа
JWT_ISSUER=FreeDip
JWT_AUDIENCE=FreeDipUsers

# Email настройки (для верификации)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ваш_email@gmail.com
SMTP_PASSWORD=ваш_пароль_приложения
FROM_EMAIL=ваш_email@gmail.com
```

### Шаг 2: Проверка контроллера AuthController
Убедитесь, что в `backend/FreeDip.Api/Controllers/AuthController.cs` есть метод для Google OAuth:

```csharp
[HttpPost("google")]
public async Task<IActionResult> SignInWithGoogle([FromBody] GoogleSignInRequest request)
{
    // Ваш код обработки Google OAuth
}
```

### Шаг 3: Перезапуск бэкенда
```bash
cd ~/FreeDip/backend
docker-compose down
docker-compose up -d
```

Проверьте логи:
```bash
docker-compose logs -f api
```

---

## 3. Настройка Frontend (Next.js)

### Шаг 1: Переменные окружения для Vercel
1. Перейдите в ваш проект на [Vercel](https://vercel.com/)
2. Откройте **Settings** → **Environment Variables**
3. Добавьте следующие переменные:

```
NEXT_PUBLIC_API_URL=https://your-vps-domain.com/api
NEXT_PUBLIC_USE_API_BACKEND=true
NEXT_PUBLIC_GOOGLE_CLIENT_ID=ваш_client_id_из_google_cloud
```

**ВАЖНО**: `GOOGLE_CLIENT_SECRET` НЕ должен быть в `NEXT_PUBLIC_*` переменных! Он используется только на сервере.

4. Добавьте секретную переменную (для API route):
   - **Name**: `GOOGLE_CLIENT_SECRET`
   - **Value**: ваш_client_secret_из_google_cloud
   - **Environment**: Production, Preview, Development

### Шаг 2: Локальная разработка (.env.local)
Создайте файл `.env.local` в корне проекта:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_USE_API_BACKEND=true
NEXT_PUBLIC_GOOGLE_CLIENT_ID=ваш_client_id_из_google_cloud
GOOGLE_CLIENT_SECRET=ваш_client_secret_из_google_cloud
```

### Шаг 3: Проверка файлов
Убедитесь, что существуют следующие файлы:
- ✅ `app/auth/google/callback/page.tsx` - страница обработки callback
- ✅ `app/api/auth/google-callback/route.ts` - API route для обмена кода на токен
- ✅ `components/auth/ApiAuthProvider.tsx` - провайдер аутентификации
- ✅ `lib/api/client.ts` - API клиент

---

## 4. Проверка работы

### Тест 1: Локальная разработка
1. Запустите бэкенд:
   ```bash
   cd backend
   docker-compose up -d
   ```

2. Запустите frontend:
   ```bash
   npm run dev
   ```

3. Откройте `http://localhost:3000/login`
4. Нажмите "Войти через Google"
5. Выберите аккаунт Google
6. Должен произойти редирект на `/auth/google/callback` и затем на главную страницу

### Тест 2: Production (Vercel)
1. Закоммитьте изменения:
   ```bash
   git add .
   git commit -m "Настройка Google OAuth"
   git push
   ```

2. Дождитесь деплоя на Vercel
3. Откройте ваш сайт и попробуйте войти через Google

---

## 5. Решение проблем

### Проблема: "redirect_uri_mismatch"
**Решение**: 
- Проверьте, что в Google Cloud Console в **Authorized redirect URIs** добавлен точный URL: `https://your-domain.com/auth/google/callback`
- Убедитесь, что нет лишних слешей или протокола

### Проблема: "invalid_client"
**Решение**:
- Проверьте, что `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` правильно скопированы
- Убедитесь, что они установлены в переменных окружения на VPS и Vercel

### Проблема: "access_denied"
**Решение**:
- Если используете **External** OAuth consent screen, добавьте свой email в **Test users**
- Или опубликуйте приложение (для Production)

### Проблема: API не отвечает
**Решение**:
- Проверьте, что бэкенд запущен: `docker-compose ps`
- Проверьте логи: `docker-compose logs api`
- Проверьте, что `NEXT_PUBLIC_API_URL` указывает на правильный адрес

### Проблема: Токен не сохраняется
**Решение**:
- Проверьте консоль браузера на ошибки
- Убедитесь, что `localStorage` доступен (не в режиме Incognito)
- Проверьте, что `apiClient.setToken()` вызывается после успешной авторизации

---

## 📝 Чек-лист

- [ ] Создан проект в Google Cloud Console
- [ ] Включен Google+ API
- [ ] Создан OAuth 2.0 Client ID
- [ ] Добавлены Authorized redirect URIs
- [ ] Переменные окружения настроены на VPS
- [ ] Переменные окружения настроены на Vercel
- [ ] Бэкенд перезапущен
- [ ] Frontend задеплоен
- [ ] Тест локально прошел успешно
- [ ] Тест на production прошел успешно

---

## 🔗 Полезные ссылки

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Готово!** Теперь Google OAuth должен работать через ваш C# бэкенд без Firebase! 🎉




