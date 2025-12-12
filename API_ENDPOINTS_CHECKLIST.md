# API Endpoints Checklist

После миграции бэкенд пустой, нужно убедиться, что все эндпоинты работают правильно.

## Базовый URL
- **API URL**: `http://213.199.56.27:5000/api`
- **Health Check**: `http://213.199.56.27:5000/health`

## Эндпоинты для проверки

### 1. Аутентификация
- ✅ `POST /api/auth/google/url` - Получение URL для Google OAuth
  - Body: `{ redirectUri: string }`
  - Response: `{ url: string }`

- ✅ `POST /api/auth/google` - Авторизация через Google
  - Body: `{ code: string, redirectUri: string }`
  - Response: `{ token: string, user: any }`

- ✅ `GET /api/auth/me` - Получение текущего пользователя
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ id, email, nickname, avatar, role, ... }`

### 2. Профиль пользователя
- ✅ `GET /api/social/profile` - Получение профиля текущего пользователя
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ id, email, nickname, avatar, role, stats, achievements, ... }`

- ✅ `GET /api/social/profile/{userId}` - Получение профиля другого пользователя
  - Headers: `Authorization: Bearer <token>` (опционально)
  - Response: `{ id, email, nickname, avatar, role, stats, ... }`

- ✅ `PUT /api/social/profile` - Обновление профиля
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ nickname?: string, bio?: string, avatar?: string }`
  - Response: `{ success: true, data: {...} }`

### 3. Подписки (Following/Followers)
- ✅ `GET /api/social/following` - Получение списка подписок текущего пользователя
  - Headers: `Authorization: Bearer <token>`
  - Response: `[{ id, nickname, email, avatar, ... }]`

- ✅ `GET /api/social/following/{userId}` - Получение списка подписок другого пользователя
  - Headers: `Authorization: Bearer <token>` (опционально)
  - Response: `[{ id, nickname, email, avatar, ... }]`

- ✅ `GET /api/social/followers` - Получение списка подписчиков текущего пользователя
  - Headers: `Authorization: Bearer <token>`
  - Response: `[{ id, nickname, email, avatar, ... }]`

- ✅ `GET /api/social/followers/{userId}` - Получение списка подписчиков другого пользователя
  - Headers: `Authorization: Bearer <token>` (опционально)
  - Response: `[{ id, nickname, email, avatar, ... }]`

- ✅ `POST /api/social/follow/{userId}` - Подписка на пользователя
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: true }`

- ✅ `POST /api/social/unfollow/{userId}` - Отписка от пользователя
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: true }`

### 4. Поиск пользователей
- ✅ `GET /api/social/search?query={query}` - Поиск пользователей
  - Headers: `Authorization: Bearer <token>` (опционально)
  - Response: `[{ id, nickname, email, avatar, ... }]`

### 5. Сообщения (Chat)
- ✅ `GET /api/messages/global?limit={limit}` - Получение глобального чата
  - Headers: `Authorization: Bearer <token>` (опционально)
  - Response: `[{ id, content, senderId, senderEmail, senderNickname, senderAvatar, timestamp, fileUrl, ... }]`

- ✅ `POST /api/messages/global` - Отправка сообщения в глобальный чат
  - Headers: `Authorization: Bearer <token>`
  - Body: `FormData { content: string, file?: File }`
  - Response: `{ id, content, senderId, timestamp, ... }`

- ✅ `GET /api/messages/private/{userId}?limit={limit}` - Получение приватных сообщений
  - Headers: `Authorization: Bearer <token>`
  - Response: `[{ id, content, senderId, receiverId, timestamp, fileUrl, ... }]`

- ✅ `POST /api/messages/private` - Отправка приватного сообщения
  - Headers: `Authorization: Bearer <token>`
  - Body: `FormData { receiverId: string, content: string, file?: File }`
  - Response: `{ id, content, senderId, receiverId, timestamp, ... }`

### 6. Загрузка файлов
- ✅ `POST /api/upload/avatar` - Загрузка аватара
  - Headers: `Authorization: Bearer <token>`
  - Body: `FormData { file: File }`
  - Response: `{ url: string }`

- ✅ `POST /api/upload/project-image` - Загрузка изображения проекта
  - Headers: `Authorization: Bearer <token>`
  - Body: `FormData { file: File }`
  - Response: `{ url: string }`

- ✅ `POST /api/upload/review-photo` - Загрузка фото отзыва
  - Headers: `Authorization: Bearer <token>`
  - Body: `FormData { file: File }`
  - Response: `{ url: string }`

### 7. Проекты
- ✅ `GET /api/projects` - Получение всех проектов
  - Response: `[{ id, title, description, imageUrl, ... }]`

- ✅ `GET /api/projects/{projectId}` - Получение проекта по ID
  - Response: `{ id, title, description, imageUrl, ... }`

- ✅ `POST /api/projects/{projectId}/views` - Увеличение просмотров
  - Response: `{ success: true }`

### 8. Курсы
- ✅ `GET /api/courses` - Получение всех курсов
  - Response: `[{ id, title, description, language, ... }]`

- ✅ `GET /api/courses/{courseId}` - Получение курса по ID
  - Response: `{ id, title, description, chapters, ... }`

### 9. Прогресс
- ✅ `GET /api/progress/lesson/{lessonId}` - Получение прогресса урока
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ lessonId, isCompleted, score, ... }`

- ✅ `PUT /api/progress/lesson/{lessonId}` - Обновление прогресса урока
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ isCompleted: boolean, score: number }`
  - Response: `{ success: true }`

- ✅ `GET /api/progress/course/{courseId}` - Получение прогресса по курсу
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ courseId, totalLessons, completedLessons, ... }`

## Важные моменты

1. **Авторизация**: Все эндпоинты, требующие авторизации, должны проверять JWT токен из заголовка `Authorization: Bearer <token>`

2. **CORS**: Бэкенд должен разрешать запросы с `https://radev-test-2.vercel.app`

3. **FormData**: Эндпоинты загрузки файлов должны принимать `multipart/form-data`

4. **Ошибки**: Все эндпоинты должны возвращать стандартный формат ошибок:
   ```json
   {
     "error": "Error message",
     "details": "Optional details"
   }
   ```

5. **Успешные ответы**: Должны возвращать данные напрямую или в формате:
   ```json
   {
     "success": true,
     "data": {...}
   }
   ```

## Проверка работоспособности

1. Проверьте, что бэкенд запущен: `curl http://213.199.56.27:5000/health`
2. Проверьте, что все эндпоинты доступны
3. Проверьте авторизацию через Google OAuth
4. Проверьте загрузку файлов
5. Проверьте отправку сообщений в чат
6. Проверьте подписки на пользователей

## Известные проблемы

- После миграции бэкенд пустой, нужно убедиться, что все таблицы созданы
- Нужно проверить, что все эндпоинты реализованы в C# API
- Нужно проверить, что авторизация работает правильно


