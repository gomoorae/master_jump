@echo off
chcp 65001 > nul
echo.
echo ========================================
echo   무혼 비동 - 버전 업데이트 도구
echo ========================================
echo.

if "%~1"=="" (
    echo ❌ 버전 번호를 입력해주세요!
    echo.
    echo 사용법: update-version.bat 1.0.2
    echo.
    pause
    exit /b 1
)

echo 🚀 버전 업데이트 시작: v%~1
echo.

node update-version.js %~1

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 업데이트 완료!
    echo.
) else (
    echo.
    echo ❌ 오류 발생!
    echo.
)

pause
