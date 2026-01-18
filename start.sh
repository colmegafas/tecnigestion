#!/bin/bash

echo "🔧 TecniGestión - Iniciando..."
echo ""

# Verificar si Docker está instalado
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✅ Docker detectado. Iniciando con Docker..."
    docker-compose up -d
    echo ""
    echo "🚀 ¡Listo!"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:8000"
    exit 0
fi

echo "📦 Docker no detectado. Iniciando manualmente..."
echo ""

# Backend
echo "🔹 Iniciando Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "   Creando entorno virtual..."
    python3 -m venv venv
fi

source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
pip install -r requirements.txt -q
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd ..

# Frontend
echo "🔹 Iniciando Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "   Instalando dependencias..."
    npm install
fi

npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "🚀 ¡Listo!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo ""
echo "   Presiona Ctrl+C para detener"

# Esperar
wait
