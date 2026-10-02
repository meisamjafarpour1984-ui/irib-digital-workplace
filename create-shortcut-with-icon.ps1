# PowerShell script to create desktop shortcut with icon for Local Development Setup Wizard

$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$TargetPath = Join-Path $ScriptPath "setup-local.bat"
$IconPath = Join-Path $ScriptPath "wizard-icon.svg"
$ShortcutPath = Join-Path ([Environment]::GetFolderPath("Desktop")) "IRIB Digital Workplace Setup.lnk"

$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetPath
$Shortcut.WorkingDirectory = $ScriptPath
$Shortcut.Description = "IRIB Digital Workplace - Local Development Setup Wizard"

# Set icon (Windows shortcuts prefer .ico files)
# For now, we'll use a system icon or leave it default
$Shortcut.IconLocation = "shell32.dll, 14"  # Generic application icon

$Shortcut.Save()

Write-Host "Desktop shortcut created: $ShortcutPath" -ForegroundColor Green
Write-Host "You can now double-click the shortcut to run the setup wizard." -ForegroundColor Cyan
Write-Host ""
Write-Host "Custom icon: wizard-icon.svg is included in the project" -ForegroundColor Yellow
Write-Host "To use custom icon, convert wizard-icon.svg to .ico format and update the script" -ForegroundColor Yellow
Write-Host "Online converter: https://convertio.co/svg-ico/" -ForegroundColor Yellow
