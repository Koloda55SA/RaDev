#!/bin/bash
# Полная проверка VPS и диагностика проблем

VPS_IP="213.199.56.27"
VPS_USER="root"

echo "🔍 Подключение к VPS и проверка..."
echo ""

ssh $VPS_USER@$VPS_IP << 'ENDSSH'
set -e

echo "=========================================="
echo "=== 1. ИНФОРМАЦИЯ О СИСТЕМЕ ==="
echo "=========================================="
uname -a
echo ""
whoami
pwd
echo ""

echo "=========================================="
echo "=== 2. ПОИСК DOCKER-COMPOSE ФАЙЛОВ ==="
echo "=========================================="
echo "Ищу в ~/FreeDip:"
find ~/FreeDip -name "docker-compose.yml" -o -name "docker-compose.yaml" 2>/dev/null || echo "Не найдено"
echo ""
echo "Ищу в /opt:"
find /opt -name "docker-compose.yml" -o -name "docker-compose.yaml" 2>/dev/null || echo "Не найдено"
echo ""
echo "Ищу в корне:"
find /root -name "docker-compose.yml" -o -name "docker-compose.yaml" 2>/dev/null | head -5 || echo "Не найдено"
echo ""

echo "=========================================="
echo "=== 3. СТРУКТУРА ДИРЕКТОРИЙ ==="
echo "=========================================="
echo "~/FreeDip:"
ls -la ~/FreeDip 2>/dev/null || echo "Директория не существует"
echo ""
echo "~/FreeDip/backend:"
ls -la ~/FreeDip/backend 2>/dev/null || echo "Директория не существует"
echo ""
echo "/opt/freedip-backend:"
ls -la /opt/freedip-backend 2>/dev/null || echo "Директория не существует"
echo ""
echo "/opt/freedip-backend/backend:"
ls -la /opt/freedip-backend/backend 2>/dev/null || echo "Директория не существует"
echo ""

echo "=========================================="
echo "=== 4. DOCKER КОНТЕЙНЕРЫ ==="
echo "=========================================="
docker ps -a
echo ""

echo "=========================================="
echo "=== 5. DOCKER COMPOSE СТАТУС ==="
echo "=========================================="
if [ -f ~/FreeDip/backend/docker-compose.yml ]; then
    echo "Найден: ~/FreeDip/backend/docker-compose.yml"
    cd ~/FreeDip/backend
    docker-compose ps 2>/dev/null || echo "Ошибка при проверке статуса"
elif [ -f /opt/freedip-backend/backend/docker-compose.yml ]; then
    echo "Найден: /opt/freedip-backend/backend/docker-compose.yml"
    cd /opt/freedip-backend/backend
    docker-compose ps 2>/dev/null || echo "Ошибка при проверке статуса"
else
    echo "docker-compose.yml не найден"
fi
echo ""

echo "=========================================="
echo "=== 6. ЛОГИ КОНТЕЙНЕРОВ ==="
echo "=========================================="
echo "--- backend-api ---"
docker logs --tail=30 backend-api 2>/dev/null || echo "Контейнер backend-api не найден"
echo ""
echo "--- freedip-api ---"
docker logs --tail=30 freedip-api 2>/dev/null || echo "Контейнер freedip-api не найден"
echo ""
echo "--- freedip-postgres ---"
docker logs --tail=20 freedip-postgres 2>/dev/null || echo "Контейнер freedip-postgres не найден"
echo ""

echo "=========================================="
echo "=== 7. ОТКРЫТЫЕ ПОРТЫ ==="
echo "=========================================="
netstat -tulpn 2>/dev/null | grep -E ":(5000|5432|80|443)" || ss -tulpn 2>/dev/null | grep -E ":(5000|5432|80|443)" || echo "Порты не найдены"
echo ""

echo "=========================================="
echo "=== 8. ПРОВЕРКА API ==="
echo "=========================================="
echo "Проверка localhost:5000:"
curl -v http://localhost:5000/health 2>&1 || echo "Ошибка подключения"
echo ""
echo "Проверка localhost/api/health:"
curl -v http://localhost/api/health 2>&1 || echo "Ошибка подключения"
echo ""

echo "=========================================="
echo "=== 9. ПРОЦЕССЫ DOTNET ==="
echo "=========================================="
ps aux | grep -i "dotnet\|FreeDip" | grep -v grep || echo "Процессы не найдены"
echo ""

echo "=========================================="
echo "=== 10. DOCKER COMPOSE ФАЙЛ (если найден) ==="
echo "=========================================="
if [ -f ~/FreeDip/backend/docker-compose.yml ]; then
    cat ~/FreeDip/backend/docker-compose.yml
elif [ -f /opt/freedip-backend/backend/docker-compose.yml ]; then
    cat /opt/freedip-backend/backend/docker-compose.yml
fi
echo ""

echo "=========================================="
echo "=== 11. .ENV ФАЙЛ (если найден) ==="
echo "=========================================="
if [ -f ~/FreeDip/backend/.env ]; then
    echo "Найден: ~/FreeDip/backend/.env"
    cat ~/FreeDip/backend/.env | head -20
elif [ -f /opt/freedip-backend/backend/.env ]; then
    echo "Найден: /opt/freedip-backend/backend/.env"
    cat /opt/freedip-backend/backend/.env | head -20
fi
echo ""

echo "=========================================="
echo "=== 12. ФАЙРВОЛ ==="
echo "=========================================="
ufw status 2>/dev/null || iptables -L -n | grep -E "5000|5432" || echo "Не удалось проверить файрвол"
echo ""

ENDSSH

echo ""
echo "✅ Проверка завершена!"



