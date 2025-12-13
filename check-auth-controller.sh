#!/bin/bash
# Проверка AuthController на VPS

VPS_IP="213.199.56.27"
VPS_USER="root"

echo "🔍 Проверка AuthController..."
echo ""

ssh $VPS_USER@$VPS_IP << 'ENDSSH'
cd /opt/freedip-backend/backend

echo "=== Содержимое AuthController.cs ==="
cat FreeDip.Api/Controllers/AuthController.cs
echo ""

ENDSSH

echo ""
echo "✅ Проверка завершена!"



