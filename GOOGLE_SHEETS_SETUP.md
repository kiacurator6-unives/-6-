# 자기소개 페이지 — 구글 시트 연동 설정 가이드

`intro.html`의 자기소개 데이터를 모두에게 실시간으로 공유되게 하려면, 구글 시트를 간단한 백엔드로 씁니다. 코딩 지식이 없어도 아래 순서대로 복사/붙여넣기만 하면 됩니다. 총 5분 정도 걸려요.

> **이미 예전 버전(사진 기능 없는 버전)을 연동해두셨다면:** 시트에 F열(`photoUrl`) 헤더를 추가하고, 아래 2번의 새 코드로 Apps Script 내용을 통째로 교체한 뒤, 3번 순서대로 **기존 배포를 "새 버전"으로 재배포**하시면 됩니다. Sheet API URL은 그대로 유지되니 `intro-config.js`는 다시 손댈 필요 없어요. 사진을 Drive에 저장하는 기능이 추가되면서 권한 승인 화면이 한 번 더 뜰 수 있는데, 안내대로 허용해주시면 됩니다.

## 1. 구글 시트 만들기

1. [sheets.new](https://sheets.new)로 새 스프레드시트를 엽니다.
2. 맨 아래 시트 탭 이름을 **`Responses`**로 바꿉니다 (기본 "시트1"에서 더블클릭해서 변경).
3. 1행에 아래 헤더를 그대로 입력합니다.

   | A | B | C | D | E | F |
   |---|---|---|---|---|---|
   | timestamp | section | name | role | message | photoUrl |

## 2. Apps Script 붙여넣기

1. 메뉴에서 **확장 프로그램 → Apps Script**를 클릭합니다.
2. 기본으로 열려있는 `Code.gs`의 내용을 전부 지우고, 아래 코드를 그대로 붙여넣습니다.

```javascript
const SHEET_NAME = 'Responses';
const PHOTO_FOLDER_NAME = 'GarageKey Intro Photos';

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  const body = rows.slice(1); // skip header row
  const entries = body
    .filter(function (r) { return r[1] && r[2]; }) // must have section + name
    .map(function (r) {
      return {
        timestamp: r[0],
        section: r[1],
        name: r[2],
        role: r[3],
        message: r[4],
        photoUrl: r[5] || '',
      };
    });
  return ContentService.createTextOutput(JSON.stringify({ ok: true, entries: entries }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  try {
    const data = JSON.parse(e.postData.contents);
    const section = String(data.section || '').slice(0, 30);
    const name = String(data.name || '').slice(0, 30);
    const role = String(data.role || '').slice(0, 30);
    const message = String(data.message || '').slice(0, 200);

    if (!section || !name || !message) {
      return jsonOutput({ ok: false, error: 'missing fields' });
    }

    let photoUrl = '';
    if (data.photoBase64) {
      photoUrl = savePhotoToDrive(data.photoBase64, data.photoMime || 'image/jpeg', name);
    }

    sheet.appendRow([new Date(), section, name, role, message, photoUrl]);
    return jsonOutput({ ok: true, photoUrl: photoUrl });
  } catch (err) {
    return jsonOutput({ ok: false, error: String(err) });
  }
}

function savePhotoToDrive(base64, mime, name) {
  const folder = getOrCreatePhotoFolder();
  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, mime, name + '-' + Date.now());
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://drive.google.com/uc?export=view&id=' + file.getId();
}

function getOrCreatePhotoFolder() {
  const existing = DriveApp.getFoldersByName(PHOTO_FOLDER_NAME);
  if (existing.hasNext()) return existing.next();
  return DriveApp.createFolder(PHOTO_FOLDER_NAME);
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. 상단 저장 아이콘(💾)을 눌러 저장합니다. 프로젝트 이름은 아무거나 괜찮습니다 (예: "GarageKey Intro API").

## 3. 웹 앱으로 배포하기

1. 오른쪽 위 파란 **배포 → 새 배포** 버튼을 클릭합니다.
2. 유형 선택(톱니바퀴 아이콘) → **웹 앱**을 선택합니다.
3. 설정값:
   - **실행 사용자**: 나 (본인 계정)
   - **액세스 권한이 있는 사용자**: **전체(Anyone)**
   
   ⚠️ "전체"로 열어야 정적 사이트에서 로그인 없이 데이터를 주고받을 수 있습니다. 대신 URL만 알면 누구나 데이터를 추가할 수 있다는 뜻이라, URL을 공개된 곳에 노출하지 않는 게 좋습니다 (사이트 코드 안에는 포함되지만, 저장소를 공개 репо로 운영 중이면 사실상 누구나 볼 수 있긴 합니다 — 내부 소규모 팀용이라 실사용에는 큰 무리 없는 수준입니다).
4. **배포**를 클릭합니다.
5. 처음 배포하면(또는 사진 기능 추가로 코드를 교체한 뒤 재배포하면) 권한 승인 화면이 뜹니다. 본인 계정으로 로그인 → "고급" → "GarageKey Intro API(으)로 이동(안전하지 않음)" → 허용을 클릭합니다. (본인이 만든 스크립트이기 때문에 안전합니다. 구글이 미검증 스크립트에 대해 보여주는 기본 경고 문구예요.) 사진 저장 기능이 있어서 이번엔 **"Google Drive의 파일 보기, 수정, 만들기, 삭제" 권한**도 함께 요청됩니다 — 업로드된 사진을 저장할 폴더를 만들기 위해 필요한 권한이니 허용해주세요.
6. 배포가 끝나면 **웹 앱 URL**이 나타납니다. `https://script.google.com/macros/s/AKfycb.../exec` 형태입니다. 이 URL을 복사해두세요.

## 4. 사이트에 연결하기

`assets/js/intro-config.js` 파일을 열어서 아래처럼 URL을 붙여넣고 저장합니다.

```javascript
const GARAGE_KEY_SHEET_API_URL = "여기에_복사한_웹앱_URL_붙여넣기";
```

저장 후 다시 배포(git push)하면, `intro.html`이 자동으로 "구글 시트 연동 모드"로 전환됩니다. 이제 누가 어디서 소개를 입력하든 같은 시트에 쌓이고, 모두에게 보입니다.

## 참고사항

- **사진 저장 위치**: 업로드된 사진은 이 Apps Script를 만든 구글 계정의 Drive에 **"GarageKey Intro Photos"** 폴더가 자동으로 생성되어 그 안에 저장됩니다. 폴더 공유 설정은 "링크가 있는 모든 사용자 열람 가능"으로 자동 지정되어, 사이트에서 바로 이미지로 표시됩니다.
- **사진 용량**: 클라이언트(브라우저)에서 업로드 전에 자동으로 가로/세로 최대 480px, JPEG 품질 82%로 리사이즈·압축해서 보내기 때문에 원본이 커도 실제 저장되는 파일은 작습니다.
- **삭제**: 시트 연동 모드에서는 카드에 삭제 버튼이 보이지 않습니다 (누구나 URL만 알면 남의 글도 지울 수 있게 되는 걸 막기 위해 일부러 뺐습니다). 잘못 등록된 내용을 지우려면 구글 시트에서 해당 행을 직접 삭제하고, 필요하면 Drive의 "GarageKey Intro Photos" 폴더에서 사진도 함께 삭제하면 됩니다.
- **스팸/도배 방지**: 지금 코드는 별도 인증 없이 누구나 글을 쓸 수 있는 가장 단순한 형태입니다. 내부 인원만 아는 URL이라 실사용에는 문제없지만, 필요하면 간단한 비밀 코드 검증(POST 데이터에 secret 필드 추가) 같은 걸 더 넣어드릴 수 있습니다.
- **응답이 느릴 때**: Apps Script는 첫 요청이 1~2초 정도 걸릴 수 있습니다 (정상입니다). 사진이 포함된 요청은 Drive 저장 과정이 추가되어 조금 더 걸릴 수 있습니다.
- **URL을 다시 바꾸고 싶을 때**: 배포 → 배포 관리에서 기존 배포를 수정하면 URL이 그대로 유지됩니다. "새 배포"를 또 만들면 새로운 URL이 생기니, 웬만하면 기존 배포를 "관리"해서 코드만 업데이트하는 걸 추천합니다.
