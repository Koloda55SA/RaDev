#!/bin/bash
# Скрипт для проверки VPS через expect

VPS_IP="213.199.56.27"
VPS_USER="root"
VPS_PASSWORD="SYIMYKBEK18072005Zxcvb567890"

# Проверяем наличие expect
if ! command -v expect &> /dev/null; then
    echo "❌ expect не установлен. Установите: apt-get install expect (Linux) или brew install expect (Mac)"
    exit 1
fi

expect << EOF
set timeout 30
spawn ssh ${VPS_USER}@${VPS_IP}
expect {
    "yes/no" { send "yes\r"; exp_continue }
    "password:" { send "${VPS_PASSWORD}\r" }
}
expect "# "
send "echo '=== Система ===' && uname -a && hostname && whoami\r"
expect "# "
send "echo '=== Docker ===' && docker ps -a\r"
expect "# "
send "echo '=== Docker Compose ===' && cd ~/FreeDip/backend 2>/dev/null && docker-compose ps || echo 'FreeDip backend not found'\r"
expect "# "
send "echo '=== Структура ===' && ls -la ~/FreeDip 2>/dev/null || echo 'FreeDip directory not found'\r"
expect "# "
send "echo '=== Nginx ===' && systemctl status nginx 2>/dev/null | head -5 || echo 'Nginx not installed'\r"
expect "# "
send "echo '=== .env ===' && cd ~/FreeDip/backend 2>/dev/null && cat .env 2>/dev/null | head -20 || echo '.env not found'\r"
expect "# "
send "echo '=== Порты ===' && netstat -tulpn 2>/dev/null | grep LISTEN | head -10 || ss -tulpn | grep LISTEN | head -10\r"
expect "# "
send "echo '=== Диск ===' && df -h\r"
expect "# "
send "echo '=== Память ===' && free -h\r"
expect "# "
send "exit\r"
expect eof
EOF






