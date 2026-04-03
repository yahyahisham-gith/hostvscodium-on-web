@echo off
setlocal
set ROOT_DIR=%~dp0..\..
call "%ROOT_DIR%\node.exe" "%ROOT_DIR%\out\server-cli.js" "code" "1.113.0" "cfbea10c5ffb233ea9177d34726e6056e89913dc" "code.cmd" %*
endlocal
