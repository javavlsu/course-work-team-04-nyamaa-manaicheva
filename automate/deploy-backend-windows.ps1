$ErrorActionPreference = "Stop"

$projectDir = "$PSScriptRoot\..\backend"
$tomcatWebapps = "C:\Program Files\Apache Software Foundation\Tomcat 10.1\webapps"
$warName = "notesbook.war"

Set-Location $projectDir

if (Test-Path ".\${warName}") {
    Remove-Item ".\${warName}" -Force
}

Get-ChildItem "$tomcatWebapps\notesbook*" -ErrorAction SilentlyContinue | Remove-Item -Force -Recurse

mvn clean package

Copy-Item ".\target\${warName}" $tomcatWebapps

<#
run code:
powershell -ExecutionPolicy Bypass -File "C:\Users\Luver\Desktop\course-work-team-04-nyamaa-manaicheva\automate\deploy-backend-windows.ps1"

docker db start:
docker compose -f compose.yml up -d
#>