#!/bin/bash
# Проверка эндпоинта Google OAuth и логов

VPS_IP="213.199.56.27"
VPS_USER="root"

echo "🔍 Проверка Google OAuth эндпоинта..."
echo ""

ssh $VPS_USER@$VPS_IP << 'ENDSSH'
cd /opt/freedip-backend/backend

echo "=== Логи API (последние 50 строк) ==="
docker-compose logs --tail=50 api | grep -E "auth|google|error|Error|ERROR|fail|Fail|FAIL" || docker-compose logs --tail=50 api
echo ""

echo "=== Проверка эндпоинта /auth/google ==="
echo "Тестовый запрос:"
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","name":"Test","googleId":"123"}' \
  -v 2>&1 | head -30
echo ""
echo ""

echo "=== Проверка структуры контроллеров ==="
find FreeDip.Api/Controllers -name "*Auth*" -o -name "*Google*" 2>/dev/null || echo "Контроллеры не найдены"
echo ""

echo "=== Список всех контроллеров ==="
ls -la FreeDip.Api/Controllers/ 2>/dev/null || echo "Директория Controllers не найдена"
echo ""

echo "=== Проверка Program.cs на маршруты ==="
grep -i "auth\|google\|map" FreeDip.Api/Program.cs 2>/dev/null | head -20 || echo "Program.cs не найден или нет маршрутов"
echo ""

ENDSSH

echo ""
echo "✅ Проверка завершена!"



