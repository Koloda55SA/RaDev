#!/bin/bash
# Команды для проверки настроек VPS
# Выполните эти команды на VPS после подключения через SSH

echo "=== System Information ==="
uname -a
hostname
whoami

echo -e "\n=== Docker Containers ==="
docker ps -a

echo -e "\n=== Docker Compose Status ==="
cd ~/FreeDip/backend 2>/dev/null && docker-compose ps || echo "FreeDip backend not found"

echo -e "\n=== FreeDip Directory Structure ==="
ls -la ~/FreeDip 2>/dev/null || echo "FreeDip directory not found"

echo -e "\n=== Nginx Status ==="
systemctl status nginx 2>/dev/null | head -5 || echo "Nginx not installed"

echo -e "\n=== Backend .env file ==="
cd ~/FreeDip/backend 2>/dev/null && cat .env 2>/dev/null | head -30 || echo ".env not found"

echo -e "\n=== Open Ports ==="
netstat -tulpn 2>/dev/null | grep LISTEN | head -10 || ss -tulpn 2>/dev/null | grep LISTEN | head -10

echo -e "\n=== Disk Space ==="
df -h

echo -e "\n=== Memory Usage ==="
free -h

echo -e "\n=== Docker Images ==="
docker images

echo -e "\n=== Docker Compose Logs (last 20 lines) ==="
cd ~/FreeDip/backend 2>/dev/null && docker-compose logs --tail=20 2>/dev/null || echo "No logs"

echo -e "\n=== Network Interfaces ==="
ip addr show | grep -E "^[0-9]+:|inet " || ifconfig

echo -e "\n=== Check API Health ==="
curl -s http://localhost:5000/health 2>/dev/null || curl -s http://localhost/api/health 2>/dev/null || echo "API not responding"






