#!/bin/bash
set -e

# 데이터베이스 마이그레이션 실행
echo "Running database migrations..."
alembic upgrade head

# API 서버 실행
echo "Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT