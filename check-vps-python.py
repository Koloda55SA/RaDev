#!/usr/bin/env python3
import paramiko
import sys

VPS_IP = "213.199.56.27"
VPS_USER = "root"
VPS_PASSWORD = "SYIMYKBEK18072005Zxcvb567890"

def connect_and_check():
    try:
        # Создаем SSH клиент
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        print(f"🔐 Подключение к {VPS_IP}...")
        ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASSWORD, timeout=10)
        print("✅ Подключение установлено!\n")
        
        # Команды для проверки
        commands = [
            ("📊 Система", "uname -a && hostname && whoami"),
            ("🐳 Docker", "docker ps -a"),
            ("📦 Docker Compose", "cd ~/FreeDip/backend 2>/dev/null && docker-compose ps || echo 'FreeDip backend not found'"),
            ("📁 Структура", "ls -la ~/FreeDip 2>/dev/null || echo 'FreeDip directory not found'"),
            ("🌐 Nginx", "systemctl status nginx 2>/dev/null | head -5 || echo 'Nginx not installed'"),
            ("🔧 .env файл", "cd ~/FreeDip/backend 2>/dev/null && cat .env 2>/dev/null | head -20 || echo '.env not found'"),
            ("🔌 Порты", "netstat -tulpn 2>/dev/null | grep LISTEN | head -10 || ss -tulpn | grep LISTEN | head -10"),
            ("💾 Диск", "df -h"),
            ("🧠 Память", "free -h"),
        ]
        
        for title, command in commands:
            print(f"\n{title}:")
            print("-" * 50)
            stdin, stdout, stderr = ssh.exec_command(command)
            output = stdout.read().decode('utf-8')
            error = stderr.read().decode('utf-8')
            if output:
                print(output)
            if error and 'not found' not in error.lower():
                print(f"Ошибка: {error}")
        
        ssh.close()
        print("\n✅ Проверка завершена!")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        sys.exit(1)

if __name__ == "__main__":
    connect_and_check()






