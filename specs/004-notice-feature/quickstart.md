# Quickstart: 공지사항 기능

**Feature**: 004-notice-feature
**Date**: 2026-01-27

## Prerequisites

- Node.js 18+
- PostgreSQL (Supabase) - notice 테이블이 이미 존재해야 함
- 프로젝트 의존성 설치 완료 (`npm install`)

## Implementation Order

### Phase 1: Prisma 스키마 및 타입 정의

1. **prisma/schema.prisma**에 Notice 모델 추가
   ```prisma
   model Notice {
     id        Int      @id @default(autoincrement())
     title     String   @db.Text
     content   String   @db.Text
     viewCount Int      @default(0) @map("view_count")
     createdAt DateTime @default(now()) @map("created_at")
        updatedAt DateTime @map("updated_at")

     @@map("notice")
   }
   ```

2. **src/types/index.ts**에 Notice 타입 추가
   ```typescript
   export interface Notice {
     id: number;
     title: string;
     content: string;
     viewCount: number;
     createdAt: string;
        updatedAt: string;
   }
   ```

3. Prisma 클라이언트 생성
   ```bash
   npx prisma generate
   ```

### Phase 2: 권한 및 사이드바 메뉴

1. **src/lib/permissions.ts** 수정
   - `canViewNotices(role)` 함수 추가 (MASTER, AGENCY → true)
   - `canManageNotices(role)` 함수 추가 (MASTER → true)
   - `getSidebarItems` 함수에서 MASTER/AGENCY에게 공지사항 메뉴 최상단 추가

2. **src/components/layout/Sidebar.tsx**의 MenuIcon에 'notices' 타입 추가

### Phase 3: API 엔드포인트

1. **src/app/api/notices/route.ts** 생성
   - GET: 목록 조회 (MASTER/AGENCY)
   - POST: 등록 (MASTER only)

2. **src/app/api/notices/[id]/route.ts** 생성
   - GET: 상세 조회 + 조회수 증가 (MASTER/AGENCY)
   - PATCH: 수정 (MASTER only)
   - DELETE: 삭제 (MASTER only)

### Phase 4: 페이지 컴포넌트

1. **src/app/(protected)/notices/page.tsx** 생성
   - 목록 테이블 (제목, 작성일, 조회수)
   - 페이지네이션
   - 등록 버튼 (MASTER only)

2. **src/app/(protected)/notices/[id]/page.tsx** 생성
   - "목록으로" 버튼
   - 제목, 작성일, 조회수
   - 본문 내용
   - 수정/삭제 버튼 (MASTER only)

3. **src/components/notices/NoticeTable.tsx** 생성
   - 공지사항 목록 테이블 컴포넌트

4. **src/components/notices/NoticeCreateModal.tsx** 생성
   - 제목, 본문 입력 필드

5. **src/components/notices/NoticeEditModal.tsx** 생성
   - 기존 내용 편집 필드

## Key Patterns to Follow

### API 인증 패턴

```typescript
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.role === 'ADVERTISER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // ... 비즈니스 로직
}
```

### 조회수 증가 (atomic increment)

```typescript
const notice = await prisma.notice.update({
  where: { id },
  data: { viewCount: { increment: 1 } },
});
```

### 날짜 포맷팅

```typescript
function formatDate(date: Date | string): string {
  return new Date(date).toISOString().split('T')[0];
}
// 결과: "2026-01-27"
```

## Verification Steps

1. **빌드 확인**
   ```bash
   npm run build
   ```

2. **권한 테스트**
   - MASTER로 로그인 → 모든 CRUD 작업 가능 확인
   - AGENCY로 로그인 → 조회만 가능, 등록/수정/삭제 버튼 없음 확인
   - ADVERTISER로 로그인 → 공지사항 메뉴 없음, URL 직접 접근 시 403 확인

3. **조회수 증가 테스트**
   - 상세 페이지 접근 시 조회수 1 증가 확인

4. **페이지네이션 테스트**
   - 다수의 공지사항이 있을 때 페이지 전환 동작 확인

## Common Issues

| Issue | Solution |
|-------|----------|
| Prisma 클라이언트 에러 | `npx prisma generate` 재실행 |
| 권한 에러 | getSession() 호출 및 role 검사 확인 |
| 테이블 매핑 오류 | `@@map("notice")` 및 `@map` 지시자 확인 |
