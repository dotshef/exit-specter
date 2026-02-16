# 광고관리 페이지 고도화 - 데이터 필터링 추가

## 개요

광고 목록 페이지(`/ads`)에 **총판 → 대행사 → 광고주** 3단계 캐스케이드 드롭다운 필터를 추가한다.
`AdStatusCards` 위에 배치하며, 선택한 필터 조건에 맞는 광고만 조회되도록 한다.

---

## 현재 구조 파악

### 데이터 모델 (Prisma)
- **User** (role: MASTER | AGENCY | ADVERTISER)
  - MASTER: 총판. 여러 Organization을 관리 (`managedOrganizations`)
  - AGENCY: 대행사. Organization에 소속
  - ADVERTISER: 광고주. Organization에 소속, Ad를 보유
- **Organization**: `masterId`로 총판(User)에 연결, 소속 users와 ads 보유
- **Ad**: `organizationId`(대행사), `advertiserId`(광고주)로 연결

### 계층 관계
```
총판(MASTER) → Organization(대행사) → User(ADVERTISER, 광고주) → Ad
```

- 총판 선택 → 해당 총판이 관리하는 Organization 목록
- 대행사(Organization) 선택 → 해당 Organization 소속 ADVERTISER 목록
- 광고주(ADVERTISER) 선택 → 해당 광고주의 광고만 표시

### 현재 광고 조회 API (`GET /api/ads`)
- MASTER: 모든 광고 조회
- AGENCY: 자기 Organization의 광고만
- ADVERTISER: 자기 광고만
- 쿼리 파라미터: `status`, `kind`, `page` (현재 필터 파라미터 없음)

### 현재 UI
- `AdStatusCards` 위에 필터 UI 없음
- 드롭다운은 프로젝트 전체에서 네이티브 `<select>` 사용

---

## 작업 목록

### Task 1: 필터 데이터 조회 API 수정/추가

**목적**: 프론트에서 드롭다운 옵션을 채울 데이터를 가져올 수 있도록 API를 준비한다.

**상세**:
1. **총판 목록 API** - `GET /api/accounts?role=MASTER` 또는 별도 엔드포인트
   - MASTER 역할인 사용자 목록을 반환 (id, nickname)
   - 이미 accounts API에서 `role` 쿼리 파라미터로 필터 가능한지 확인 → 가능하면 그대로 사용

2. **대행사(Organization) 목록 API** - `GET /api/organizations`
   - 현재: MASTER는 `masterId` 파라미터로 필터 가능
   - 확인 필요: `masterId` 파라미터가 정상 동작하는지 검증
   - 프론트에서 총판 선택 시 `GET /api/organizations?masterId={id}` 호출

3. **광고주 목록 API** - `GET /api/accounts?role=ADVERTISER`
   - 현재: AGENCY는 자동으로 자기 Organization 소속만 반환
   - 추가 필요: MASTER가 `organizationId` 파라미터로 특정 대행사 소속 광고주를 필터할 수 있어야 함
   - `GET /api/accounts?role=ADVERTISER&organizationId={id}` 형태

### Task 2: 광고 조회 API에 필터 파라미터 추가

**목적**: 광고 목록 조회 시 총판/대행사/광고주 조건으로 필터링할 수 있게 한다.

**상세**:
- `GET /api/ads`에 쿼리 파라미터 추가:
  - `masterId` - 총판 ID (해당 총판이 관리하는 Organization들의 광고만)
  - `organizationId` - 대행사(Organization) ID
  - `advertiserId` - 광고주 ID
- MASTER 역할일 때만 이 필터들이 적용됨
- AGENCY 역할일 때는 `advertiserId` 필터만 추가 적용 가능 (organizationId는 이미 자동 제한)
- Prisma where 조건에 해당 필터를 반영
- stats(전체/정상/오류 등)도 동일한 필터 조건으로 집계되어야 함

### Task 3: 광고 필터 드롭다운 UI 컴포넌트 구현

**목적**: 총판/대행사/광고주 3개의 캐스케이드 드롭다운을 구현한다.

**상세**:
- 새 컴포넌트: `src/components/ads/AdFilter.tsx`
- 드롭다운 3개 가로 배치 (왼쪽: 총판, 중간: 대행사, 오른쪽: 광고주)
- 모든 드롭다운의 기본값은 "전체"
- 네이티브 `<select>` 사용 (기존 프로젝트 패턴 유지)

**캐스케이드 로직**:
1. 총판 선택 변경 시:
   - 대행사 드롭다운을 "전체"로 리셋
   - 대행사 목록을 해당 총판 소속으로 갱신 (`GET /api/organizations?masterId={id}`)
   - 광고주 드롭다운도 "전체"로 리셋
   - 광고주 목록도 해당 총판 소속 Organization들의 광고주로 갱신
2. 대행사 선택 변경 시:
   - 광고주 드롭다운을 "전체"로 리셋
   - 광고주 목록을 해당 대행사 소속으로 갱신 (`GET /api/accounts?role=ADVERTISER&organizationId={id}`)
3. 광고주 선택 변경 시:
   - 즉시 광고 목록 필터링

### Task 4: 역할별 필터 UI 표시 제어

**목적**: 사용자 역할에 따라 보이는 드롭다운을 다르게 한다.

**상세**:
| 역할 | 총판 드롭다운 | 대행사 드롭다운 | 광고주 드롭다운 |
|------|:---:|:---:|:---:|
| MASTER (총판) | O | O | O |
| AGENCY (대행사) | X | X | O |
| ADVERTISER (광고주) | X | X | X |

- AGENCY: 광고주 드롭다운만 표시. 자기 Organization 소속 광고주만 목록에 표시
- ADVERTISER: 필터 UI 자체를 숨김. 기존처럼 본인 광고만 조회

### Task 5: 광고 페이지에 필터 통합

**목적**: AdFilter 컴포넌트를 광고 페이지에 통합하고, 필터 변경 시 광고 목록을 다시 조회한다.

**상세**:
- `src/app/(protected)/ads/page.tsx` 수정
- `AdFilter`를 `AdStatusCards` 위에 배치
- 필터 변경 시:
  - 페이지를 1로 리셋
  - 선택된 필터 조건을 쿼리 파라미터에 포함하여 `GET /api/ads` 호출
  - AdStatusCards의 통계도 필터 조건에 맞게 갱신
- 필터 상태 관리: `page.tsx`에서 state로 관리 (`masterId`, `organizationId`, `advertiserId`)

---

## 검증 시나리오

### 시나리오 1: MASTER 로그인 - 초기 상태
- 총판/대행사/광고주 드롭다운 3개 모두 표시
- 모든 드롭다운 "전체" 선택
- 모든 광고가 조회됨

### 시나리오 2: MASTER - 총판 선택
- 총판 "루카스" 선택
- 대행사 드롭다운: "전체, 알파, 베타"만 표시
- 광고주 드롭다운: "전체, yellow, green, red, orange"만 표시
- 루카스가 관리하는 Organization(알파, 베타)의 광고만 조회

### 시나리오 3: MASTER - 총판 + 대행사 선택
- 총판 "루카스", 대행사 "알파" 선택
- 광고주 드롭다운: "전체, yellow, green"만 표시
- 알파 Organization의 광고만 조회

### 시나리오 4: MASTER - 총판 변경
- 총판을 "데이브"로 변경
- 대행사 드롭다운 "전체"로 리셋, 목록: "전체, 감마"
- 광고주 드롭다운 "전체"로 리셋, 목록: "전체, blue"
- 데이브가 관리하는 Organization(감마)의 광고만 조회

### 시나리오 5: AGENCY 로그인
- 광고주 드롭다운만 표시
- 자기 Organization 소속 광고주만 목록에 표시
- 광고주 선택 시 해당 광고주의 광고만 조회

### 시나리오 6: ADVERTISER 로그인
- 필터 UI 없음
- 기존과 동일하게 본인 광고만 조회
