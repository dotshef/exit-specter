# Implementation Plan: EXIT Admin Dashboard MVP (Organization Model)

**Branch**: `002-exit-admin-dashboard` | **Date**: 2026-01-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-exit-admin-dashboard/spec.md`

## Summary

Organization 기반의 내부용 웹 어드민 대시보드 MVP를 구현한다. Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 풀스택 단일 프로젝트로, 계정관리/광고관리/프로필 수정 기능과 역할(MASTER/AGENCY/ADVERTISER) 기반 권한 시스템을 포함한다. MASTER는 organization에 속하지 않으며 전체 시스템을 관리하고, AGENCY/ADVERTISER는 organization에 소속되어 해당 organization 범위 내에서만 데이터에 접근한다.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20+
**Primary Dependencies**: Next.js 16.1.4, React 19, Tailwind CSS v4, Prisma ORM, bcrypt
**Storage**: Supabase PostgreSQL (추후 연결), 초기에는 Prisma + SQLite/임시 데이터
**Testing**: 수동 테스트 (MVP), ESLint + TypeScript 타입 체크
**Target Platform**: Web browser (데스크톱 중심)
**Project Type**: Full-stack single Next.js project (App Router)
**Performance Goals**: 페이지 로드 < 3초, 목록 조회 < 1초, 필터 전환 < 0.5초
**Constraints**: 에러 없이 바로 실행 가능, 캡처 화면과 동일한 UI/UX
**Scale/Scope**: 내부용 MVP, 약 4개 페이지 (login, accounts, ads, profile)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution이 아직 프로젝트에 구성되지 않았음 (템플릿 상태). 기본 원칙으로 다음을 적용:
- 단순성: 최소한의 구조로 MVP 구현
- 단일 프로젝트: 풀스택 Next.js 단일 프로젝트
- 타입 안전성: TypeScript strict mode 유지

**결과**: PASS (위반 사항 없음)

## Project Structure

### Documentation (this feature)

```text
specs/002-exit-admin-dashboard/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md           # REST API contracts
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles (Tailwind)
│   ├── login/
│   │   └── page.tsx                  # 로그인 페이지
│   ├── (protected)/
│   │   ├── layout.tsx                # Protected layout (sidebar + header)
│   │   ├── accounts/
│   │   │   └── page.tsx              # 계정관리 페이지
│   │   ├── ads/
│   │   │   └── page.tsx              # 광고관리 페이지
│   │   └── profile/
│   │       └── page.tsx              # 프로필 수정 페이지
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts        # POST /api/auth/login
│       │   └── logout/route.ts       # POST /api/auth/logout
│       ├── me/route.ts               # GET /api/me
│       ├── accounts/
│       │   ├── route.ts              # GET, POST /api/accounts
│       │   └── [id]/route.ts         # PATCH, DELETE /api/accounts/:id
│       ├── ads/
│       │   ├── route.ts              # GET, POST /api/ads
│       │   └── [id]/route.ts         # PATCH /api/ads/:id
│       └── organizations/
│           └── route.ts              # GET /api/organizations (MASTER용)
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx               # 좌측 사이드바
│   │   ├── Header.tsx                # 상단 헤더 + 드롭다운
│   │   └── UserDropdown.tsx          # 사용자 드롭다운 메뉴
│   ├── ui/
│   │   ├── Modal.tsx                 # 공통 모달 컴포넌트
│   │   ├── Table.tsx                 # 공통 테이블 컴포넌트
│   │   ├── Toast.tsx                 # 토스트 알림
│   │   ├── StatsCard.tsx             # 숫자 지표 카드
│   │   ├── Button.tsx                # 버튼 (Primary/Outline)
│   │   └── Pagination.tsx            # 페이지네이션 UI
│   ├── accounts/
│   │   ├── AccountTable.tsx          # 계정 테이블
│   │   ├── AccountCreateModal.tsx    # 계정 등록 모달
│   │   └── AccountEditModal.tsx      # 계정 수정 모달
│   └── ads/
│       ├── AdTable.tsx               # 광고 테이블
│       ├── AdStatusCards.tsx          # 광고 현황 카드 (전체/광고/테스트)
│       ├── AdCreateModal.tsx          # 광고 추가 모달
│       └── AdEditModal.tsx            # 광고 수정 모달
├── lib/
│   ├── auth.ts                       # 세션/인증 유틸
│   ├── prisma.ts                     # Prisma client singleton
│   └── permissions.ts                # 권한 체크 유틸
├── types/
│   └── index.ts                      # 공통 타입 정의
└── hooks/
    └── useToast.ts                   # 토스트 상태 관리 훅

prisma/
├── schema.prisma                     # DB 스키마 정의
└── seed.ts                           # 시드 데이터
```

**Structure Decision**: Next.js App Router의 풀스택 단일 프로젝트 구조를 사용한다. API Route Handlers로 백엔드를, App Router pages로 프론트엔드를 동일 프로젝트 내에서 구현한다. 컴포넌트는 도메인별로 분리하고, 공통 UI 컴포넌트는 `components/ui/`에 배치한다.

## Complexity Tracking

> Constitution에 정의된 게이트가 없으므로 해당 없음.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
