@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM Publish folder
set publishFolder=..\_publish_local

REM Create folder if it doesn't exist
if not exist "%publishFolder%" mkdir "%publishFolder%"

REM Get package name (remove quotes)
for /f %%i in ('npm pkg get name') do set pkgName=%%i
set pkgName=%pkgName:"=%

REM Get package version (remove quotes)
for /f %%i in ('npm pkg get version') do set pkgVersion=%%i
set pkgVersion=%pkgVersion:"=%

REM Build filename
set fileName=%pkgName%-%pkgVersion%.tgz

REM Pack to destination
npm pack --pack-destination "%publishFolder%"

REM Full path to tarball
set filePath=%publishFolder%\%fileName%

REM Extract tarball (Windows 10+ ships with tar)
tar -xzf "%filePath%" -C "%publishFolder%"

REM Output result
echo %filePath%

endlocal