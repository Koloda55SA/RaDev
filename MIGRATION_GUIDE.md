# 📋 Руководство по миграции данных из Firebase на VPS

## Шаг 1: Экспорт данных из Firebase

### Вариант A: Через Firebase Admin SDK (рекомендуется)

1. **Скачайте serviceAccountKey.json:**
   - Откройте https://console.firebase.google.com/project/freedip-27d92/settings/serviceaccounts/adminsdk
   - Нажмите "Generate New Private Key"
   - Сохраните файл как `serviceAccountKey.json` в корне проекта

2. **Установите зависимости:**
   ```bash
   npm install firebase-admin
   ```

3. **Запустите экспорт:**
   ```bash
   node scripts/export-firestore-data.js
   ```

### Вариант B: Через Firebase Console

1. Откройте https://console.firebase.google.com/project/freedip-27d92/firestore
2. Перейдите в настройки проекта
3. Используйте функцию экспорта данных
4. Сохраните экспортированные данные в папку `firestore_export/`

### Вариант C: Через gcloud CLI (если установлен)

```bash
gcloud firestore export gs://freedip-27d92.appspot.com/backup
```

## Шаг 2: Конвертация данных в SQL

После экспорта данных запустите:

```bash
node scripts/migrate-firestore-to-postgres.js
```

Это создаст файл `migration.sql` с SQL командами для импорта.

## Шаг 3: Импорт на VPS

### Автоматический импорт:

```bash
bash scripts/import-to-vps.sh
```

### Ручной импорт:

```bash
# Копируем SQL файл на VPS
scp migration.sql root@213.199.56.27:/tmp/migration.sql

# Импортируем в PostgreSQL
ssh root@213.199.56.27 "docker exec -i freedip-postgres psql -U postgres -d freedip < /tmp/migration.sql"
```

## Шаг 4: Проверка миграции

```bash
ssh root@213.199.56.27 "docker exec freedip-postgres psql -U postgres -d freedip -c 'SELECT COUNT(*) FROM \"Users\";'"
```

## Важные замечания

1. **ID пользователей:** Firebase использует строковые ID (UID), а PostgreSQL на VPS использует UUID. Нужно создать маппинг или использовать строковые ID.

2. **Структура таблиц:** Проверьте структуру таблиц на VPS перед миграцией:
   ```bash
   ssh root@213.199.56.27 "docker exec freedip-postgres psql -U postgres -d freedip -c '\d \"Users\"'"
   ```

3. **Резервная копия:** Сделайте резервную копию базы данных перед миграцией:
   ```bash
   ssh root@213.199.56.27 "docker exec freedip-postgres pg_dump -U postgres freedip > backup_$(date +%Y%m%d).sql"
   ```

## Структура данных для миграции

### Коллекции Firebase → Таблицы PostgreSQL:

- `users` → `Users`
- `subscriptions` → `Subscriptions` (если существует)
- `chat_messages` → `Messages` (если существует)
- `global_chat` → `GlobalMessages` (если существует)
- `profile_likes` → `ProfileLikes` (если существует)
- `course_progress` → `UserProgress`
- `blog_posts` → (нужно создать таблицу)
- `projects` → (нужно создать таблицу)
- `reviews` → (нужно создать таблицу)

---

*После миграции данных обновите frontend код для использования только C# API*




