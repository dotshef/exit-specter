너는 “EXIT”라는 이름의 내부용 웹 어드민 대시보드를 처음부터 끝까지 구현한다.
목표는 첨부된 캡처 화면과 거의 동일한 UI/UX와 동작을 가진 MVP를 만드는 것이다.
아래 항목에서 나열된 내용 중 데이터는 실제 DB와 연결하지 않고
임시 데이터를 만들어서 UI 동작만 우선 확인한다.
그리고 reference 디렉토리 아래에 있는 사진들을 확인하여 실제 UI 구상에 활용한다.

# 0) 필수 조건 (가장 중요)

- UI는 캡처와 동일한 레이아웃/톤/간격/버튼 스타일로 구현한다.
    - 좌측: 고정 사이드바(그린계열 배경, 메뉴 아이콘+텍스트, 선택 메뉴는 하이라이트)
    - 상단: 흰색 헤더(좌측 로고 텍스트, 우측 로그인 사용자 이름 + 드롭다운)
    - 본문: 제목/설명 + 요약 카드(숫자 지표) + 테이블(체크박스, 정렬 아이콘, 우측 관리 아이콘) 구조
    - 모달: 중앙 흰 박스 + 어두운 오버레이 + 아래 버튼 2개(좌 outline, 우 primary)
- 테스트/배포 편의를 위해 풀스택 단일 프로젝트로 만든다.
- 에러 없이 바로 실행 가능해야 한다.

# 1) 기술 스택

- Frontend/Backend: Next.js (App Router) + TypeScript
- UI: TailwindCSS (기본 폰트는 system, 최대한 캡처처럼)
- Database: Supabase PostgreSQL (추후에 사용)
- ORM: Prisma
- Authentication: Custom ID/Password login (Supabase Auth 미사용)
- Session: HTTP-only Cookie 기반
- API: Next.js Route Handlers (/app/api/**)
- Supabase RLS는 비활성화한다.
- Seed 데이터 포함(처음 실행 시 기본 계정/조직/광고 데이터)

# 2) 도메인/권한(중요)

이 서비스는 “아이디/비밀번호 로그인”으로 접근한다.

각 아이디별로 하나의 organization에만 속한다.
다만 MASTER 계정은 organization이 없다.

권한(Role)

- MASTER(총판)
- AGENCY(대행사)
- ADVERTISER(광고주)

조직 모델

- Organization: 로그인 시 선택하는 ‘소속’ 단위.
- 총판은 여러 대행사를 관리할 수 있고, 대행사는 여러 광고주를 관리한다.
- DB 구조는 단순하게 유지한다:
    - MASTER는 oragnizationId가 없다.
    - AGENCY/ADVERTISER는 organizationId가 있다.

데이터 접근 규칙

- MASTER:
    - 계정: 모든 유저 조회/초대/수정/삭제 가능
    - 광고: 모든 광고 조회/등록/수정/삭제 가능
- AGENCY:
    - 계정: 본인 organization 내 ADVERTISER 유저만 초대/조회/수정/삭제 가능
    - 광고: 본인 organization 광고만 등록/수정/삭제 가능
- ADVERTISER:
    - 계정: 자기 자신 프로필만 수정 가능(비번/메모)
    - 광고: 본인 organization 광고 “조회만” 가능(등록/수정/삭제 불가)

# 3) 페이지 구성(라우팅)

- /login
    - 아이디/비밀번호 입력
    - 로그인 버튼
- /(protected)/accounts : “계정관리”
- /(protected)/ads : “광고관리”
- /(protected)/profile : “프로필 정보 수정”

권한별 메뉴 노출

- MASTER/AGENCY: 계정관리, 광고관리 노출
- ADVERTISER: 광고관리(조회전용), 프로필 정도만 노출(계정관리는 숨김)

# 4) UI 디테일(캡처 재현)

공통 레이아웃

- 사이드바 폭 약 240px, 배경 그린 계열, 텍스트는 연한 회색/흰색
- 상단 헤더 높이 약 56px, 배경 흰색, 하단 얇은 보더
- 헤더 왼쪽에는 Logo 표시, 헤더 오른쪽에는 현재 접속한 username 표시, username 옆에는 드롭박스
- 드롭박스 누르면 “프로필 수정”, “로그아웃” 버튼이 뜸. 버튼 배경 색상 없고 그냥 텍스트로만 구성
- 본문 최대 폭 넓게(테이블 중심), 카드와 테이블은 흰색 배경 + 얇은 보더 + 아주 약한 그림자

계정관리(/accounts) 화면

- 상단 타이틀: “계정관리”
- 설명 문구 1줄
- “계정 현황” 흰 카드
    - 4개 지표: 전체 / 총판사 / 대행사 / 광고주
    - 각 지표는 중앙 정렬, 숫자 크게, 선택된 지표(전체)는 숫자 파란색
- 테이블:
    - 컬럼 구성
        - 체크박스 컬럼이 제일 앞에
        - No(id표시),
        - 아이디(username 표시),
        - 권한(색상 강조: 광고주는 초록, 대행사는 파랑, 총판사는 검정),
        - 광고(덧셈 아이콘),
        - 메모(좀더 길게 칸 차지),
        - 관리(톱니바퀴 아이콘)
- 우측 상단 버튼:
    - [삭제(Outline)] [등록(Primary)]
- 하단 페이지네이션 UI (동작은 간단히 1페이지 고정이어도 됨)

계정 등록 모달(캡처 3번)

- 제목: “계정 등록”
- 필드:
    - 아이디*(text)
    - 비밀번호*(password)
    - 권한(select) — MASTER/AGENCY/ADVERTISER (단, 초대자 권한에 따라 선택지 제한)
        - MASTER는 AGENCY 초대 가능
        - AGENCY는 ADVERTISER 초대 가능
        - 사실상 수정 불가하고 정해진 대로만 들어감
    - 메모(textarea)
        - 입력 가능
- 하단 버튼: [닫기(Outline)] [등록(Primary)]
- 등록 성공 시 테이블 리프레시

계정 수정 모달(캡처 2번 / 6번)

- 제목: “계정 수정”
- 아이디는 읽기전용(또는 수정 불가)
- 비밀번호는 입력 시에만 변경
- 권한(select)은 수정 불가 (읽기 전용)
- 메모는 수정 가능
- 하단 버튼: [닫기] [수정]
- ADVERTISER는 /profile에서 자기 것만 수정 가능

광고관리(/ads) 화면

- 상단 타이틀 “광고관리” + 설명
- 요약 카드(캡처처럼 2단 구성)
    - 전체현황, 광고현황, 테스트 현황 박스가 상위에 존재
        - “전체 현황” 카드: 전체/정상/오류/대기/종료예정/종료
        - 아래에 “광고 현황”, “테스트 현황” 2개 카드
    - 각 상태별 숫자를 표시, 각 숫자 지표는 중앙 정렬, 숫자 크게, 선택된 지표(전체)는 숫자 파란색, 나머지는 검정
- 테이블 컬럼(정확히 이 순서로):
    - 체크박스
    - No
    - 아이디
    - 상태
    - 키워드
    - 순위
    - 상품명
    - 프로덕트ID
    - 작업일수
    - 시작일
    - 종료일
    - 관리(아이콘)
- 우측 상단 버튼:
    - [수정(Outline)] [삭제(Outline)] [등록(Primary)]
- ADVERTISER 권한에서는 등록/수정/삭제 버튼 자체를 숨긴다.

광고 추가 모달(캡처 5번)

- 제목: “광고 추가”
- 필드:
    - 아이디(읽기전용 또는 선택: AGENCY/MASTER는 광고주 선택 가능, ADVERTISER는 자기 아이디 고정)
    - 결제*(토글 버튼 2개: 결제/테스트) — 캡처처럼 pill 형태, 선택된 쪽이 네이비
    - 수량*(number)
    - 일수*(number)
    - 작업 시작일*(date picker)
    - 작업 종료일(date) — 시작일 + 일수로 자동 계산하여 표시(읽기전용)
- 하단 버튼: [취소] [추가]
- 광고 상태는 기본 “대기”
- 광고 상태 변경은 MASTER/AGENCY만 가능(수정 모달에서)

# 5) 데이터 모델(Prisma)

필요 테이블:

- organization
    - id, name
- User
    - id, organizationId, username, password, role, memo, createdAt

      비밀번호

        - bcrypt로 해시 저장
    - unique: (organizationId, username)
- Ad
    - id(No), organizationId, advertiserId, kind(PAID|TEST), status(WAITING|ACTIVE|ERROR|ENDING_SOON|ENDED),
      keyword, rank(순위), productName(상품명), productId, quantity(수량), workingDays, startDate, endDate, createdAt, updatedAt

# 6) API 요구사항

- POST /api/auth/login (organizationId + username + password)
- POST /api/auth/logout
- GET /api/me (현재 로그인 유저 + organization + role)
- Accounts
    - GET /api/accounts?role=... (권한에 따른 필터, 검색 파라미터는 받아도 무시)
    - POST /api/accounts (초대/등록)
    - PATCH /api/accounts/:id
    - DELETE /api/accounts (bulk delete: ids[])
- Ads
    - GET /api/ads (검색 파라미터 받아도 무시)
    - POST /api/ads
    - PATCH /api/ads/:id
    - DELETE /api/ads (bulk delete: ids[])
- 모든 API는 서버에서 권한 체크 후 거부(403) 처리

# 7) 동작 시나리오(정확히 구현)

- 로그인:
    - 아이디/비번 입력 -> 성공 시 /accounts 또는 /ads로 이동(권한 따라)
        - MASTER는 /accounts로 이동
        - AGENCY와 ADVERTISER는 /ads로 이동
- 계정관리:
    - 목록 조회, 체크박스 선택 삭제, 등록 모달로 추가, 관리(톱니) 클릭 시 수정 모달
- 광고관리:
    - 전체현황-광고현황-테스트현황 카드에서 각 상태별 숫자를 표시
    - 상태별 숫자를 클릭 할 경우 그 상태에 해당하는 광고들만 테이블의 Row로 표시
    - 전체현황-광고현황-테스트현황의 status에서 딱 하나만 필터 조건으로 선택할 수 있음
    - 목록 조회, 등록 모달, 수정/삭제는 테이블에서 선택된 row 기준
    - 상태는 MASTER/AGENCY만 수정 가능
- 프로필:
    - 현재 로그인 유저의 비밀번호/메모 수정

# 8) 시드 데이터(꼭 포함)

- Users:
    - (MASTER) username=specter, pw=0000
    - (AGENCY) organization=알파, username=alpha, pw=0000
    - (ADVERTISER) organization=알파, username=yellow, pw=0000
- Ads: 정상/오류/대기/종료예정/종료 중 7개 정도 데이터 만들어둔다.

# 9) 품질 조건

- 실행 방법을 README에 작성
- 타입 에러/린트 에러 없이 동작
- UI 간격/폰트 크기/버튼 색감이 캡처와 최대한 유사
- 토스트/알림(등록/수정/삭제 성공/실패) 간단히 구현


위 요구사항대로 MVP에 적합한 전체 코드(Next.js + Prisma + Tailwind)를 완성해라.