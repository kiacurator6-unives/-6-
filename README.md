# THE GARAGE KEY — Kia Curator 6 활동 가이드

기아 큐레이터 6기(THE GARAGE KEY) 활동 가이드북 웹사이트입니다. 순수 HTML/CSS/JS로만 만들어져 있어 빌드 과정 없이 정적 호스팅(Vercel, Netlify, GitHub Pages 등) 어디에도 그대로 올릴 수 있습니다.

## 폴더 구조

```
kia-curator-guidebook/
├─ index.html                     # 홈 — 히어로 + 인터랙티브 차량 로테이터 + 챕터 목차
├─ intro.html                     # 자기소개 페이지 (기아 / 운영사무국 / 큐레이터) — 사이드바 하단 버튼으로만 연결, 챕터 내비에는 없음
├─ chapters/
│  ├─ 01-about-kia-curator.html
│  ├─ 02-activity-overview.html
│  ├─ 03-k-credit.html
│  ├─ 04-content-mission.html
│  ├─ 05-vehicle-usp.html
│  ├─ 06-publish-with-the-key.html
│  ├─ 07-copyright-rights.html
│  ├─ 08-vehicle-delivery-return.html
│  ├─ 09-faq.html
│  └─ 10-contact.html
└─ assets/
   ├─ css/style.css                # 전 페이지 공통 디자인 시스템 (컬러/타이포/컴포넌트)
   ├─ js/main.js                   # 상단 내비 모바일 드롭다운 토글 + 현재 페이지 active 상태
   ├─ js/rotator.js                # 홈 화면 인터랙티브 차량 로테이터 로직
   ├─ fonts/                       # Kia Signature 폰트 (Light/Regular/Bold, 로컬 임베드)
   └─ img/                         # 실제 이미지 에셋을 넣을 폴더 (현재 비어있음)
```

## 내비게이션 & 타이포그래피

- 좌측 고정 세로 사이드바로 11개 항목(Home + 챕터 10개)을 전부 스크롤 없이 한눈에 보여줍니다. 가로형 상단 메뉴는 챕터 제목이 길어 한 줄에 다 담기지 않아 세로형으로 유지했습니다. 880px 이하 화면에서는 좌측 상단 햄버거 버튼을 눌러 슬라이드 드로어로 열립니다.
- 전 페이지 폰트는 외부 CDN 없이 `assets/fonts/`에 포함된 Kia Signature(Light 300 / Regular 400 / Bold 700)를 `@font-face`로 로컬 임베드해서 사용합니다. 네트워크 연결 없이도 폰트가 항상 동일하게 보입니다.

각 페이지는 완전히 독립된 HTML 파일이라, 챕터 하나만 링크로 공유하거나 별도로 수정해도 다른 페이지에 영향이 없습니다. 공통 스타일/스크립트는 `assets/`를 같이 불러오는 구조입니다.

## 로컬에서 확인하기

빌드 과정이 없어서 `index.html`을 브라우저로 바로 열어도 대부분 잘 보입니다. 다만 상대경로 이슈를 피하려면 간단한 로컬 서버를 띄우는 걸 권장합니다.

```bash
cd kia-curator-guidebook
python3 -m http.server 8080
# 브라우저에서 http://localhost:8080 접속
```

## 배포하기

### 1) 지금 바로 링크만 확인하고 싶을 때 — Netlify Drop
계정 없이 `kia-curator-guidebook` 폴더를 https://app.netlify.com/drop 에 드래그하면 즉시 공개 URL이 생성됩니다. 이후 내용이 바뀌면 같은 사이트의 Deploys 페이지에 업데이트된 폴더를 다시 드래그하면 **같은 URL이 그대로 갱신**됩니다.

### 2) 계속 하나의 URL로 운영할 공식 페이지로 쓸 때 — GitHub + Vercel/Netlify 연동 (권장)
1. 이 폴더를 GitHub 저장소로 올립니다.
   ```bash
   cd kia-curator-guidebook
   git init
   git add .
   git commit -m "Initial commit: THE GARAGE KEY guidebook"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. Vercel(https://vercel.com/new) 또는 Netlify(https://app.netlify.com)에서 "Import Git Repository"로 이 저장소를 연결합니다.
3. 빌드 커맨드는 비워두고, Output/Root Directory는 저장소 루트(`/`)로 지정합니다. (정적 HTML이라 빌드 스텝이 필요 없습니다.)
4. 배포가 완료되면 고정 URL이 생기고, 이후로는 로컬에서 파일을 수정 → `git push`만 하면 자동으로 재배포됩니다.

## 콘텐츠 업데이트 방법

- 특정 챕터 내용만 바꿀 때: 해당 `chapters/0X-*.html` 파일의 `<div class="chapter-body">` 안쪽만 수정하면 됩니다. 표/카드/체크리스트 등은 `style.css`에 정의된 클래스(`.tbl-wrap`, `.card-grid`, `.dodont`, `.timeline`, `.callout`, `.tag` 등)를 그대로 재사용하면 디자인이 자동으로 맞춰집니다.
- 챕터를 추가/삭제할 때: `index.html`과 모든 `chapters/*.html`의 사이드바 `<ul id="navList">` 목록을 함께 수정해야 합니다. (페이지 수가 늘어나면 알려주시면 템플릿 스크립트로 일괄 반영해드릴 수 있어요.)
- 담당자 연락처: `chapters/10-contact.html`의 `.contact-card` 블록에서 관리합니다. 현재는 개인 휴대폰 번호 대신 "운영 채널 공지 참고" 문구로 대체되어 있습니다 (공개 웹페이지이므로 개인정보 노출 방지).

## 자기소개 페이지 (intro.html)

`index.html` 사이드바 하단의 "큐레이터 자기소개" 버튼으로만 연결되는 별도 페이지입니다 (01~10 챕터 내비게이션에는 포함되어 있지 않습니다). 기아 / 운영사무국 / 큐레이터 세 섹션으로 나뉘어 있고, 각자 이름·역할·한 줄 소개를 입력해서 카드로 등록할 수 있습니다.

**백엔드: 구글 시트 연동.** 별도 서버 없이, 구글 시트 + Apps Script Web App을 가벼운 백엔드로 씁니다. 설정 방법은 **[GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)**에 5분이면 끝나는 순서로 정리해뒀습니다. 설정 전에는 자동으로 "로컬 전용 모드"로 동작해서(입력한 브라우저에만 저장) 사이트가 깨지지 않고, `assets/js/intro-config.js`에 배포한 웹 앱 URL만 붙여넣으면 바로 "구글 시트 연동 모드"로 전환됩니다.

## 홈 화면 인터랙티브 차량

`index.html`의 로테이터는 이제 실제 기아 EV5 사진에서 배경을 제거(누끼)한 이미지를 사용합니다. 마우스 위치에 따라 3D로 기울어지는 방식은 이전과 동일하고, 그 안에 들어가는 이미지만 추상 실루엣 → 실제 차량 컷아웃으로 교체됐습니다.

- 원본: `the_kia_ev5_feature_bg_pc.avif` (사용자 제공)
- 배경 제거 및 크롭 결과물: `assets/img/vehicle/kia-ev5-cutout.webp`(기본, ~70KB), `kia-ev5-cutout.png`(폴백, 알파 채널 포함)
- `<picture>` 태그로 WebP를 우선 로드하고, 구형 브라우저는 PNG로 자동 폴백됩니다.

다른 차량이나 다른 각도의 사진으로 교체하고 싶으면, 같은 방식(배경 제거 → 투명 PNG/WebP로 내보내기)으로 이미지를 바꾸고 `assets/img/vehicle/` 안의 파일명을 교체하면 됩니다. 여러 각도의 사진(예: 24~36장의 회전 촬영본)이 준비되면 `assets/js/rotator.js` 상단 주석에 적힌 방식대로 진짜 360° 프레임 스위칭 방식으로도 업그레이드할 수 있습니다.

---
THE GARAGE KEY · Kia Curator 6 Activity Guidebook — *Unlock More Ways of Kia*
