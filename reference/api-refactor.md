# API 리팩토링: accounts 통합 → master / agency / advertiser 분리

## 현재 상태

### 기존 API 구조
```
/api/accounts          GET    - 계정 목록 (role 파라미터로 필터)
                       POST   - 계정 생성
                       DELETE - 계정 벌크 삭제
/api/accounts/[id]     GET    - 단일 계정 조회
                       PUT    - 계정 수정
                       PATCH  - PUT과 동일
                       DELETE - 단일 계정 삭제
/api/accounts/hierarchy GET   - 계층 구조 조회 (총판→조직→계정)
/api/organizations     GET    - 조직 목록
                       POST   - 조직 생성
```

### 문제점
- `GET /api/accounts`가 roleFilter로 분기하여 하나의 엔드포인트에서 총판/대행사/광고주를 모두 처리
- `GET /api/accounts/hierarchy`가 별도로 존재하며 역할별 분기 로직이 중복
- 광고 필터링에서 총판→대행사→광고주 캐스케이드 조회가 필요한데, 현재 API로는 깔끔하게 처리 불가

### 현재 호출처
| 호출처 | 현재 API | 용도 |
|--------|----------|------|
| `AccountHierarchy.tsx` | `GET /api/accounts/hierarchy` | 계정관리 계층 뷰 |
| `ads/create/page.tsx` | `GET /api/accounts?role=ADVERTISER` | 광고 등록 시 광고주 선택 |
| `AccountCreateModal.tsx` | `POST /api/accounts` | 계정 생성 |
| `AccountEditModal.tsx` | `GET/PUT /api/accounts/[id]` | 계정 조회/수정 |
| `profile/page.tsx` | `PATCH /api/accounts/[id]` | 프로필 수정 |
| `accounts/page.tsx` (추정) | `DELETE /api/accounts` | 계정 벌크 삭제 |

---

## 리팩토링 목표

역할별로 API를 분리하여 각 엔드포인트의 책임을 명확히 한다.

```
/api/masters          GET    - 총판 목록 조회
/api/agencies         GET    - 대행사(Organization) 목록 조회
/api/advertisers      GET    - 광고주 목록 조회
/api/accounts         POST   - 계정 생성 (공통, 기존 유지)
                      DELETE - 계정 벌크 삭제 (공통, 기존 유지)
/api/accounts/[id]    GET    - 단일 계정 조회 (기존 유지)
                      PUT    - 계정 수정 (기존 유지)
                      PATCH  - 계정 수정 (기존 유지)
                      DELETE - 단일 계정 삭제 (기존 유지)
```

- `GET /api/accounts` 삭제 (masters, agencies, advertisers로 대체)
- `GET /api/accounts/hierarchy` 삭제 (masters, agencies, advertisers로 대체)
- `GET /api/organizations` 삭제 (`/api/agencies`로 통합)
- `POST /api/accounts`, `DELETE /api/accounts`, `/api/accounts/[id]`는 기존 유지
- `POST /api/organizations`는 기존 유지

---

## 새 API 상세

### GET /api/masters

총판(MASTER 역할) 목록을 반환한다.

**쿼리 파라미터**: 없음

**권한**:
- MASTER: 모든 총판 조회 가능
- AGENCY: 자기 Organization의 총판만 조회
- ADVERTISER: 자기 Organization의 총판만 조회

**응답**:
```json
{
  "masters": [
    {
      "id": 1,
      "username": "lucas",
      "nickname": "루카스",
      "organizationCount": 2
    }
  ]
}
```

**데이터 소스**: 기존 `hierarchy`의 총판 목록 로직 + `accounts`의 `role=MASTER` 로직 통합

---

### GET /api/agencies

대행사(Organization) 목록을 반환한다. Organization 단위로 반환하며, 소속 대행사(AGENCY) 유저 정보를 포함한다.

**쿼리 파라미터**:
| 파라미터 | 설명 |
|----------|------|
| `masterId` | 특정 총판이 관리하는 Organization만 필터 |

**권한**:
- MASTER: 전체 또는 masterId로 필터
- AGENCY: 자기 Organization만
- ADVERTISER: 자기 Organization만

**응답**:
```json
{
  "agencies": [
    {
      "id": 1,
      "name": "알파",
      "masterId": 1,
      "masterNickname": "루카스",
      "userCount": 5,
      "agencyUsers": [
        { "id": 10, "username": "alpha_agency", "nickname": "알파 대행사" }
      ]
    }
  ]
}
```

**데이터 소스**: 기존 `organizations` GET + `hierarchy`의 Organization 조회 통합

---

### GET /api/advertisers

광고주(ADVERTISER 역할) 목록을 반환한다.

**쿼리 파라미터**:
| 파라미터 | 설명 |
|----------|------|
| `organizationId` | 특정 대행사(Organization) 소속 광고주만 필터 |
| `masterId` | 특정 총판이 관리하는 Organization들의 광고주만 필터 |

**권한**:
- MASTER: 전체, 또는 organizationId/masterId로 필터
- AGENCY: 자기 Organization 소속 광고주만 (파라미터 무시)
- ADVERTISER: 자기 자신만 반환 (파라미터 무시)

**응답**:
```json
{
  "advertisers": [
    {
      "id": 100,
      "username": "yellow",
      "nickname": "옐로우",
      "organizationId": 1,
      "organizationName": "알파",
      "adCount": 3
    }
  ]
}
```

**데이터 소스**: 기존 `accounts`의 `role=ADVERTISER` 로직 + organizationId/masterId 필터 추가

---

## 호출처 변경 매핑

| 호출처 | 현재 | 변경 후 |
|--------|------|---------|
| `AccountHierarchy.tsx` | `GET /api/accounts/hierarchy` | `GET /api/masters` + `GET /api/agencies?masterId=` + `GET /api/advertisers?organizationId=` |
| `ads/create/page.tsx` | `GET /api/accounts?role=ADVERTISER` | `GET /api/advertisers` |
| **광고 필터 (신규)** | - | `GET /api/masters` + `GET /api/agencies?masterId=` + `GET /api/advertisers?organizationId=` |

---

## 삭제 대상

| 파일 | 삭제 대상 |
|------|-----------|
| `src/app/api/accounts/route.ts` | GET 핸들러만 삭제 (POST, DELETE는 유지) |
| `src/app/api/accounts/hierarchy/route.ts` | 파일 전체 삭제 |
| `src/app/api/organizations/route.ts` | GET 핸들러만 삭제 (POST는 유지) |
