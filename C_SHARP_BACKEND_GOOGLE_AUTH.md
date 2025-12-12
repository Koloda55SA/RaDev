# Настройка Google OAuth в C# бэкенде

## Проблема

После успешной авторизации через Google происходит ошибка "fetch failed" при обращении к C# бэкенду на эндпоинт `/auth/google`.

## Что нужно сделать

### 1. Создать эндпоинт `/auth/google` в C# бэкенде

В C# бэкенде должен быть контроллер с методом:

```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("google")]
    public async Task<IActionResult> GoogleAuth([FromBody] GoogleAuthRequest request)
    {
        // 1. Проверить, существует ли пользователь с таким email или googleId
        // 2. Если нет - создать нового пользователя
        // 3. Если есть - обновить информацию
        // 4. Сгенерировать JWT токен
        // 5. Вернуть токен и данные пользователя
        
        return Ok(new
        {
            token = "jwt_token_here",
            user = new
            {
                id = "user_id",
                email = request.Email,
                name = request.Name,
                avatar = request.Picture,
                role = "user" // или "admin" если это админ
            }
        });
    }
}

public class GoogleAuthRequest
{
    public string Email { get; set; }
    public string Name { get; set; }
    public string Picture { get; set; }
    public string GoogleId { get; set; }
}
```

### 2. Проверить, что C# API запущен

На VPS выполните:
```bash
docker ps  # Проверьте, что контейнер backend-api запущен
docker logs backend-api  # Проверьте логи на ошибки
```

### 3. Проверить переменную окружения

В Vercel должна быть переменная:
```
NEXT_PUBLIC_API_URL=https://your-vps-domain.com/api
```

### 4. Проверить доступность API

Откройте в браузере:
```
https://your-vps-domain.com/health
```

Должен вернуться статус 200.

## Временное решение

Пока эндпоинт не создан, можно временно сохранять пользователя в localStorage без обращения к бэкенду, но это не рекомендуется для production.

## Логи для отладки

После обновления кода в консоли браузера (F12) будут детальные логи:
- Какой API URL используется
- Какая ошибка возникает при обращении к бэкенду
- Детали ошибки (таймаут, недоступность, и т.д.)


