@echo off

:: This script should be placed inside the extracted WAR folder.
:: The script will repackage the contents into a new WAR file.

:: Name of the new WAR file
set NEW_WAR_NAME=mapstore.war

:: Make sure we're in the right directory (where the WAR files were extracted)
if not exist "WEB-INF" (
  echo Error: Not in the extracted WAR directory. Make sure you're in the correct folder.
  exit /b 1
)

:: Repackage the contents back into a WAR file
echo Repackaging the WAR file...
powershell -command "Compress-Archive -Path * -DestinationPath ..\%NEW_WAR_NAME%"

:: Check if the new WAR file was created
if exist "..\%NEW_WAR_NAME%" (
  echo The WAR file has been successfully created: %NEW_WAR_NAME%
) else (
  echo Error: Failed to create the WAR file.
  exit /b 1
)
