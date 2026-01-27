$password = ConvertTo-SecureString "960730lk,." -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ("root", $password)

$command = "cd /home/recipe-mini-program/backend && pm2 restart recipe-api"

$session = New-SSHSession -ComputerName 121.199.164.252 -Credential $credential -AcceptKey
Invoke-SSHCommand -SessionId $session.SessionId -Command $command
Remove-SSHSession -SessionId $session.SessionId