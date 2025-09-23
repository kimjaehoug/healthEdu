# 보건교육사 유사과목 심사 자동화 시스템

보건교육사 자격 취득을 위한 유사 과목 심사를 AI 기반으로 자동화하여 신속하고 정확한 심사를 제공하는 시스템입니다.

## 🚀 주요 기능

- **사용자 인증**: 회원가입, 로그인, 비밀번호 변경
- **파일 업로드**: PDF, Word, Excel, 텍스트 파일 지원 (최대 10MB)
- **AI 자동 분석**: 교육목표, 내용, 방법 등을 종합적으로 분석
- **유사도 평가**: 5가지 기준으로 유사도 점수 산출
- **상세 결과 제공**: 유사한 점, 개선점, 권고사항 제시
- **정부 웹사이트 스타일**: 깔끔하고 신뢰할 수 있는 UI/UX

## 🛠 기술 스택

### 백엔드
- **Node.js** + **Express.js**
- **MySQL** 데이터베이스
- **JWT** 인증
- **Multer** 파일 업로드
- **bcryptjs** 비밀번호 암호화

### 프론트엔드
- **React** + **TypeScript**
- **Styled Components** 스타일링
- **React Router** 라우팅
- **Axios** HTTP 클라이언트
- **React Dropzone** 파일 드래그 앤 드롭

## 📋 시스템 요구사항

- Node.js 16.0 이상
- MySQL 8.0 이상
- npm 또는 yarn

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd health-education-system
```

### 2. 의존성 설치
```bash
# 루트 디렉토리에서
npm install

# 서버 의존성 설치
cd server
npm install

# 클라이언트 의존성 설치
cd ../client
npm install
```

### 3. 데이터베이스 설정

#### MySQL 데이터베이스 생성
```sql
CREATE DATABASE health_education_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 환경 변수 설정
`server/config.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=health_education_system
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### 4. 데이터베이스 스키마 생성
```bash
cd server
mysql -u root -p health_education_system < database.sql
```

### 5. 애플리케이션 실행

#### 개발 모드 (동시 실행)
```bash
# 루트 디렉토리에서
npm run dev
```

#### 개별 실행
```bash
# 백엔드 서버 실행
cd server
npm run dev

# 프론트엔드 실행 (새 터미널)
cd client
npm start
```

### 6. 접속
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:5000

## 📁 프로젝트 구조

```
health-education-system/
├── server/                 # 백엔드 서버
│   ├── config/            # 데이터베이스 설정
│   ├── controllers/       # 컨트롤러
│   ├── middleware/        # 미들웨어
│   ├── models/           # 데이터 모델
│   ├── routes/           # API 라우트
│   ├── uploads/          # 업로드된 파일
│   ├── database.sql      # 데이터베이스 스키마
│   └── index.js          # 서버 진입점
├── client/               # 프론트엔드
│   ├── src/
│   │   ├── components/   # React 컴포넌트
│   │   ├── pages/        # 페이지 컴포넌트
│   │   ├── services/     # API 서비스
│   │   ├── hooks/        # 커스텀 훅
│   │   ├── types/        # TypeScript 타입
│   │   └── styles/       # 스타일 컴포넌트
│   └── public/
└── package.json          # 루트 패키지 설정
```

## 🔧 API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/profile` - 사용자 정보 조회
- `PUT /api/auth/change-password` - 비밀번호 변경

### 파일 업로드
- `POST /api/upload` - 파일 업로드
- `GET /api/upload` - 업로드 목록 조회
- `GET /api/upload/:id` - 특정 파일 조회
- `GET /api/upload/:id/download` - 파일 다운로드
- `DELETE /api/upload/:id` - 파일 삭제

### 심사
- `POST /api/review/request` - 심사 요청
- `GET /api/review/result/:uploadId` - 심사 결과 조회
- `GET /api/review/my-reviews` - 사용자 심사 결과 목록
- `GET /api/review/criteria` - 심사 기준 조회

## 🎯 유사과목 심사 기준

1. **교육목표의 일치성** (25%) - 과목의 교육목표가 보건교육사 자격요건과 일치하는지 평가
2. **교육내용의 관련성** (30%) - 과목의 교육내용이 보건교육 분야와 관련성이 있는지 평가
3. **학점 및 이수시간** (15%) - 과목의 학점 및 이수시간이 기준에 부합하는지 평가
4. **교육방법의 적절성** (15%) - 과목의 교육방법이 보건교육에 적합한지 평가
5. **평가방법의 타당성** (15%) - 과목의 평가방법이 보건교육사 양성에 적합한지 평가

## 🔒 보안 기능

- JWT 토큰 기반 인증
- 비밀번호 bcrypt 암호화
- 파일 업로드 타입 및 크기 제한
- Rate limiting (15분당 100 요청)
- CORS 설정
- Helmet 보안 헤더

## 📱 반응형 디자인

- 모바일, 태블릿, 데스크톱 지원
- 정부 웹사이트 스타일 적용
- 접근성 고려한 UI/UX

## 🧪 테스트

현재 목업 데이터로 동작하며, 실제 AI 서버 연동 시 다음 기능들이 구현됩니다:

- 문서 내용 분석
- 유사도 계산 알고리즘
- 자연어 처리
- 머신러닝 모델 연동

## 📞 지원

문의사항이나 버그 리포트는 이슈 트래커를 통해 제출해주세요.

## 📄 라이선스

MIT License

---

**보건교육사 유사과목 심사 자동화 시스템**으로 보건교육사 자격 취득의 첫 걸음을 내딛어보세요! 🏥✨