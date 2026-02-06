@echo off
echo Starting University Chatbot V3...

:: Start Backend
echo Starting Backend...
cd backend
if exist ..\.venv\Scripts\activate (
    echo Activating existing virtual environment...
    call ..\.venv\Scripts\activate
) else (
    echo Creating virtual environment...
    python -m venv ..\.venv
    call ..\.venv\Scripts\activate
    echo Installing dependencies...
    pip install -r requirements.txt
)
start "Chatbot Backend" cmd /k "..\.venv\Scripts\activate && python run.py"
cd ..

:: Start Frontend
echo Starting Frontend...
cd frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)
start "Chatbot Frontend" cmd /k "npm run dev"
cd ..

:: Start Admin Panel
echo Starting Admin Panel...
cd admin
if not exist node_modules (
    echo Installing admin dependencies...
    call npm install
)
start "Chatbot Admin" cmd /k "npm run dev"
cd ..

echo Application started! Validating urls...
timeout /t 5
echo Opening Frontend at http://localhost:3000
start http://localhost:3000
echo Opening Admin Panel at http://localhost:3001
start http://localhost:3001
