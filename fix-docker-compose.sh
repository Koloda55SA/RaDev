#!/bin/bash
# Исправление docker-compose.yml и .env файла

VPS_IP="213.199.56.27"
VPS_USER="root"

echo "🔧 Исправление конфигурации на VPS..."
echo ""

ssh $VPS_USER@$VPS_IP << 'ENDSSH'
set -e

cd /opt/freedip-backend/backend

echo "=== Исправление docker-compose.yml ==="
# Меняем маппинг портов с 5000:80 на 5000:8080
sed -i 's/"5000:80"/"5000:8080"/g' docker-compose.yml
sed -i 's/"5001:443"/"5001:8081"/g' docker-compose.yml || true

echo "✅ docker-compose.yml исправлен"
cat docker-compose.yml | grep -A 2 "ports:"
echo ""

echo "=== Добавление Google OAuth в .env ==="
# Проверяем, есть ли уже Google credentials
if ! grep -q "Google__ClientId=" .env; then
    # Добавляем или обновляем Google credentials
    if grep -q "Google__ClientId=" .env; then
        sed -i 's|Google__ClientId=.*|Google__ClientId=${GOOGLE_CLIENT_ID}|' .env
        sed -i 's|Google__ClientSecret=.*|Google__ClientSecret=${GOOGLE_CLIENT_SECRET}|' .env
    else
        echo "" >> .env
        echo "Google__ClientId=${GOOGLE_CLIENT_ID}" >> .env
        echo "Google__ClientSecret=${GOOGLE_CLIENT_SECRET}" >> .env
    fi
    echo "✅ Google OAuth credentials добавлены"
else
    echo "✅ Google OAuth credentials уже есть"
fi
echo ""

echo "=== Проверка .env ==="
grep -E "Google__|JWT_SECRET|POSTGRES" .env | head -5
echo ""

echo "=== Перезапуск контейнеров ==="
docker-compose down
docker-compose up -d --build
echo ""

echo "=== Ожидание запуска (15 секунд) ==="
sleep 15
echo ""

echo "=== Проверка API ==="
for i in {1..5}; do
    echo "Попытка $i/5..."
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        echo "✅ API работает на localhost:5000"
        curl http://localhost:5000/health
        break
    else
        echo "⏳ API еще не готов..."
        sleep 3
    fi
done
echo ""

echo "=== Логи API (последние 10 строк) ==="
docker-compose logs --tail=10 api
echo ""

ENDSSH

echo ""
echo "✅ Исправление завершено!"
echo "🌐 Проверьте API:"
echo "   http://213.199.56.27:5000/health"


