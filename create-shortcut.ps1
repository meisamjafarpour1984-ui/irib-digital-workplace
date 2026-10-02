# PowerShell script to create desktop shortcut for Local Development Setup Wizard

$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$TargetPath = Join-Path $ScriptPath "setup-local.bat"
$ShortcutPath = Join-Path ([Environment]::GetFolderPath("Desktop")) "IRIB Digital Workplace Setup.lnk"

$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetPath
$Shortcut.WorkingDirectory = $ScriptPath
$Shortcut.Description = "IRIB Digital Workplace - Local Development Setup Wizard"
$Shortcut.Save()

Write-Host "Desktop shortcut created: $ShortcutPath" -ForegroundColor Green
Write-Host "You can now double-click the shortcut to run the setup wizard." -ForegroundColor Cyan
