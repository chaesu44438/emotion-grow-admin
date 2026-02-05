# 감정키움 관리자 대시보드

감정키움 서비스의 관리자 대시보드입니다.

## 기술 스택

### Client
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router DOM v6
- Recharts
- Axios
- Lucide React

### Server
- Express + TypeScript
- Prisma ORM
- PostgreSQL
- JWT + bcrypt

## 시작하기

### 환경 설정

```bash
cp .env.example .env
# .env 파일에서 DATABASE_URL과 JWT_SECRET 수정
```

### 서버 실행

```bash
cd server
npm install
npx prisma migrate dev
npm run dev
```

### 클라이언트 실행

```bash
cd client
npm install
npm run dev
```

## 프로젝트 구조

```
emotion-grow-admin/
├── client/          # React 프론트엔드
└── server/          # Node.js 백엔드
```
