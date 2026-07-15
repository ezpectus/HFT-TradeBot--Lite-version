@echo off
REM ============================================================
REM  Docker Prod Build — Full Verification
REM  Builds ALL Docker images (prod) in a separate CLI window
REM  with scrollback so you can actually read the output.
REM
REM  Usage: build-docker.bat           — build all prod images
REM         build-docker.bat hft       — only HFT Trade Bot
REM         build-docker.bat exchange  — only Exchange Simulator
REM         build-docker.bat ai        — only AI Signal Bot
REM         build-docker.bat web       — only Web UI
REM ============================================================

setlocal
set PROJECT_ROOT=%~dp0
set TARGET=%1
if "%TARGET%"=="" set TARGET=all

echo ============================================
echo  Docker Prod Build — %TARGET%
echo  Root: %PROJECT_ROOT%
echo  Date: %DATE% %TIME%
echo ============================================
echo.

where docker >nul 2>&1
if errorlevel 1 (
    echo [FATAL] docker not found in PATH
    echo         Install Docker Desktop or Docker Engine
    exit /b 1
)

REM Check docker buildx
docker buildx version >nul 2>&1
if errorlevel 1 (
    echo [WARN] docker buildx not available — using legacy builder
    set BUILDCMD=docker build
    goto :build_start
)
set BUILDCMD=docker buildx build

:build_start
set EXIT_CODE=0

if /i "%TARGET%"=="all" goto :build_all
if /i "%TARGET%"=="hft" goto :build_hft
if /i "%TARGET%"=="exchange" goto :build_exchange
if /i "%TARGET%"=="ai" goto :build_ai
if /i "%TARGET%"=="web" goto :build_web
echo [ERROR] Unknown target: %TARGET%
echo         Valid: all, hft, exchange, ai, web
exit /b 1

:build_all
echo [1/4] Building Exchange Simulator (prod)...
%BUILDCMD% -f "%PROJECT_ROOT%exchange_simulator\Dockerfile" -t hft-exchange-sim:prod "%PROJECT_ROOT%exchange_simulator" 2>&1
if errorlevel 1 ( echo [FAIL] Exchange Simulator & set EXIT_CODE=1 ) else ( echo [OK] Exchange Simulator )
echo.

echo [2/4] Building AI Signal Bot (prod)...
%BUILDCMD% -f "%PROJECT_ROOT%ai-signal-bot\Dockerfile" -t hft-ai-signal-bot:prod "%PROJECT_ROOT%ai-signal-bot" 2>&1
if errorlevel 1 ( echo [FAIL] AI Signal Bot & set EXIT_CODE=1 ) else ( echo [OK] AI Signal Bot )
echo.

:build_hft
if /i "%TARGET%"=="hft" goto :build_hft_only
if /i "%TARGET%"=="all" goto :build_hft_only
goto :build_ai_check

:build_hft_only
echo [3/4] Building HFT Trade Bot (prod, C++20)...
%BUILDCMD% -f "%PROJECT_ROOT%hft-trade-bot\Dockerfile.prod" -t hft-trade-bot:prod "%PROJECT_ROOT%hft-trade-bot" 2>&1
if errorlevel 1 ( echo [FAIL] HFT Trade Bot & set EXIT_CODE=1 ) else ( echo [OK] HFT Trade Bot )
echo.

if /i "%TARGET%"=="hft" goto :build_done

:build_ai_check
if /i "%TARGET%"=="ai" goto :build_ai_only
if /i "%TARGET%"=="all" goto :build_web_skip
goto :build_web_check

:build_ai_only
echo [2/4] Building AI Signal Bot (prod)...
%BUILDCMD% -f "%PROJECT_ROOT%ai-signal-bot\Dockerfile" -t hft-ai-signal-bot:prod "%PROJECT_ROOT%ai-signal-bot" 2>&1
if errorlevel 1 ( echo [FAIL] AI Signal Bot & set EXIT_CODE=1 ) else ( echo [OK] AI Signal Bot )
echo.
goto :build_done

:build_web_skip
:build_web_check
if /i "%TARGET%"=="web" goto :build_web_only
if /i "%TARGET%"=="all" goto :build_web_only
goto :build_done

:build_web_only
echo [4/4] Building Web UI (prod)...
%BUILDCMD% -f "%PROJECT_ROOT%web-ui\Dockerfile" -t hft-web-ui:prod "%PROJECT_ROOT%web-ui" 2>&1
if errorlevel 1 ( echo [FAIL] Web UI & set EXIT_CODE=1 ) else ( echo [OK] Web UI )
echo.

:build_done
echo ============================================
echo  DOCKER BUILD SUMMARY
echo ============================================
echo.
if "%EXIT_CODE%"=="0" (
    echo  *** ALL DOCKER IMAGES BUILT SUCCESSFULLY ***
) else (
    echo  *** SOME BUILDS FAILED — see output above ***
)
echo.
echo  Exit code: %EXIT_CODE%
echo ============================================

endlocal
exit /b %EXIT_CODE%
