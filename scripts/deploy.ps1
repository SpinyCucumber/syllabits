# Build project
npm run build

echo "Uploading dist..."

# Load configuration
$config_path = "deploy.cfg"
$dist_path = "dist"
$config = Get-Content $config_path | Out-String | ConvertFrom-StringData

$password = ConvertTo-SecureString $config.password -AsPlainText -Force
$credentials = New-Object System.Management.Automation.PSCredential ($config.username, $password)

$session = New-SFTPSession -ComputerName $config.host -Port $config.port -Credential $credentials

# Upload dist
# I really don't like this sftp library and would like to find a better one :(
Set-SFTPItem -SessionId $session.SessionId -Path $dist_path -Destination .
Remove-SFTPItem -SessionId $session.SessionId -Path $config.remote_dir -Force
Move-SFTPItem -SessionId $session.SessionId -Path $dist_path -Destination $config.remote_dir

Remove-SFTPSession -SFTPSession $session

echo "Done"