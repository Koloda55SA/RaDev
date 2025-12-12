# Контекст для ИИ - R&A-Dev Platform

## Общая информация о проекте

**Название проекта:** R&A-Dev (НЕ FreeDip!)

**Описание:** R&A-Dev - это образовательная платформа для изучения программирования и социальная сеть для IT-специалистов в Кыргызстане.

**Основные функции:**
1. **Бесплатные курсы программирования** - 5 языков (Python, JavaScript, Java, C++, C#)
2. **Социальная сеть** - общение, подписки, чаты, обмен кодом и фотографиями
3. **Услуги разработки** - сайты, приложения, дипломные работы

## Технический стек

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS, Shadcn/ui
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Code Execution:** Piston API / Judge0
- **Code Editor:** Monaco Editor
- **i18n:** i18next (русский, кыргызский)

## Важные особенности

### Аутентификация
- **ВАЖНО:** Все методы входа (Google, GitHub, Apple) используют `signInWithRedirect` вместо `signInWithPopup` для избежания ошибок `auth/internal-error`
- OAuth пользователи должны заполнить профиль (никнейм, аватар, био) при первом входе

### Мобильная навигация
- **Нижняя панель (MobileBottomNav):** Курсы, Главная, Чат, Поиск, Профиль (5 кнопок)
- **Мобильное меню (три полоски):** Упрощено - только основные пункты навигации, кнопка входа/выхода, настройки для админов
- **Убрано:** "Чат с поддержкой", лишние кнопки

### Социальные функции
- Поиск пользователей по никнейму
- Подписки/отписки
- Лайки профилей (одноразовые)
- Чат с отправкой текста, кода и изображений
- Просмотр списков подписчиков/подписок (как в Instagram)
- Настройки приватности профиля

### Курсы
- Все 5 курсов заполнены на 100% уникальным контентом
- Прогрессивная сложность от нуля до продвинутого уровня
- Теория, практика с автоматической проверкой, тесты
- Система достижений
- Админы могут открыть все курсы для тестирования

### Контакты
- Email: kalikoloda66@gmail.com
- Telegram: @radev_team (Сыймыкбек: @Murka_ahh, Абдыкадыр: @Badboy05y)
- GitHub: github.com/Koloda55SA
- **Instagram: @radev.digital** (https://www.instagram.com/radev.digital?igsh=MXVkaTd0NXd0NTdnYg==)

## Структура проекта

### Основные страницы
- `/` - Главная (таймер запуска, описание платформы)
- `/courses` - Список курсов
- `/courses/[language]` - Детали курса
- `/courses/[language]/[chapterId]/[lessonId]` - Урок
- `/chat` - Чат между пользователями
- `/users/search` - Поиск пользователей
- `/users/[userId]` - Профиль пользователя
- `/profile` - Свой профиль
- `/about` - О платформе
- `/contacts` - Контакты (с Instagram)
- `/faq` - Часто задаваемые вопросы (обновлено)
- `/admin` - Админ-панель

### Компоненты
- `MobileBottomNav` - Нижняя навигация для мобильных (5 кнопок)
- `Header` - Верхняя навигация (упрощенное мобильное меню)
- `LoadingScreen` - Экран загрузки с логотипом R&A-Dev
- `OrderProjectModal` - Модальное окно заказа проекта
- `FollowersFollowingModal` - Модальное окно списков подписчиков/подписок

## Firebase Rules

### Firestore
- `subscriptions/{userId}` - подписки (read: все, write: owner + followers array)
- `profile_likes/{userId}` - лайки профилей (read: все, write: authenticated)
- `chat_messages/{chatId}` - сообщения (read/write: participants)
- `blog_posts/{postId}` - блоги (delete: только админы)

### Storage
- `avatars/{userId}/**` - аватары (read: все, write/delete: owner)
- `chat_images/{userId}/**` - изображения в чате (read/write: participants, delete: owner)

## Git Repository

**Repository:** https://github.com/Koloda55SA/R-A-DEV.git
**Branch:** main

Все курсы находятся в Git в файле `lib/courses/courseContentGenerator.ts`

## Важные замечания

1. **Название:** Всегда используй "R&A-Dev", НЕ "FreeDip"
2. **Вход:** Всегда используй `signInWithRedirect` для OAuth
3. **Мобильная навигация:** 5 кнопок внизу, упрощенное меню сверху
4. **Курсы:** Все заполнены, админы могут тестировать все
5. **Контакты:** Обязательно включай Instagram в контакты

## Последние изменения

- Исправлена ошибка `auth/internal-error` - все OAuth методы используют redirect
- Обновлена мобильная навигация - убраны лишние кнопки, добавлены Курсы и Профиль
- Добавлен Instagram в контакты
- Обновлен FAQ с информацией о платформе и курсах
- Все изменения закоммичены в Git

