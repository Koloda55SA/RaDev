#!/bin/bash
# Скрипт для импорта данных на VPS

echo "🚀 Импорт данных в PostgreSQL на VPS..."

# Проверка наличия migration.sql
if [ ! -f "migration.sql" ]; then
    echo "❌ Файл migration.sql не найден!"
    echo "💡 Сначала выполните: node scripts/migrate-firestore-to-postgres.js"
    exit 1
fi

# Копируем SQL файл на VPS
echo "📤 Копирование migration.sql на VPS..."
scp migration.sql root@213.199.56.27:/tmp/migration.sql

# Импортируем в PostgreSQL
echo "📥 Импорт данных в PostgreSQL..."
ssh root@213.199.56.27 << 'ENDSSH'
cd /opt/freedip-backend/backend
docker exec -i freedip-postgres psql -U postgres -d freedip < /tmp/migration.sql
echo "✅ Импорт завершен!"
ENDSSH

echo "✅ Миграция данных завершена!"




