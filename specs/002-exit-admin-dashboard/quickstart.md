# Quickstart: EXIT Admin Dashboard MVP

**Date**: 2026-01-23
**Feature**: 002-exit-admin-dashboard

## Prerequisites

- Node.js 20+ installed
- npm or yarn

## Setup Steps

### 1. Install Dependencies

```bash
npm install prisma @prisma/client bcryptjs jose
npm install -D @types/bcryptjs
```

### 2. Environment Configuration

Create `.env` file at project root:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="exit-admin-dashboard-secret-key-change-in-production"
```

### 3. Initialize Prisma

```bash
npx prisma init --datasource-provider sqlite
```

Then replace `prisma/schema.prisma` with the schema from `data-model.md`.

### 4. Create and Seed Database

```bash
npx prisma db push
npx prisma db seed
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

Install tsx for seed execution:
```bash
npm install -D tsx
```

### 5. Run Development Server

```bash
npm run dev
```

### 6. Access Application

- Open http://localhost:3000/login
- Login with seed accounts:
  - MASTER: `specter` / `0000`
  - AGENCY: `alpha` / `0000`
  - ADVERTISER: `yellow` / `0000`

## Key Technical Decisions

| Area | Decision | Reason |
|------|----------|--------|
| DB | SQLite (via Prisma) | 로컬 개발 편의, 추후 PostgreSQL 전환 용이 |
| Auth | JWT in HTTP-only cookie (jose) | Edge 호환, 서버 사이드 세션 스토어 불필요 |
| Password | bcryptjs | 순수 JS, 빌드 이슈 없음 |
| Toast | 자체 구현 | 의존성 최소화 |
| Styling | Tailwind CSS v4 (이미 설치) | 프로젝트 기존 설정 유지 |

## Development Workflow

1. DB 스키마 변경: `prisma/schema.prisma` 수정 → `npx prisma db push`
2. 시드 데이터 리셋: `npx prisma db push --force-reset && npx prisma db seed`
3. Prisma Studio (DB 확인): `npx prisma studio`

## File Structure Overview

```
src/app/login/page.tsx          → 로그인 페이지
src/app/(protected)/layout.tsx  → 인증된 사용자 레이아웃 (sidebar + header)
src/app/(protected)/accounts/   → 계정관리
src/app/(protected)/ads/        → 광고관리
src/app/(protected)/profile/    → 프로필 수정
src/app/api/                    → API Route Handlers
src/components/                 → UI 컴포넌트
src/lib/                        → 유틸리티 (auth, prisma, permissions)
prisma/                         → DB 스키마 + 시드
```
