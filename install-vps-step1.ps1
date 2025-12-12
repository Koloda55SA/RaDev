# Шаг 1: Подключение и копирование скрипта
$VPS_IP = "213.199.56.27"
$VPS_USER = "root"
$VPS_PASSWORD = "SYIMYKBEK18072005Zxcvb567890"

Write-Host "🔐 Подключение к VPS..." -ForegroundColor Green
Write-Host "IP: $VPS_IP" -ForegroundColor Cyan
Write-Host "Пользователь: $VPS_USER" -ForegroundColor Cyan
Write-Host ""

# Установка модуля если нужно
if (-not (Get-Module -ListAvailable -Name Posh-SSH)) {
    Write-Host "📦 Установка модуля Posh-SSH..." -ForegroundColor Yellow
    Install-Module -Name Posh-SSH -Force -Scope CurrentUser -SkipPublisherCheck
}

Import-Module Posh-SSH

# Удаление старого ключа
$knownHosts = Join-Path $env:USERPROFILE ".ssh\known_hosts"
if (Test-Path $knownHosts) {
    $content = Get-Content $knownHosts | Where-Object { $_ -notmatch '213.199.56.27' }
    $content | Set-Content $knownHosts
    Write-Host "✅ Старый ключ удален" -ForegroundColor Green
}

# Подключение
Write-Host "`n🔐 Подключение к VPS..." -ForegroundColor Cyan
$SecurePassword = ConvertTo-SecureString $VPS_PASSWORD -AsPlainText -Force
$Credential = New-Object System.Management.Automation.PSCredential($VPS_USER, $SecurePassword)

try {
    $session = New-SSHSession -ComputerName $VPS_IP -Credential $Credential -AcceptKey -ErrorAction Stop
    Write-Host "✅ Подключение установлено!" -ForegroundColor Green
    
    # Копирование скрипта
    Write-Host "`n📋 Копирование скрипта установки..." -ForegroundColor Yellow
    Set-SCPFile -ComputerName $VPS_IP -Credential $Credential -LocalFile "install-vps.sh" -RemotePath "/tmp/install.sh" -AcceptKey
    Write-Host "✅ Скрипт скопирован" -ForegroundColor Green
    
    # Запуск установки
    Write-Host "`n🚀 Запуск установки на VPS..." -ForegroundColor Yellow
    Write-Host "Это займет несколько минут..." -ForegroundColor Gray
    
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "bash /tmp/install.sh" -TimeOut 1800
    
    if ($result.ExitStatus -eq 0) {
        Write-Host "`n✅ Установка завершена успешно!" -ForegroundColor Green
        Write-Host $result.Output
    } else {
        Write-Host "`n⚠️ Ошибки:" -ForegroundColor Yellow
        Write-Host $result.Output
        if ($result.Error) {
            Write-Host $result.Error -ForegroundColor Red
        }
    }
    
    # Отключение
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    Write-Host "`n✅ Сессия закрыта" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ Ошибка: $_" -ForegroundColor Red
    Write-Host "Попробуйте подключиться вручную: ssh $VPS_USER@$VPS_IP" -ForegroundColor Yellow
}

Write-Host "`n📋 Следующие шаги:" -ForegroundColor Yellow
Write-Host "1. Скопируйте файлы на VPS" -ForegroundColor Cyan
Write-Host "2. Запустите: docker-compose up -d" -ForegroundColor Cyan

