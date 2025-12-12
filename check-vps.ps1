# Script to check VPS settings
$VPS_IP = "213.199.56.27"
$VPS_USER = "root"
$VPS_PASSWORD = "SYIMYKBEK18072005Zxcvb567890"

Write-Host "Connecting to VPS..." -ForegroundColor Green

# Install module if needed
if (-not (Get-Module -ListAvailable -Name Posh-SSH)) {
    Write-Host "Installing Posh-SSH module..." -ForegroundColor Yellow
    Install-Module -Name Posh-SSH -Force -Scope CurrentUser -SkipPublisherCheck
}

Import-Module Posh-SSH

$SecurePassword = ConvertTo-SecureString $VPS_PASSWORD -AsPlainText -Force
$Credential = New-Object System.Management.Automation.PSCredential($VPS_USER, $SecurePassword)

try {
    $session = New-SSHSession -ComputerName $VPS_IP -Credential $Credential -AcceptKey -KeyExchange @('diffie-hellman-group-exchange-sha256','diffie-hellman-group14-sha256','diffie-hellman-group-exchange-sha1','diffie-hellman-group14-sha1') -ErrorAction Stop
    Write-Host "Connection established!" -ForegroundColor Green
    
    # System info
    Write-Host "`nSystem Information:" -ForegroundColor Cyan
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "uname -a; hostname; whoami"
    Write-Host $result.Output
    
    # Docker
    Write-Host "`nDocker Containers:" -ForegroundColor Cyan
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "docker ps -a"
    Write-Host $result.Output
    
    # Docker Compose
    Write-Host "`nDocker Compose:" -ForegroundColor Cyan
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd ~/FreeDip/backend 2>/dev/null; docker-compose ps 2>/dev/null || echo 'FreeDip backend not found'"
    Write-Host $result.Output
    
    # Directory structure
    Write-Host "`nFreeDip Structure:" -ForegroundColor Cyan
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "ls -la ~/FreeDip 2>/dev/null || echo 'FreeDip directory not found'"
    Write-Host $result.Output
    
    # Nginx
    Write-Host "`nNginx Status:" -ForegroundColor Cyan
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "systemctl status nginx 2>/dev/null | head -5 || echo 'Nginx not installed'"
    Write-Host $result.Output
    
    # Environment variables
    Write-Host "`nBackend .env file:" -ForegroundColor Cyan
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd ~/FreeDip/backend 2>/dev/null; cat .env 2>/dev/null | head -20 || echo '.env not found'"
    Write-Host $result.Output
    
    # Ports
    Write-Host "`nOpen Ports:" -ForegroundColor Cyan
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "netstat -tulpn 2>/dev/null | grep LISTEN | head -10 || ss -tulpn 2>/dev/null | grep LISTEN | head -10"
    Write-Host $result.Output
    
    # Disk space
    Write-Host "`nDisk Space:" -ForegroundColor Cyan
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "df -h"
    Write-Host $result.Output
    
    # Memory
    Write-Host "`nMemory Usage:" -ForegroundColor Cyan
    $result = Invoke-SSHCommand -SessionId $session.SessionId -Command "free -h"
    Write-Host $result.Output
    
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
    Write-Host "`nCheck completed!" -ForegroundColor Green
    
} catch {
    Write-Host "`nError: $_" -ForegroundColor Red
}
