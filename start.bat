@echo off
setlocal EnableDelayedExpansion

echo Starting Redis Server...
start "Redis Server" "D:\Redis\Redis-x64-3.2.100\redis-server.exe"
:wait_redis
timeout /t 2 /nobreak >nul
netstat -an | findstr ":6379" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo Waiting for Redis to start...
    goto wait_redis
)
echo Redis Server is running.

echo Starting Ollama...
start "Ollama" cmd /c "ollama run qwen2.5:latest"
:wait_ollama
timeout /t 2 /nobreak >nul
netstat -an | findstr ":11434" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo Waiting for Ollama to start...
    goto wait_ollama
)
echo Ollama is running.

echo Starting AnythingLLM...
start "AnythingLLM" "D:\Anythingllm\AnythingLLM.exe"
:wait_anything
timeout /t 2 /nobreak >nul
tasklist /FI "IMAGENAME eq AnythingLLM.exe" | findstr "AnythingLLM.exe" >nul
if errorlevel 1 (
    echo Waiting for AnythingLLM to start...
    goto wait_anything
)
echo AnythingLLM is running.

echo All services have been started successfully!
endlocal
exit