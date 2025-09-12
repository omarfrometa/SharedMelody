#!/bin/bash

# =============================================
# SHARED MELODY - ENVIRONMENT SETUP SCRIPT
# Script para configurar archivos .env según el ambiente
# =============================================

set -e

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [AMBIENTE]"
    echo ""
    echo "AMBIENTE:"
    echo "  development    Configurar para ambiente de desarrollo"
    echo "  production     Configurar para ambiente de producción"
    echo ""
    echo "Ejemplos:"
    echo "  $0 development"
    echo "  $0 production"
    echo ""
    echo "Este script copiará los archivos .env correspondientes al ambiente seleccionado"
}

# Verificar parámetros
if [ "$#" -ne 1 ]; then
    echo "Error: Se requiere especificar el ambiente"
    echo ""
    show_help
    exit 1
fi

ENVIRONMENT=$1

# Validar ambiente
if [ "$ENVIRONMENT" != "development" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo "Error: Ambiente '$ENVIRONMENT' no válido"
    echo ""
    show_help
    exit 1
fi

echo "🔧 Configurando ambiente: $ENVIRONMENT"
echo ""

# Configurar backend
echo "📦 Configurando backend..."
if [ -f "backend/.env.$ENVIRONMENT" ]; then
    cp "backend/.env.$ENVIRONMENT" "backend/.env"
    echo "✅ Backend .env configurado para $ENVIRONMENT"
else
    echo "❌ Error: No existe backend/.env.$ENVIRONMENT"
    exit 1
fi

# Configurar frontend
echo "🎨 Configurando frontend..."
if [ -f "frontend/.env.$ENVIRONMENT" ]; then
    cp "frontend/.env.$ENVIRONMENT" "frontend/.env"
    echo "✅ Frontend .env configurado para $ENVIRONMENT"
else
    echo "❌ Error: No existe frontend/.env.$ENVIRONMENT"
    exit 1
fi

echo ""
echo "🎉 Configuración completada para ambiente: $ENVIRONMENT"
echo ""
echo "Archivos creados:"
echo "  - backend/.env"
echo "  - frontend/.env"
echo ""
echo "Para ejecutar el proyecto:"
if [ "$ENVIRONMENT" = "development" ]; then
    echo "  docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build"
else
    echo "  docker-compose up --build"
fi