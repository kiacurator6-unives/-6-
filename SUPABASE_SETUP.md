# 자기소개 페이지 — Supabase 연동 설정 가이드

`intro.html`의 자기소개(사진 포함)를 모두에게 실시간으로 공유되게 하는 백엔드로 **Supabase**(무료 플랜)를 씁니다. 신용카드 없이 이메일만으로 가입 가능하고, 데이터베이스 + 사진 저장소가 한 서비스 안에 있어서 예전 구글 시트+Drive 조합보다 설정이 더 간단하고 안정적입니다. 10분 정도 걸려요.

## 1. Supabase 프로젝트 만들기

1. [supabase.com](https://supabase.com) 접속 → 우측 상단 **Start your project**로 가입/로그인합니다 (구글 계정으로 바로 가입 가능).
2. **New project** 클릭 → 조직 선택(처음이면 자동 생성) → 프로젝트 이름(예: `garage-key-intro`), 데이터베이스 비밀번호를 설정하고 리전은 **Northeast Asia (Seoul)**을 선택합니다.
3. **Create new project**를 누르고 1~2분 기다립니다 (프로비저닝 중이라는 화면이 나옵니다).

## 2. 테이블 만들기 (SQL 붙여넣기)

1. 왼쪽 메뉴에서 **SQL Editor**를 클릭 → **New query**.
2. 아래 SQL을 그대로 붙여넣고 우측 하단 **Run**을 클릭합니다.

```sql
create table intros (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  section text not null,
  name text not null,
  role text,
  message text not null,
  photo_url text
);

alter table intros enable row level security;

create policy "Allow public read"
  on intros for select
  to anon
  using (true);

create policy "Allow public insert"
  on intros for insert
  to anon
  with check (true);
```

이렇게 하면 누구나(로그인 없이) 읽고 새 글을 추가할 수 있지만, 수정·삭제 정책은 만들지 않았기 때문에 API로는 수정/삭제가 불가능합니다 (안전장치).

## 3. 사진 저장 버킷 만들기

1. 왼쪽 메뉴에서 **Storage** 클릭 → **New bucket**.
2. 버킷 이름을 정확히 **`intro-photos`**로 입력하고, **Public bucket**을 켠 뒤 생성합니다.
3. 다시 **SQL Editor → New query**로 가서 아래 SQL을 실행합니다 (업로드 권한 부여).

```sql
create policy "Allow public upload to intro-photos"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'intro-photos');

create policy "Allow public read intro-photos"
  on storage.objects for select
  to anon
  using (bucket_id = 'intro-photos');
```

## 4. 사이트에 연결하기

1. 왼쪽 메뉴 **Project Settings**(톱니바퀴) → **API** 로 들어갑니다.
2. **Project URL**과 **anon public** 키(또는 화면에 따라 "publishable key"로 표시될 수 있어요) 두 값을 복사합니다.
3. `assets/js/intro-config.js` 파일을 열어서 아래처럼 붙여넣고 저장합니다.

```javascript
const GARAGE_KEY_SUPABASE_URL = "여기에_Project_URL_붙여넣기";
const GARAGE_KEY_SUPABASE_ANON_KEY = "여기에_anon_public_키_붙여넣기";
```

저장 후 깃허브에 반영(재배포)하면 `intro.html`이 자동으로 "Supabase 연동 모드"로 전환됩니다.

## 참고사항

- **사진 저장 위치**: 업로드된 사진은 Supabase의 `intro-photos` 버킷에 저장되고, 공개 URL이 시트 대신 데이터베이스의 `photo_url` 컬럼에 저장됩니다.
- **사진 용량**: 브라우저에서 업로드 전에 자동으로 가로/세로 최대 480px, JPEG로 리사이즈·압축해서 올라가기 때문에 원본이 커도 실제 저장 용량은 작습니다.
- **삭제**: 사이트에는 삭제 버튼이 없습니다 (2번 SQL에서 삭제 정책을 안 만들었기 때문에 API로는 애초에 삭제가 안 돼요). 잘못 등록된 내용을 지우려면 Supabase 대시보드의 **Table Editor → intros**에서 해당 행을 직접 삭제하고, **Storage → intro-photos**에서 사진 파일도 지우면 됩니다.
- **무료 플랜 한도**: 데이터베이스 500MB, 스토리지 1GB, 매달 API 요청 5만 회 수준으로, 지금 규모(10여 명)에는 넉넉합니다.
- **테이블이 API에 노출되지 않는다는 오류가 날 때**: 최신 Supabase는 테이블별로 API 노출 여부를 별도로 설정하는 경우가 있습니다. 안 될 경우 **Project Settings → Data API**에서 `public` 스키마의 `intros` 테이블이 노출되어 있는지 확인해주세요.
