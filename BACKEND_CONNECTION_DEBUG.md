# Отладка подключения к C# бэкенду

## Проблема

После успешной авторизации через Google происходит ошибка "fetch failed" при обращении к C# бэкенду.

## Возможные причины

### 1. C# API не запущен на VPS
- Проверьте, что Docker контейнер с API запущен
- Проверьте логи: `docker logs backend-api`

### 2. Неправильный API URL
- Проверьте переменную окружения `NEXT_PUBLIC_API_URL` в Vercel
- Должен быть URL вида: `https://your-vps-domain.com/api` или `http://your-vps-ip:5000/api`

### 3. Проблема с сетью/файрволом
- VPS может блокировать входящие запросы
- Проверьте настройки файрвола и nginx

### 4. Эндпоинт `/auth/google` не существует
- Проверьте, что в C# бэкенде есть контроллер с методом `POST /auth/google`

## Как проверить

### Шаг 1: Проверьте API URL

В Vercel настройках должна быть переменная:
```
NEXT_PUBLIC_API_URL=https://your-vps-domain.com/api
```

### Шаг 2: Проверьте доступность API

Откройте в браузере:
```
https://your-vps-domain.com/health
```

Должен вернуться статус 200.

### Шаг 3: Проверьте эндпоинт

Попробуйте сделать POST запрос к:
```
https://your-vps-domain.com/api/auth/google
```

С телом:
```json
{
  "email": "test@example.com",
  "name": "Test User",
  "picture": "https://...",
  "googleId": "123456789"
}
```

### Шаг 4: Проверьте логи

В консоли браузера (F12) после попытки входа через Google должны быть логи:
```
[Google Callback] Sending user data to backend: { apiUrl: '...', ... }
```

Если видите ошибку "fetch failed", значит:
- API недоступен по указанному URL
- Или есть проблема с CORS
- Или файрвол блокирует запросы

## Решение

1. **Проверьте, что C# API запущен:**
   ```bash
   ssh your-vps
   docker ps  # Должен быть контейнер backend-api
   docker logs backend-api  # Проверьте логи
   ```

2. **Проверьте переменную окружения в Vercel:**
   - Перейдите: https://vercel.com/kolodas-projects/radev-test-2/settings/environment-variables
   - Убедитесь, что `NEXT_PUBLIC_API_URL` установлен правильно

3. **Проверьте nginx конфигурацию:**
   - Убедитесь, что nginx проксирует запросы к C# API
   - Проверьте, что порт 5000 доступен

4. **Проверьте CORS настройки в C# API:**
   - Убедитесь, что домен Vercel разрешен в CORS


