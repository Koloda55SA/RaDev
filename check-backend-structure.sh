#!/bin/bash

# Скрипт для проверки структуры C# Backend на VPS
# Выполните на VPS: bash check-backend-structure.sh

echo "=== Проверка структуры C# Backend ==="
echo ""

# Проверка наличия .NET
echo "1. Проверка .NET SDK:"
dotnet --version 2>/dev/null || echo "  ❌ .NET не установлен"
echo ""

# Поиск .csproj файлов
echo "2. Поиск C# проектов:"
find . -name "*.csproj" -type f 2>/dev/null | head -10
echo ""

# Поиск Program.cs или Startup.cs
echo "3. Поиск основных файлов:"
find . -name "Program.cs" -o -name "Startup.cs" 2>/dev/null | head -5
echo ""

# Проверка структуры backend
echo "4. Структура backend директории:"
if [ -d "backend" ]; then
    tree -L 3 backend 2>/dev/null || find backend -type f -name "*.cs" | head -20
else
    echo "  ❌ Директория backend не найдена"
fi
echo ""

# Проверка запущенных процессов
echo "5. Запущенные .NET процессы:"
ps aux | grep -i "dotnet\|FreeDip" | grep -v grep
echo ""

# Проверка портов
echo "6. Открытые порты (5000, 5001, 8080, 80, 443):"
netstat -tuln | grep -E ":(5000|5001|8080|80|443)" || ss -tuln | grep -E ":(5000|5001|8080|80|443)"
echo ""

# Проверка конфигурационных файлов
echo "7. Конфигурационные файлы:"
find . -name "appsettings*.json" -o -name "*.config" 2>/dev/null | head -10
echo ""

# Проверка миграций
echo "8. Миграции базы данных:"
find . -path "*/Migrations/*.cs" 2>/dev/null | head -10
echo ""

echo "=== Проверка завершена ==="





