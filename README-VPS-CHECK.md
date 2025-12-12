# Проверка настроек VPS

## Способ 1: Выполнить команды вручную

Если вы уже подключены к VPS через SSH, выполните команды из файла `vps-commands.sh`:

```bash
bash vps-commands.sh
```

Или скопируйте файл на VPS и выполните:

```bash
# На вашем компьютере
scp vps-commands.sh root@213.199.56.27:/tmp/

# На VPS
bash /tmp/vps-commands.sh
```

## Способ 2: Использовать PowerShell скрипт

Запустите на Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File check-vps-simple.ps1
```

**Примечание:** Если возникает ошибка "Key exchange negotiation failed", это означает, что VPS использует алгоритмы шифрования, которые не поддерживаются Posh-SSH по умолчанию.

## Способ 3: Использовать Python скрипт

Если на вашем компьютере установлен Python и библиотека paramiko:

```bash
pip install paramiko
python check-vps-python.py
```

## Способ 4: Выполнить команды по одной

Подключитесь к VPS и выполните команды по очереди:

```bash
ssh root@213.199.56.27

# Затем выполните:
uname -a
docker ps -a
cd ~/FreeDip/backend && docker-compose ps
cat ~/FreeDip/backend/.env
df -h
free -h
```

## Что проверяется:

1. ✅ Информация о системе (OS, hostname)
2. ✅ Docker контейнеры
3. ✅ Docker Compose статус
4. ✅ Структура директорий FreeDip
5. ✅ Nginx статус
6. ✅ Переменные окружения (.env)
7. ✅ Открытые порты
8. ✅ Дисковое пространство
9. ✅ Использование памяти
10. ✅ Docker образы
11. ✅ Логи Docker Compose
12. ✅ Сетевые интерфейсы
13. ✅ Проверка API health





