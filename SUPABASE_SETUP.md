# Supabase 연결 가이드

## 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 접속 → 로그인
2. "New Project" 클릭
3. 설정:
   - **Name**: `exit-project` (자유)
   - **Database Password**: 기억할 수 있는 비밀번호 설정
   - **Region**: `Northeast Asia (Seoul)` 선택
4. 프로젝트 생성 완료까지 대기 (1~2분)

## 2. 연결 문자열 확인

1. Supabase 대시보드 → **Settings** → **Database**
2. **Connection string** 섹션에서:
   - **URI** 탭 선택
   - `Transaction` 모드 → `DATABASE_URL` 용 (포트 6543)
   - `Session` 모드 → `DIRECT_URL` 용 (포트 5432)
3. `[YOUR-PASSWORD]` 부분을 프로젝트 생성 시 설정한 비밀번호로 교체

## 3. 로컬 .env 업데이트

`.env` 파일의 플레이스홀더를 실제 값으로 교체:

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"
JWT_SECRET="exit-admin-dashboard-jwt-secret-key-2026"
```

## 4. DB 마이그레이션 & 시드

터미널에서 순서대로 실행:

```bash
# 마이그레이션 생성 및 적용
npx prisma migrate dev --name init

# 시드 데이터 투입
npx prisma db seed
```

## 5. 로컬 동작 확인

```bash
npm run dev
```

로그인 테스트: `specter` / `0000`

## 6. Vercel 환경변수 설정

1. Vercel 대시보드 → 프로젝트 → **Settings** → **Environment Variables**
2. 다음 3개 추가:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | (위의 pooler URL, 포트 6543) |
| `DIRECT_URL` | (위의 direct URL, 포트 5432) |
| `JWT_SECRET` | `exit-admin-dashboard-jwt-secret-key-2026` |

3. **Redeploy** 실행 (Settings → Deployments → 최신 배포의 ··· → Redeploy)

## 완료 체크리스트

- [ ] Supabase 프로젝트 생성됨
- [ ] `.env`에 실제 연결 문자열 입력됨
- [ ] `npx prisma migrate dev --name init` 성공
- [ ] `npx prisma db seed` 성공
- [ ] 로컬에서 로그인 정상 동작
- [ ] Vercel 환경변수 3개 설정됨
- [ ] Vercel 재배포 후 로그인 정상 동작