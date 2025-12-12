#!/bin/bash
# Исправление и запуск API на VPS

VPS_IP="213.199.56.27"
VPS_USER="root"

echo "🔧 Исправление и запуск API на VPS..."
echo ""

ssh $VPS_USER@$VPS_IP << 'ENDSSH'
set -e

echo "=== Поиск docker-compose.yml ==="
COMPOSE_DIR=""
if [ -f ~/FreeDip/backend/docker-compose.yml ]; then
    COMPOSE_DIR="~/FreeDip/backend"
    cd ~/FreeDip/backend
elif [ -f /opt/freedip-backend/backend/docker-compose.yml ]; then
    COMPOSE_DIR="/opt/freedip-backend/backend"
    cd /opt/freedip-backend/backend
else
    echo "❌ docker-compose.yml не найден!"
    exit 1
fi

echo "✅ Найден в: $COMPOSE_DIR"
echo "📂 Текущая директория: $(pwd)"
echo ""

echo "=== Остановка старых контейнеров ==="
docker-compose down 2>/dev/null || echo "Нет запущенных контейнеров"
echo ""

echo "=== Проверка директории uploads ==="
if [ ! -d "./uploads" ]; then
    echo "Создаю директорию uploads..."
    mkdir -p ./uploads
    chmod 755 ./uploads
fi
echo ""

echo "=== Запуск контейнеров ==="
docker-compose up -d --build
echo ""

echo "=== Ожидание запуска (10 секунд) ==="
sleep 10
echo ""

echo "=== Статус контейнеров ==="
docker-compose ps
echo ""

echo "=== Логи API (последние 30 строк) ==="
docker-compose logs --tail=30 api 2>/dev/null || docker-compose logs --tail=30
echo ""

echo "=== Проверка API ==="
for i in {1..5}; do
    echo "Попытка $i/5..."
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        echo "✅ API работает на localhost:5000"
        curl http://localhost:5000/health
        break
    elif curl -s http://localhost/api/health > /dev/null 2>&1; then
        echo "✅ API работает на localhost/api/health"
        curl http://localhost/api/health
        break
    else
        echo "⏳ API еще не готов, жду..."
        sleep 3
    fi
done
echo ""

echo "=== Проверка портов ==="
netstat -tulpn 2>/dev/null | grep -E ":(5000|5432)" || ss -tulpn 2>/dev/null | grep -E ":(5000|5432)" || echo "Порты не найдены"
echo ""

echo "=== Файрвол ==="
if command -v ufw > /dev/null; then
    echo "Открываю порт 5000 в ufw..."
    ufw allow 5000/tcp 2>/dev/null || echo "Порт уже открыт или ошибка"
    ufw status | grep 5000 || echo "Порт не найден в статусе"
fi
echo ""

echo "✅ Готово!"
ENDSSH

echo ""
echo "🌐 Проверьте API:"
echo "   http://$VPS_IP:5000/health"
echo "   http://$VPS_IP:5000/api/health"


