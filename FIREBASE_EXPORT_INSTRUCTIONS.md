# 📤 Инструкции по экспорту данных из Firebase

## Быстрый способ (через Firebase Admin SDK)

1. **Скачайте serviceAccountKey.json:**
   - Откройте: https://console.firebase.google.com/project/freedip-27d92/settings/serviceaccounts/adminsdk
   - Нажмите "Generate New Private Key"
   - Сохраните файл как `serviceAccountKey.json` в корне проекта

2. **Установите зависимости:**
   ```bash
   npm install firebase-admin uuid
   ```

3. **Запустите экспорт:**
   ```bash
   node scripts/export-firestore-data.js
   ```

4. **Конвертируйте в SQL:**
   ```bash
   node scripts/migrate-firestore-to-postgres-v2.js
   ```

5. **Импортируйте на VPS:**
   ```bash
   scp migration.sql root@213.199.56.27:/tmp/
   ssh root@213.199.56.27 "docker exec -i freedip-postgres psql -U postgres -d freedip < /tmp/migration.sql"
   ```

## Альтернативный способ (через Firebase Console)

1. Откройте: https://console.firebase.google.com/project/freedip-27d92/firestore
2. Перейдите в настройки проекта
3. Используйте функцию экспорта данных
4. Сохраните экспортированные данные в папку `firestore_export/`
5. Запустите: `node scripts/migrate-firestore-to-postgres-v2.js`

## Что будет экспортировано:

- ✅ users → Users (с маппингом Firebase UID → UUID)
- ✅ subscriptions → Subscriptions
- ✅ chat_messages → Messages
- ✅ global_chat → Messages (receiver_id = NULL)
- ✅ profile_likes → Likes
- ✅ course_progress → UserProgress
- ⚠️ blog_posts, projects, reviews (нужно создать таблицы)

## Важные замечания:

1. **Маппинг UID:** Firebase использует строковые UID, PostgreSQL - UUID. Скрипт создает маппинг автоматически.

2. **Резервная копия:** Сделайте backup перед миграцией:
   ```bash
   ssh root@213.199.56.27 "docker exec freedip-postgres pg_dump -U postgres freedip > backup_$(date +%Y%m%d).sql"
   ```

3. **Проверка структуры:** Убедитесь что таблицы существуют на VPS:
   ```bash
   ssh root@213.199.56.27 "docker exec freedip-postgres psql -U postgres -d freedip -c '\d'"
   ```




