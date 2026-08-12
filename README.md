# THE GARAGE KEY — Kia Curator 6 활동 가이드

기아 큐레이터 6기(THE GARAGE KEY) 활동 가이드북 웹사이트입니다. 순수 HTML/CSS/JS로만 만들어져 있어 빌드 과정 없이 정적 호스팅(Vercel, Netlify, GitHub Pages 등) 어디에도 그대로 올릴 수 있습니다.

## 폴더 구조

```
kia-curator-guidebook/
├─ index.html                     # 홈 — 히어로 + 인터랙티브 차량 로테이터 + 챕터 목차
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
   ├─ js/main.js                   # 모바일 메뉴 토글 + 현재 페이지 네비 active 상태
   ├─ js/rotator.js                # 홈 화면 인터랙티브 차량 로테이터 로직
   └─ img/                         # 실제 이미지 에셋을 넣을 폴더 (현재 비어있음)
```

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

## 홈 화면 인터랙티브 차량

현재 `index.html`의 로테이터는 실제 차량 사진이 아니라, 마우스 위치에 따라 3D로 기울어지는 **추상 실루엣 SVG**로 구현되어 있습니다 (이 환경에서는 이미지 생성이 불가능해서, 브랜드 특정 디자인을 재현하지 않는 방식으로 대체했습니다).

실제 차량 회전 촬영본(예: 24~36장의 각도별 프레임 이미지)이 준비되면 `assets/js/rotator.js` 상단 주석에 적힌 방식대로 진짜 360° 프레임 스위칭 방식으로 손쉽게 교체할 수 있도록 로직을 분리해뒀습니다.

---
THE GARAGE KEY · Kia Curator 6 Activity Guidebook — *Unlock More Ways of Kia*
