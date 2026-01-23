# Research: EXIT Admin Dashboard MVP (Organization Model)

**Date**: 2026-01-23
**Feature**: 002-exit-admin-dashboard

## Research Summary

All technical unknowns have been resolved. This document captures the decisions made for the implementation.

---

## R-001: Session Management with HTTP-only Cookies in Next.js 16 App Router

**Decision**: Use `jose` library for JWT token generation/verification, stored in HTTP-only cookies via Next.js `cookies()` API.

**Rationale**:
- Next.js App Router에서 HTTP-only 쿠키 기반 세션은 `cookies()` API로 간단히 구현 가능
- JWT를 사용하면 서버 사이드에서 세션 스토어 없이 상태를 유지 가능
- `jose`는 Edge Runtime 호환이 가능한 경량 JWT 라이브러리
- MVP에 적합한 수준의 보안성 제공

**Alternatives considered**:
- `next-auth`: 과도한 기능 (OAuth 등), 단순 ID/PW 인증에는 오버엔지니어링
- `iron-session`: 좋은 선택이지만 jose만으로도 충분
- 자체 세션 테이블: DB 의존성 추가, MVP에는 과도

---

## R-002: Password Hashing with bcrypt

**Decision**: `bcryptjs` 패키지 사용 (순수 JavaScript 구현)

**Rationale**:
- `bcrypt`는 native addon으로 빌드 이슈가 있을 수 있음
- `bcryptjs`는 순수 JS 구현으로 빌드/배포가 단순
- 성능 차이는 MVP 규모에서 무시 가능
- spec에서 bcrypt 해싱을 명시적으로 요구

**Alternatives considered**:
- `bcrypt` (native): 빌드 환경 의존성 문제 가능
- `argon2`: 더 현대적이지만 spec에서 bcrypt 지정

---

## R-003: Database Strategy (초기 MVP)

**Decision**: Prisma + SQLite를 초기 개발용으로 사용, 추후 Supabase PostgreSQL로 전환

**Rationale**:
- spec에서 "초기에는 실제 DB 연결 없이 임시 데이터로 UI 동작 확인" 명시
- SQLite는 설치 없이 로컬에서 바로 동작
- Prisma를 사용하면 DB 전환 시 스키마만 변경하면 됨 (provider만 수정)
- 시드 데이터를 Prisma seed로 관리하면 일관성 유지

**Alternatives considered**:
- In-memory 데이터 (변수/JSON): API 재시작 시 데이터 소실, 비현실적
- Supabase PostgreSQL 즉시 연결: 외부 의존성으로 로컬 개발 복잡도 증가

---

## R-004: Tailwind CSS v4 Usage Patterns

**Decision**: Tailwind CSS v4 (이미 설치됨)를 그대로 사용, `@import "tailwindcss"` 구문 유지

**Rationale**:
- 프로젝트에 이미 Tailwind CSS v4가 `@tailwindcss/postcss` 플러그인으로 설치되어 있음
- v4는 `@import "tailwindcss"` 구문을 사용 (v3의 @tailwind 지시어 대신)
- CSS 변수 기반 테마 시스템이 기본 내장
- 별도의 tailwind.config는 필요 없음 (v4는 CSS-first configuration)

**Alternatives considered**:
- Tailwind v3로 다운그레이드: 이미 v4 설치됨, 불필요한 변경
- CSS-in-JS (styled-components): spec에서 TailwindCSS 명시

---

## R-005: Toast Notification

**Decision**: 경량 자체 구현 (React state + CSS animation)

**Rationale**:
- MVP에서 토스트는 등록/수정/삭제 결과만 보여주면 됨
- 외부 라이브러리 추가 없이 간단한 state + portal로 구현 가능
- 3-5초 후 자동 사라짐, 성공(green)/실패(red) 색상 구분

**Alternatives considered**:
- `react-hot-toast`: 좋은 라이브러리지만 의존성 추가
- `sonner`: Next.js 친화적이지만 MVP에 과도

---

## R-006: Organization 모델과 MASTER 계정의 데이터 접근 패턴

**Decision**: MASTER는 organizationId=null, API에서 role 기반으로 WHERE 조건 분기

**Rationale**:
- MASTER는 organization에 속하지 않으므로 모든 데이터에 접근
- API에서 현재 사용자의 role을 확인:
  - MASTER: WHERE 조건 없이 전체 조회
  - AGENCY: WHERE organizationId = 본인의 organizationId
  - ADVERTISER: WHERE organizationId = 본인의 organizationId (조회만)
- 단순하고 명확한 권한 로직

**Alternatives considered**:
- RLS (Row Level Security): spec에서 RLS 비활성화 명시
- 별도 permission 서비스: MVP에 과도한 추상화

---

## R-007: MASTER의 AGENCY 등록 시 Organization 지정

**Decision**: MASTER가 계정 등록 모달에서 organization 선택 드롭다운 또는 새 organization 이름 입력 필드를 제공

**Rationale**:
- spec에서 "MASTER가 AGENCY를 등록할 때 해당 AGENCY가 속할 organization을 지정해야 한다" 명시
- Assumption에서 "기존 organization을 선택하거나 새 organization 이름을 입력하여 생성" 명시
- 기존 organization 목록을 GET /api/organizations로 조회하여 드롭다운에 표시
- "새로 추가" 옵션 선택 시 텍스트 입력으로 전환

**Alternatives considered**:
- Organization 관리를 별도 페이지로: spec에 없음, 모달 내에서 처리가 더 간결

---

## R-008: Bulk Delete 패턴

**Decision**: DELETE /api/accounts와 DELETE /api/ads에서 request body로 ids 배열 전달

**Rationale**:
- spec에서 "DELETE /api/accounts (bulk delete: ids[])" 명시
- REST 관례상 DELETE에 body는 논란이 있으나, spec을 따름
- 프론트엔드에서 체크된 row의 id 배열을 수집하여 전송

**Alternatives considered**:
- 개별 DELETE 반복 호출: 네트워크 비효율
- Query parameter로 ids 전달: URL 길이 제한 문제 가능
