@echo off
title Certificate Generator
color 0e

echo [1/2] Cleaning up old .pem files...
del /q *.pem >nul 2>&1

echo [2/2] Generating fresh localhost certificates...
mkcert localhost 127.0.0.1 ::1

echo.
echo [DONE] Certificates generated. Start server.js now.
pause