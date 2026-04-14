# 광고 관리 기능 확장 작업 정의서

작성일: 2026-04-10

## 개요

광고 관리 페이지에 다음 세 가지 기능을 추가한다.

1. 광고 복수 선택 일괄 수정
2. 네이버/쿠팡 광고 페이지 분리
3. 네이버 API 연동 — 키워드 기반 상품 순위 자동 조회

## 사용자 결정 사항 요약

| 항목 | 결정 내용 |
|---|---|
| 일괄 수정 대상 필드 | 모든 필드 |
| 일괄 수정 방식 | 덮어쓰기 (상대값/연장 개념 없음) |
| 네이버/쿠팡 분리 방식 | `/ads/naver`, `/ads/coupang` 별도 페이지 |
| 광고-플랫폼 관계 | 1 광고 = 1 플랫폼 |
| 기존 데이터 마이그레이션 | `productLink`에 `naver` 포함 → NAVER, 그 외 → COUPANG |
| 광고 등록 페이지 | 플랫폼별 분리 (`/ads/naver/create`, `/ads/coupang/create`) |
| 네이버 순위 기준 | 오가닉(일반) 검색 결과 기준 |
| 순위 조회 방식 | 자동 스케줄 (매일 0시부터 6시간 간격: 0시, 6시, 12시, 18시) |
| 100위권 밖 처리 | `-` 표시 |
| productLink 예시 | `https://smartstore.naver.com/nanumlab/products/10713170202` |

---

## 공통 선행 작업: DB 스키마 변경

### Task 0-1. Prisma 스키마 수정

**파일**: `prisma/schema.prisma` (기존 `Ad` 모델)

```prisma
model Ad {
  // 기존 필드 유지
  platform       String    // 'NAVER' | 'COUPANG' (NOT NULL)
  rankCheckedAt  DateTime? @map("rank_checked_at")
  // ...
}
```

- `platform` 필드 추가 (NOT NULL) — 기능 2용
- `rankCheckedAt` 필드 추가 — 기능 3의 마지막 조회 시각 기록용
- `rank` 필드는 그대로 재사용 (자동 조회값 저장)

### Task 0-2. 데이터 마이그레이션

**파일**: `prisma/migrations/XXXX_add_platform_to_ad/migration.sql` (신규)

```sql
-- 1) 컬럼 추가 (nullable 임시)
ALTER TABLE "Ad" ADD COLUMN "platform" TEXT;
ALTER TABLE "Ad" ADD COLUMN "rank_checked_at" TIMESTAMP;

-- 2) 기존 데이터 분류
UPDATE "Ad" SET "platform" = 'NAVER'
  WHERE "product_link" ILIKE '%naver%';
UPDATE "Ad" SET "platform" = 'COUPANG'
  WHERE "platform" IS NULL;

-- 3) NOT NULL 강제
ALTER TABLE "Ad" ALTER COLUMN "platform" SET NOT NULL;
```

### Task 0-3. TypeScript 타입 업데이트

**파일**: `src/types/index.ts`

```ts
export type Platform = 'NAVER' | 'COUPANG';

export interface Ad {
  // 기존 필드...
  platform: Platform;
  rankCheckedAt: string | null;
}
```

---

## 기능 2. 네이버/쿠팡 페이지 분리

### Task 2-1. 라우팅 구조 변경

**삭제**:
- `src/app/(protected)/ads/page.tsx`
- `src/app/(protected)/ads/create/page.tsx`

**신규 생성**:
- `src/app/(protected)/ads/naver/page.tsx`
- `src/app/(protected)/ads/naver/create/page.tsx`
- `src/app/(protected)/ads/coupang/page.tsx`
- `src/app/(protected)/ads/coupang/create/page.tsx`

각 페이지는 공통 컨테이너 컴포넌트에 `platform` prop만 전달하는 얇은 래퍼.

### Task 2-2. 공통 컴포넌트 추출

기존 페이지 로직을 플랫폼 parameter 기반 공통 컴포넌트로 추출하여 코드 중복 방지.

**신규 파일**:
- `src/components/ads/AdListContainer.tsx` — 목록/필터/테이블/버튼 통합
  - Props: `platform: Platform`
- `src/components/ads/AdCreateContainer.tsx` — 등록 폼
  - Props: `platform: Platform`

각 페이지는 다음과 같이 사용:

```tsx
// src/app/(protected)/ads/naver/page.tsx
export default function NaverAdsPage() {
  return <AdListContainer platform="NAVER" />;
}
```

### Task 2-3. API 쿼리에 platform 필터 추가

**파일**: `src/app/api/ads/route.ts`

- `GET`: 쿼리 파라미터 `platform` 추가 → `baseWhere.platform = platformParam`
- `POST`: body에서 `platform` 수신하여 `prisma.ad.create` 시 저장
- `computeStats`는 이미 필터된 `baseWhere` 기준이므로 추가 수정 불필요

### Task 2-4. 사이드바 네비게이션 업데이트

**결정 필요 사항 (결정 후 확정)**:
- (A) "네이버 광고 / 쿠팡 광고" 2개 메뉴로 분리 — **기본 계획**
- (B) "광고관리" 유지 + 서브메뉴
- (C) "광고관리" → `/ads/naver` 리다이렉트 + 페이지 상단 탭 전환

### Task 2-5. 광고 등록 UI — 플랫폼 고정

- 등록 페이지 내부에서 플랫폼 선택 UI 제거
- `POST /api/ads` 호출 시 페이지별로 `platform` 값 고정 전달
- 사용자가 플랫폼을 직접 선택하지 않음

### Task 2-6. 기존 `/ads` 경로 처리

**결정 필요 사항**:
- 옵션 1: `/ads` → `/ads/naver`로 리다이렉트
- 옵션 2: 404
- 옵션 3: 네이버/쿠팡 선택 화면

---

## 기능 1. 일괄 수정

### Task 1-1. Bulk PATCH API 신규 추가

**파일**: `src/app/api/ads/bulk/route.ts` (신규)

```ts
export async function PATCH(request: NextRequest) {
  // 1) 세션 검증 + ADVERTISER 권한 거부
  // 2) body: { ids: number[], updates: Partial<Ad> }
  // 3) 필드별 권한 분리:
  //    - 모든 역할: keyword, productLink, startDate, endDate
  //    - MASTER 전용: status, rank
  //    - platform: 수정 불가 (페이지가 분리되어 필요 없음)
  // 4) AGENCY 스코핑: where: { id: { in: ids }, organizationId: session.organizationId }
  // 5) prisma.ad.updateMany() 일괄 덮어쓰기
  // 6) 반환: { updatedCount }
}
```

**주의사항**:
- `updateMany`는 모든 레코드에 동일한 값을 쓰므로 요구사항("덮어쓰기")과 일치
- Validation 로직은 `src/app/api/ads/[id]/route.ts`의 단일 수정과 동일 재사용

### Task 1-2. AdBulkEditModal 컴포넌트

**파일**: `src/components/ads/AdBulkEditModal.tsx` (신규)

- 기존 `AdEditModal`을 복제 후 수정
- **필드별 체크박스 추가**: "이 필드 수정하기" 토글 → 체크된 필드만 API body에 포함
- 체크 안 된 필드는 `updateMany` 호출에서 제외
- 상단 타이틀: "N개 광고 일괄 수정"
- 플랫폼 필드는 수정 대상에서 제외

### Task 1-3. 목록 페이지에 "일괄 수정" 버튼 추가

**파일**: `src/components/ads/AdListContainer.tsx` (Task 2-2에서 신설)

- 삭제 버튼 영역에 "일괄 수정" 버튼 추가
- 활성화 조건: `selectedIds.length > 0 && currentRole !== 'ADVERTISER'`
- 클릭 시 `AdBulkEditModal` 오픈

---

## 기능 3. 네이버 키워드 순위 자동 조회 (스케줄 기반)

### Task 3-1. 환경변수 추가

**파일**: `.env.local`

```
NAVER_CLIENT_ID=xxx
NAVER_CLIENT_SECRET=xxx
```

### Task 3-2. 네이버 API 클라이언트 유틸

**파일**: `src/lib/naver-shop.ts` (신규)

```ts
/**
 * productLink에서 스마트스토어 productNo 추출
 * 매칭 패턴: smartstore.naver.com/{mall}/products/{productNo}
 * 매칭 실패 시 null 반환 (순위 조회 불가 광고)
 */
export function extractNaverProductId(link: string): string | null;

/**
 * 키워드로 네이버 쇼핑 검색 → 100개 내에서 productId 매칭
 * 엔드포인트: https://openapi.naver.com/v1/search/shop.json
 * 파라미터: query, display=100, start=1, sort=sim
 * 반환: 순위(1~100) 또는 null(100위 밖 또는 미노출)
 */
export async function fetchKeywordRank(
  keyword: string,
  productId: string
): Promise<number | null>;
```

**기술적 리스크 — 구현 전 1건 실측 테스트 필요**:
- 스마트스토어 URL의 `productNo`와 네이버 쇼핑 검색 API가 반환하는 `productId`가 **항상 일치한다는 보장 없음**
- 매칭 전략:
  1. API 응답 `items[].link`에서 동일한 정규식으로 productNo 재추출 후 비교 (1차)
  2. `items[].productId` 직접 비교 (2차)
- 실제 API 키로 예시 URL(`https://smartstore.naver.com/nanumlab/products/10713170202`) 테스트하여 매칭 성공 확인 후 본 구현 착수

### Task 3-3. 순위 자동 갱신 스케줄 API

**파일**: `src/app/api/cron/rank-refresh/route.ts` (신규)

외부 cron 서비스(Vercel Cron 또는 외부 스케줄러)에서 호출되는 엔드포인트.

```ts
export async function GET(request: NextRequest) {
  // 1) cron 인증 (CRON_SECRET 헤더 검증 — 외부 무단 호출 방지)
  // 2) platform=NAVER이고, keyword가 있고, productLink가 있는 광고 전체 조회
  // 3) 각 광고에 대해 순차 처리:
  //    - productLink에서 productId 추출 실패 시 skip
  //    - fetchKeywordRank(keyword, productId) 호출
  //    - 100위 내: prisma.ad.update({ rank: 결과값, rankCheckedAt: new Date() })
  //    - 100위 밖: prisma.ad.update({ rank: null, rankCheckedAt: new Date() })
  // 4) 반환: { total, updated, skipped, errors }
}
```

**스케줄 설정** — Vercel Cron 사용 시 `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/rank-refresh",
      "schedule": "0 0,6,12,18 * * *"
    }
  ]
}
```

- 매일 0시, 6시, 12시, 18시 (6시간 간격) 자동 실행
- 환경변수 `CRON_SECRET` 추가하여 인증 처리

**주의사항**:
- Vercel Hobby 플랜: cron 함수 최대 실행 시간 10초, Pro 플랜: 최대 300초
- 광고 수가 많을 경우 한 번의 cron 호출에서 처리 불가능할 수 있음
  - 대안 1: 한 번에 처리할 광고 수 제한 + offset 기반 순환 처리 (호출마다 N건씩)
  - 대안 2: 외부 스케줄러(GitHub Actions, AWS Lambda 등) 사용하여 timeout 제한 회피
- 네이버 API 일일 25,000회 제한: 하루 4회 × 광고 수 = 일일 호출 수. 광고 6,000건 이상이면 제한에 걸림
- 동일 키워드 중복 호출 방지: 같은 키워드로 등록된 광고가 여러 개일 경우 키워드 단위로 1회만 호출 후 결과 재사용

### Task 3-4. 테이블에 순위 및 조회 시각 표시

**파일**: `src/components/ads/AdTable.tsx`

- `rank` 컬럼: 자동 조회된 값 표시. `rank === null`이면 `-` 표시
- `rankCheckedAt` 표시: 순위 옆 또는 툴팁으로 마지막 조회 시각 표시
- 예: `23` (호버 시 "2026-04-10 12:00 조회")
- 네이버 광고 목록에서만 표시 (쿠팡 페이지에서는 조회 시각 불필요)

### Task 3-5. Cron 인증 및 환경변수 설정

**파일**: `.env.local`

```
CRON_SECRET=xxx
```

- `vercel.json` 또는 외부 스케줄러 설정에 cron schedule 등록
- API 호출 시 `Authorization: Bearer ${CRON_SECRET}` 헤더로 인증

---

## 작업 순서 (의존성 기반)

1. **Task 0** — DB 스키마/마이그레이션/타입 (모든 작업의 선행 조건)
2. **Task 2** — 페이지 분리 (기능 1·3의 구조적 기반)
3. **Task 1** — 일괄 수정 (기능 2의 `AdListContainer` 내부에 추가)
4. **Task 3** — 네이버 순위 자동 조회 (스케줄 cron + 테이블 표시)

각 단계는 독립적으로 배포 가능.

---

## 최종 결정 필요 사항

구현 착수 전 반드시 확정해야 하는 4가지:

1. **Task 2-4 사이드바 메뉴 방식**: (A) 2개 분리 / (B) 서브메뉴 / (C) 상단 탭
2. **Task 2-6 기존 `/ads` 경로**: 리다이렉트 / 404 / 선택 화면
3. **Task 3-2 productId 매칭 검증**: 네이버 API 키 발급 완료 여부 확인 + 1건 실측 테스트
4. **Task 3-3 호스팅 환경 확인**: Vercel 플랜(Hobby/Pro) 확인 — cron 실행 시간 제한에 영향. 또는 외부 스케줄러 사용 여부

---

## 참고: 영향받는 주요 파일 목록

### 수정
- `prisma/schema.prisma`
- `src/types/index.ts`
- `src/app/api/ads/route.ts`
- `src/app/api/ads/[id]/route.ts` (Validation 공통화 검토)
- `src/components/ads/AdTable.tsx`
- `src/components/layout/Sidebar` (네비게이션 메뉴)
- `vercel.json` (cron schedule 추가)

### 삭제
- `src/app/(protected)/ads/page.tsx`
- `src/app/(protected)/ads/create/page.tsx`

### 신규
- `prisma/migrations/XXXX_add_platform_to_ad/migration.sql`
- `src/app/(protected)/ads/naver/page.tsx`
- `src/app/(protected)/ads/naver/create/page.tsx`
- `src/app/(protected)/ads/coupang/page.tsx`
- `src/app/(protected)/ads/coupang/create/page.tsx`
- `src/app/api/ads/bulk/route.ts`
- `src/app/api/cron/rank-refresh/route.ts`
- `src/components/ads/AdListContainer.tsx`
- `src/components/ads/AdCreateContainer.tsx`
- `src/components/ads/AdBulkEditModal.tsx`
- `src/lib/naver-shop.ts`
