# Data Model: EXIT Admin Dashboard MVP (Organization Model)

**Date**: 2026-01-23
**Feature**: 002-exit-admin-dashboard

## Entity Relationship Diagram

```
Organization (1) ──── (N) User
Organization (1) ──── (N) Ad
User [ADVERTISER] (1) ──── (N) Ad (advertiserId)
```

Note: MASTER User는 Organization에 속하지 않음 (organizationId = null)

---

## Entities

### Organization

소속 단위. AGENCY/ADVERTISER가 속하는 조직이다.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Auto-increment Integer | PK | 고유 식별자 |
| name | String | NOT NULL, UNIQUE | 조직명 (예: "알파") |
| createdAt | DateTime | NOT NULL, DEFAULT now | 생성일시 |

**Relationships**:
- Has many Users (AGENCY/ADVERTISER)
- Has many Ads

---

### User

시스템 사용자. 역할에 따라 접근 권한이 다르다.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Auto-increment Integer | PK | 고유 식별자 |
| organizationId | Integer | FK → Organization, NULLABLE | 소속 조직 (MASTER는 null) |
| username | String | NOT NULL, UNIQUE | 로그인 아이디 |
| password | String | NOT NULL | bcrypt 해시된 비밀번호 |
| role | Enum(MASTER, AGENCY, ADVERTISER) | NOT NULL | 권한 역할 |
| memo | String | NULLABLE | 메모 |
| createdAt | DateTime | NOT NULL, DEFAULT now | 생성일시 |

**Constraints**:
- username은 시스템 전체에서 유일 (UNIQUE)
- MASTER: organizationId = null
- AGENCY/ADVERTISER: organizationId != null (required)

**Relationships**:
- Belongs to Organization (optional, MASTER는 null)
- Has many Ads (ADVERTISER일 경우, advertiserId 참조)

---

### Ad

광고 정보. organizationId로 데이터가 격리된다.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Auto-increment Integer | PK | 고유 식별자 (테이블의 No 컬럼) |
| organizationId | Integer | FK → Organization, NOT NULL | 소속 조직 |
| advertiserId | Integer | FK → User, NOT NULL | 광고주 사용자 |
| kind | Enum(PAID, TEST) | NOT NULL | 결제 유형 (결제/테스트) |
| status | Enum(WAITING, ACTIVE, ERROR, ENDING_SOON, ENDED) | NOT NULL, DEFAULT WAITING | 광고 상태 |
| keyword | String | NULLABLE | 키워드 |
| rank | Integer | NULLABLE | 순위 |
| productName | String | NULLABLE | 상품명 |
| productId | String | NULLABLE | 프로덕트 ID |
| quantity | Integer | NULLABLE | 수량 |
| workingDays | Integer | NOT NULL | 작업 일수 |
| startDate | DateTime | NOT NULL | 작업 시작일 |
| endDate | DateTime | NOT NULL | 작업 종료일 (시작일 + 일수) |
| createdAt | DateTime | NOT NULL, DEFAULT now | 생성일시 |
| updatedAt | DateTime | NOT NULL, DEFAULT now, ON UPDATE | 수정일시 |

**Constraints**:
- endDate = startDate + workingDays (계산 필드)
- status 초기값은 WAITING
- ADVERTISER는 status 변경 불가

**Relationships**:
- Belongs to Organization
- Belongs to User (advertiser)

---

## Enumerations

### Role
| Value | Display Name | Description |
|-------|-------------|-------------|
| MASTER | 총판사 | 전체 시스템 관리, organization 없음 |
| AGENCY | 대행사 | 본인 organization 관리 |
| ADVERTISER | 광고주 | 본인 organization 광고 조회만 |

### AdKind
| Value | Display Name | Description |
|-------|-------------|-------------|
| PAID | 결제 | 유료 광고 |
| TEST | 테스트 | 테스트 광고 |

### AdStatus
| Value | Display Name | Description |
|-------|-------------|-------------|
| WAITING | 대기 | 등록 후 실행 전 상태 |
| ACTIVE | 정상 | 정상 실행 중 |
| ERROR | 오류 | 오류 발생 |
| ENDING_SOON | 종료예정 | 곧 종료될 예정 |
| ENDED | 종료 | 종료됨 |

---

## State Transitions

### Ad Status

```
WAITING → ACTIVE (시작)
WAITING → ENDED (취소)
ACTIVE → ERROR (오류 발생)
ACTIVE → ENDING_SOON (종료 임박)
ACTIVE → ENDED (종료)
ERROR → ACTIVE (복구)
ENDING_SOON → ENDED (종료)
```

Note: 상태 변경은 MASTER/AGENCY만 가능 (수정 모달에서)

---

## Seed Data

### Organizations
| id | name |
|----|------|
| 1 | 알파 |

### Users
| id | organizationId | username | password (plaintext) | role | memo |
|----|---------------|----------|---------------------|------|------|
| 1 | null | specter | 0000 | MASTER | 총판 관리자 |
| 2 | 1 | alpha | 0000 | AGENCY | 알파 대행사 |
| 3 | 1 | yellow | 0000 | ADVERTISER | 알파 광고주 |

### Ads (7건 이상)
| id | orgId | advertiserId | kind | status | keyword | rank | productName | productId | quantity | workingDays | startDate | endDate |
|----|-------|-------------|------|--------|---------|------|-------------|-----------|----------|-------------|-----------|---------|
| 1 | 1 | 3 | PAID | ACTIVE | 키워드A | 1 | 상품A | P001 | 100 | 30 | 2026-01-01 | 2026-01-31 |
| 2 | 1 | 3 | PAID | ACTIVE | 키워드B | 3 | 상품B | P002 | 50 | 14 | 2026-01-10 | 2026-01-24 |
| 3 | 1 | 3 | TEST | WAITING | 키워드C | null | 상품C | P003 | 20 | 7 | 2026-02-01 | 2026-02-08 |
| 4 | 1 | 3 | PAID | ERROR | 키워드D | 5 | 상품D | P004 | 80 | 21 | 2026-01-05 | 2026-01-26 |
| 5 | 1 | 3 | TEST | ENDING_SOON | 키워드E | 2 | 상품E | P005 | 30 | 10 | 2026-01-15 | 2026-01-25 |
| 6 | 1 | 3 | PAID | ENDED | 키워드F | 4 | 상품F | P006 | 60 | 30 | 2025-12-01 | 2025-12-31 |
| 7 | 1 | 3 | TEST | WAITING | 키워드G | null | 상품G | P007 | 10 | 5 | 2026-02-10 | 2026-02-15 |

---

## Prisma Schema (Reference)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

enum Role {
  MASTER
  AGENCY
  ADVERTISER
}

enum AdKind {
  PAID
  TEST
}

enum AdStatus {
  WAITING
  ACTIVE
  ERROR
  ENDING_SOON
  ENDED
}

model Organization {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  createdAt DateTime @default(now())
  users     User[]
  ads       Ad[]
}

model User {
  id             Int           @id @default(autoincrement())
  organizationId Int?
  organization   Organization? @relation(fields: [organizationId], references: [id])
  username       String        @unique
  password       String
  role           Role
  memo           String?
  createdAt      DateTime      @default(now())
  ads            Ad[]          @relation("AdvertiserAds")
}

model Ad {
  id             Int          @id @default(autoincrement())
  organizationId Int
  organization   Organization @relation(fields: [organizationId], references: [id])
  advertiserId   Int
  advertiser     User         @relation("AdvertiserAds", fields: [advertiserId], references: [id])
  kind           AdKind
  status         AdStatus     @default(WAITING)
  keyword        String?
  rank           Int?
  productName    String?
  productId      String?
  quantity       Int?
  workingDays    Int
  startDate      DateTime
  endDate        DateTime
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}
```

Note: SQLite는 enum을 네이티브로 지원하지 않으므로 Prisma가 String으로 매핑한다. PostgreSQL 전환 시 네이티브 enum을 사용할 수 있다.
