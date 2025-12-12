#!/bin/bash
# Финальная проверка API

VPS_IP="213.199.56.27"
VPS_USER="root"

echo "✅ ФИНАЛЬНАЯ ПРОВЕРКА API"
echo ""

ssh $VPS_USER@$VPS_IP << 'ENDSSH'
echo "=== Проверка изнутри VPS ==="
echo "1. localhost:5000/health:"
curl -s http://localhost:5000/health
echo ""
echo ""

echo "2. localhost:5000/api/health:"
curl -s http://localhost:5000/api/health || echo "Не найден"
echo ""
echo ""

echo "=== Статус контейнеров ==="
docker-compose -f /opt/freedip-backend/backend/docker-compose.yml ps
echo ""

echo "=== Порты ==="
netstat -tulpn 2>/dev/null | grep -E ":(5000|8080)" || ss -tulpn 2>/dev/null | grep -E ":(5000|8080)"
echo ""

echo "=== Google OAuth в .env ==="
grep "Google__" /opt/freedip-backend/backend/.env
echo ""

ENDSSH

echo ""
echo "=== Проверка извне ==="
echo "Проверьте в браузере:"
echo "  http://$VPS_IP:5000/health"
echo ""
echo "Или используйте:"
echo "  curl http://$VPS_IP:5000/health"
echo ""


