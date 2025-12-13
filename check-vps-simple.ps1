$VPS_IP = "213.199.56.27"
$VPS_USER = "root"
$VPS_PASSWORD = "SYIMYKBEK18072005Zxcvb567890"

if (-not (Get-Module -ListAvailable -Name Posh-SSH)) {
    Install-Module -Name Posh-SSH -Force -Scope CurrentUser -SkipPublisherCheck
}
Import-Module Posh-SSH

$pass = ConvertTo-SecureString $VPS_PASSWORD -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential($VPS_USER, $pass)

try {
    $s = New-SSHSession -ComputerName $VPS_IP -Credential $cred -AcceptKey
    Write-Host "Connected!"
    
    $cmds = @(
        "uname -a",
        "docker ps -a",
        "ls -la ~/FreeDip",
        "cd ~/FreeDip/backend && docker-compose ps",
        "cat ~/FreeDip/backend/.env",
        "df -h",
        "free -h"
    )
    
    foreach ($cmd in $cmds) {
        Write-Host "`n=== $cmd ===" -ForegroundColor Yellow
        $r = Invoke-SSHCommand -SessionId $s.SessionId -Command $cmd
        Write-Host $r.Output
    }
    
    Remove-SSHSession -SessionId $s.SessionId
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}






