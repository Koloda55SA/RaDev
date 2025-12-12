# 🌐 Инструкция по настройке доменов для Firebase OAuth

## ✅ Текущая структура доменов в Vercel:

Проект: **freedip-portfolio** (kolodas-projects)

### Production деплой:
- **URL деплоя:** `https://freedip-portfolio-43r8z5a1i-kolodas-projects.vercel.app`
- **Статус:** ● Ready (Production)

### ✅ Основные домены (нужные для работы):
1. **https://radev.digital** ⭐ - ваш основной домен (ПЕРВЫЙ)
2. **https://www.radev.digital** ⭐ - WWW версия (ВТОРОЙ)
3. **https://freedip-portfolio.vercel.app** ⭐ - основной Vercel домен (ТРЕТИЙ)

**✅ Все три домена настроены и работают на production деплое!**

### ℹ️ Автоматические системные домены (создаются Vercel автоматически):
- `https://freedip-portfolio-kolodas-projects.vercel.app`
- `https://freedip-portfolio-koloda55sa-kolodas-projects.vercel.app`

**Примечание:** Эти домены создаются автоматически и нельзя их удалить через CLI. Они всегда указывают на последний production деплой и не мешают работе основных доменов.

## 🔧 Что нужно настроить в Firebase:

### 1. Firebase Console - Authorized Domains ⚠️ КРИТИЧНО

Перейдите: https://console.firebase.google.com/project/freedip-27d92/authentication/settings

**ОБЯЗАТЕЛЬНО добавьте эти домены (нажмите "Add domain" для каждого):**
```
✅ localhost (для разработки)
✅ freedip-27d92.web.app (Firebase Hosting)
✅ freedip-27d92.firebaseapp.com (Firebase Hosting)
✅ freedip-portfolio.vercel.app (Vercel production домен)
✅ radev.digital (ваш основной домен) ⭐ КРИТИЧНО
✅ www.radev.digital (WWW версия) ⭐ КРИТИЧНО
```

**Важно:** Без добавления этих доменов Google OAuth НЕ будет работать!

### 2. Google Cloud Console - OAuth Redirect URIs

Перейдите: https://console.cloud.google.com/apis/credentials?project=freedip-27d92

**Найдите OAuth 2.0 Client ID** (Web client для Firebase)

**В "Authorized redirect URIs" добавьте:**
```
https://freedip-27d92.firebaseapp.com/__/auth/handler
http://localhost:3000/__/auth/handler
https://radev.digital/__/auth/handler
https://www.radev.digital/__/auth/handler
https://freedip-portfolio.vercel.app/__/auth/handler
```

### 3. Проверка через Vercel CLI

```bash
# Проверить последние деплои
vercel ls

# Проверить конкретный деплой и его домены
vercel inspect freedip-portfolio.vercel.app

# Или проверить по production URL
vercel inspect radev.digital
```

**Вывод покажет все настроенные алиасы (домены) для деплоя.**

## ✅ После настройки:

1. Подождите 5-10 минут для применения изменений
2. Протестируйте вход через Google на всех доменах:
   - https://radev.digital/login
   - https://www.radev.digital/login
   - https://freedip-portfolio.vercel.app/login

## 🐛 Если не работает:

1. Проверьте консоль браузера на ошибки
2. Убедитесь, что все домены добавлены в Firebase
3. Проверьте, что Google Provider включен в Firebase
4. Убедитесь, что Project support email заполнен


