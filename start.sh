#!/bin/bash

echo "🏥 보건교육사 유사과목 심사 자동화 시스템 시작"
echo "================================================"

# 의존성 설치 확인
if [ ! -d "node_modules" ]; then
    echo "📦 의존성을 설치합니다..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 서버 의존성을 설치합니다..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 클라이언트 의존성을 설치합니다..."
    cd client && npm install && cd ..
fi

# 환경 변수 파일 확인
if [ ! -f "server/config.env" ]; then
    echo "⚠️  server/config.env 파일이 없습니다."
    echo "다음 내용으로 파일을 생성해주세요:"
    echo ""
    echo "PORT=5001"
    echo "DB_HOST=localhost"
    echo "DB_USER=root"
    echo "DB_PASSWORD=your_mysql_password"
    echo "DB_NAME=health_education_system"
    echo "JWT_SECRET=your_jwt_secret_key_here"
    echo "NODE_ENV=development"
    echo ""
    echo "MySQL 데이터베이스도 설정해주세요."
    exit 1
fi

echo "🚀 서버를 시작합니다..."
echo "프론트엔드: http://localhost:3000"
echo "백엔드 API: http://localhost:5000"
echo ""
echo "종료하려면 Ctrl+C를 누르세요."
echo ""

npm run dev