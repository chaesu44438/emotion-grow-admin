# 감정키움 관리자 대시보드

> AI 육아 앱 "감정키움"의 사용자, 콘텐츠, AI 사용량을 관리하는 운영 도구

<br/>

## 🛠 기술 스택

### Frontend
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-2.10-FF6384?style=flat-square)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

<br/>

## 📋 프로젝트 소개

**감정키움**은 0~7세 자녀를 둔 부모를 위한 AI 기반 감정 육아 앱입니다. 부모가 아이의 감정을 기록하면 AI가 맞춤형 동화를 생성하여 감정 교육을 돕습니다.

이 관리자 대시보드는 감정키움 앱의 운영을 위해 구축되었습니다:
- 사용자 현황 파악 및 관리
- 생성된 동화 콘텐츠 모니터링
- AI API 호출량 및 비용 추적
- 서비스 이상 징후 알림

### 하나의 서비스, 두 개의 기술 스택

| 구분 | 감정키움 앱 | 관리자 대시보드 |
|------|------------|----------------|
| 플랫폼 | 모바일 (iOS/Android) | 웹 |
| Frontend | Flutter | React + TypeScript |
| Backend | Firebase | Node.js + Express |
| Database | Firestore | PostgreSQL |
| 인증 | Firebase Auth | JWT |

<br/>

## ✨ 주요 기능

### 📊 대시보드
핵심 지표를 한눈에 파악할 수 있는 메인 화면
- 총 사용자 수, 오늘 생성된 동화, 이번 달 AI 비용
- 구독 티어별 사용자 분포 (파이 차트)
- 감정 분포 현황 (바 차트)
- 최근 활동 피드

### 👥 사용자 관리
서비스 사용자를 효율적으로 관리
- 사용자 목록 조회 (페이지네이션)
- 구독 등급 / 계정 상태 / 검색 필터
- 구독 등급 변경 (FREE → BASIC → PREMIUM)
- 계정 상태 토글 (활성 ↔ 휴면)
- 사용자 정지/차단 (7일, 30일, 영구)
- 관리자 메모 및 변경 이력 추적

### 📖 동화 관리
AI가 생성한 동화 콘텐츠 모니터링
- 동화 목록 및 상세 보기
- 상태별 필터 (생성중 / 완료 / 실패)
- 감정, 내러티브 유형별 필터
- 내러티브 구조 분포 차트

### 📡 AI 사용량
API 호출 및 비용 모니터링
- 일별 API 호출량 추이 (라인 차트)
- 서비스별 비용 분포 (파이 차트)
- 월간 비용 요약

### 🔔 알림 시스템
운영 이슈를 실시간으로 파악
- 에러 / 경고 / 정보 / 시스템 알림
- 읽음 처리 및 알림 뱃지

<br/>

## 📸 스크린샷

### 대시보드
![대시보드](docs/screenshots/dashboard.png)

### 사용자 관리
![사용자 관리](docs/screenshots/users.png)

### 동화 관리
![동화 관리](docs/screenshots/stories.png)

### AI 사용량
![AI 사용량](docs/screenshots/aiusage.png)

<br/>

## 🚀 실행 방법

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm 또는 yarn

### 1. 저장소 클론
```bash
git clone https://github.com/chaesu44438/emotion-grow-admin.git
cd emotion-grow-admin
```

### 2. 환경 변수 설정

**Server** (`server/.env`)
```env
PORT=4000
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/emotion_grow_admin"
JWT_SECRET="your-super-secret-jwt-key"
```

**Client** (`client/.env`)
```env
VITE_API_URL="http://localhost:4000/api"
```

### 3. 의존성 설치
```bash
# 서버
cd server
npm install

# 클라이언트
cd ../client
npm install
```

### 4. 데이터베이스 설정
```bash
cd server

# Prisma 클라이언트 생성
npx prisma generate

# 마이그레이션 실행
npx prisma migrate dev

# 시드 데이터 삽입 (테스트용)
npm run prisma:seed
```

### 5. 실행
```bash
# 서버 (터미널 1)
cd server
npm run dev    # http://localhost:4000

# 클라이언트 (터미널 2)
cd client
npm run dev    # http://localhost:3000
```

### 6. 로그인
```
이메일: admin@emotiongrow.com
비밀번호: admin123
```

<br/>

## 📁 프로젝트 구조

```
emotion-grow-admin/
├── client/                     # Frontend (React)
│   ├── src/
│   │   ├── api/                # API 호출 함수
│   │   ├── components/
│   │   │   ├── layout/         # Header, Sidebar, Layout
│   │   │   └── ui/             # Button, Card, Modal, Toast 등
│   │   ├── hooks/              # Custom hooks
│   │   ├── pages/              # 페이지 컴포넌트
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   ├── StoriesPage.tsx
│   │   │   └── AiUsagePage.tsx
│   │   └── types/              # TypeScript 타입 정의
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── server/                     # Backend (Express)
│   ├── src/
│   │   ├── middleware/         # 인증 미들웨어
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # DB 스키마
│   │   │   └── seed.ts         # 시드 데이터
│   │   └── routes/             # API 라우트
│   │       ├── auth.ts
│   │       ├── users.ts
│   │       ├── stories.ts
│   │       ├── aiUsage.ts
│   │       └── dashboard.ts
│   └── tsconfig.json
│
├── .env.example
└── README.md
```

<br/>

## 🔗 관련 프로젝트

- **감정키움 앱** (Flutter): https://github.com/chaesu44438/emotion_grow
- **감정키움 웹사이트**: https://gamjungkium.kr

<br/>

---

<p align="center">
  Made with ❤️ for better parenting
</p>
