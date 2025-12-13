#!/bin/bash
# Скрипт для проверки и запуска существующей конфигурации на VPS
# Использование: ./check-and-start-vps.sh

VPS_IP="213.199.56.27"
VPS_USER="root"

echo "🔍 Проверка существующей конфигурации на VPS..."
echo ""

# Подключение к VPS и проверка
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
echo "=== Информация о системе ==="
uname -a
echo ""

echo "=== Текущая директория ==="
pwd
echo ""

echo "=== Поиск FreeDip директорий ==="
find ~ -type d -name "FreeDip" -o -name "freedip*" 2>/dev/null | head -5
find /opt -type d -name "FreeDip" -o -name "freedip*" 2>/dev/null | head -5
echo ""

echo "=== Docker контейнеры ==="
docker ps -a
echo ""

echo "=== Docker Compose файлы ==="
find ~ -name "docker-compose.yml" -o -name "docker-compose.yaml" 2>/dev/null
find /opt -name "docker-compose.yml" -o -name "docker-compose.yaml" 2>/dev/null
echo ""

echo "=== Структура ~/FreeDip/backend (если существует) ==="
if [ -d ~/FreeDip/backend ]; then
    ls -la ~/FreeDip/backend/
    echo ""
    if [ -f ~/FreeDip/backend/docker-compose.yml ]; then
        echo "--- docker-compose.yml найден ---"
        cat ~/FreeDip/backend/docker-compose.yml
    fi
fi
echo ""

echo "=== Структура /opt/freedip-backend/backend (если существует) ==="
if [ -d /opt/freedip-backend/backend ]; then
    ls -la /opt/freedip-backend/backend/
    echo ""
    if [ -f /opt/freedip-backend/backend/docker-compose.yml ]; then
        echo "--- docker-compose.yml найден ---"
        cat /opt/freedip-backend/backend/docker-compose.yml
    fi
fi
echo ""

echo "=== Открытые порты ==="
netstat -tulpn 2>/dev/null | grep LISTEN | grep -E ":(5000|5432|80|443)" || ss -tulpn 2>/dev/null | grep LISTEN | grep -E ":(5000|5432|80|443)"
echo ""

echo "=== Проверка API ==="
curl -s http://localhost:5000/health 2>/dev/null || echo "API не отвечает на localhost:5000"
curl -s http://localhost/api/health 2>/dev/null || echo "API не отвечает на localhost/api/health"
echo ""

echo "=== Логи последних контейнеров ==="
if docker ps -a | grep -q "freedip\|backend"; then
    echo "--- Логи freedip-postgres ---"
    docker logs --tail=10 freedip-postgres 2>/dev/null || echo "Контейнер freedip-postgres не найден"
    echo ""
    echo "--- Логи backend-api ---"
    docker logs --tail=10 backend-api 2>/dev/null || echo "Контейнер backend-api не найден"
    echo ""
    echo "--- Логи freedip-api ---"
    docker logs --tail=10 freedip-api 2>/dev/null || echo "Контейнер freedip-api не найден"
fi
ENDSSH

echo ""
echo "✅ Проверка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Если docker-compose.yml найден, перейдите в его директорию"
echo "2. Запустите: docker-compose up -d"
echo "3. Проверьте логи: docker-compose logs -f"



