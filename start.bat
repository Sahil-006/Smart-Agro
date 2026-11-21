@echo off
TITLE Smart-Agro Local Launcher
COLOR 0A
cls
python start.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Python was not found in PATH or exited with an error.
    echo Trying Backend virtualenv python...
    Backend\venv\Scripts\python.exe start.py
)
pause
