#!/bin/bash
# Скрипт для запуска существующего бэкенда на VPS
# Использование: ./start-vps-backend.sh

VPS_IP="213.199.56.27"
VPS_USER="root"

echo "🚀 Запуск бэкенда на VPS..."
echo ""

# Подключение к VPS и запуск
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
echo "=== Поиск docker-compose.yml ==="

# Проверяем разные возможные пути
COMPOSE_FILE=""
if [ -f ~/FreeDip/backend/docker-compose.yml ]; then
    COMPOSE_FILE="~/FreeDip/backend/docker-compose.yml"
    cd ~/FreeDip/backend
elif [ -f /opt/freedip-backend/backend/docker-compose.yml ]; then
    COMPOSE_FILE="/opt/freedip-backend/backend/docker-compose.yml"
    cd /opt/freedip-backend/backend
elif [ -f ~/backend/docker-compose.yml ]; then
    COMPOSE_FILE="~/backend/docker-compose.yml"
    cd ~/backend
else
    echo "❌ docker-compose.yml не найден!"
    echo "Ищу в других местах..."
    find ~ -name "docker-compose.yml" 2>/dev/null | head -1
    find /opt -name "docker-compose.yml" 2>/dev/null | head -1
    exit 1
fi

echo "✅ Найден: $COMPOSE_FILE"
echo "📂 Рабочая директория: $(pwd)"
echo ""

echo "=== Остановка существующих контейнеров ==="
docker-compose down 2>/dev/null || echo "Нет запущенных контейнеров"
echo ""

echo "=== Запуск контейнеров ==="
docker-compose up -d --build
echo ""

echo "=== Проверка статуса ==="
docker-compose ps
echo ""

echo "=== Логи (последние 20 строк) ==="
docker-compose logs --tail=20
echo ""

echo "=== Проверка API ==="
sleep 5
curl -s http://localhost:5000/health || curl -s http://localhost/api/health || echo "API еще не готов"
echo ""

echo "✅ Готово!"
ENDSSH

echo ""
echo "🌐 Проверьте API:"
echo "   http://$VPS_IP:5000/health"
echo "   http://$VPS_IP:5000/api/health"


