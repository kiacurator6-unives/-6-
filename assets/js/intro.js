// THE GARAGE KEY — self-introduction page
//
// Data layer has two modes, chosen automatically based on
// GARAGE_KEY_SHEET_API_URL (set in assets/js/intro-config.js):
//
// 1. SHEET MODE (API URL configured): entries (including photos) are read
//    from and written to a Google Sheet + Drive via a Google Apps Script
//    Web App, so everyone who opens this page sees everyone else's entries.
//    See GOOGLE_SHEETS_SETUP.md — the Apps Script there saves uploaded
//    photos into a Drive folder and stores the resulting public URL in the
//    sheet's photoUrl column.
//
// 2. LOCAL MODE (no API URL yet): falls back to localStorage, which is
//    per-browser only. Photos are stored as compressed base64 data URLs
//    directly in localStorage (fine for a handful of small images).

(function () {
  const SECTIONS = ['kia', 'office', 'curator'];
  const STORAGE_PREFIX = 'garagekey-intro-';
  const API_URL = (typeof GARAGE_KEY_SHEET_API_URL === 'string' ? GARAGE_KEY_SHEET_API_URL : '').trim();
  const SHEET_MODE = API_URL.length > 0;

  const MAX_PHOTO_DIMENSION = 480; // px, longest side after resize
  const PHOTO_JPEG_QUALITY = 0.82;

  let cache = { kia: [], office: [], curator: [] };
  // per-form pending photo, keyed by section: { dataUrl, base64, mime } | null
  let pendingPhoto = { kia: null, office: null, curator: null };

  // ---------- local (per-browser) storage fallback ----------
  function loadLocal(section) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + section);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function saveLocal(section, entries) {
    try {
      localStorage.setItem(STORAGE_PREFIX + section, JSON.stringify(entries));
    } catch (e) {
      /* private browsing / storage disabled / quota exceeded — entry still renders this session */
    }
  }

  // ---------- Google Sheet backend ----------
  async function fetchAllFromSheet() {
    const res = await fetch(API_URL, { method: 'GET' });
    const text = await res.text();
    const data = JSON.parse(text);
    if (!data.ok) throw new Error(data.error || 'sheet returned an error');
    return data.entries || [];
  }

  async function postToSheet(section, entry) {
    // text/plain avoids a CORS preflight request, which Apps Script Web Apps
    // don't reliably support — see GOOGLE_SHEETS_SETUP.md for details.
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ section, ...entry }),
    });
    const text = await res.text();
    const data = JSON.parse(text);
    if (!data.ok) throw new Error(data.error || 'sheet rejected the entry');
    return data;
  }

  // ---------- photo handling ----------
  function resizeAndEncode(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('file read failed'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('image decode failed'));
        img.onload = () => {
          let { width, height } = img;
          const longest = Math.max(width, height);
          if (longest > MAX_PHOTO_DIMENSION) {
            const scale = MAX_PHOTO_DIMENSION / longest;
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', PHOTO_JPEG_QUALITY);
          resolve({
            dataUrl,
            base64: dataUrl.split(',')[1],
            mime: 'image/jpeg',
          });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function setupPhotoPicker(section) {
    const form = document.querySelector(`.intro-form[data-section="${section}"]`);
    if (!form) return;
    const fileInput = form.querySelector('input[type="file"][name="photo"]');
    const preview = form.querySelector('.photo-preview');
    const clearBtn = form.querySelector('.photo-clear');
    const pickerLabel = form.querySelector('.photo-picker .picker-label');

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 선택할 수 있어요.');
        fileInput.value = '';
        return;
      }
      try {
        const encoded = await resizeAndEncode(file);
        pendingPhoto[section] = encoded;
        preview.src = encoded.dataUrl;
        preview.classList.add('show');
        clearBtn.classList.add('show');
        pickerLabel.textContent = '다른 사진 선택';
      } catch (err) {
        console.error('photo processing failed', err);
        alert('사진을 처리하지 못했어요. 다른 파일로 시도해주세요.');
      }
    });

    clearBtn.addEventListener('click', () => {
      pendingPhoto[section] = null;
      fileInput.value = '';
      preview.classList.remove('show');
      preview.src = '';
      clearBtn.classList.remove('show');
      pickerLabel.textContent = '사진 선택';
    });
  }

  // ---------- rendering ----------
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function renderAvatar(entry) {
    const photo = entry.photo || entry.photoUrl || '';
    if (photo) {
      return `<img class="avatar" src="${escapeHtml(photo)}" alt="${escapeHtml(entry.name)}">`;
    }
    const initial = (entry.name || '?').trim().charAt(0).toUpperCase();
    return `<div class="avatar placeholder">${escapeHtml(initial)}</div>`;
  }

  function renderCard(entry, index, section) {
    const roleHtml = entry.role ? `<span class="role">${escapeHtml(entry.role)}</span>` : '';
    const deleteBtn = SHEET_MODE ? '' : `<button type="button" class="danger remove">삭제</button>`;
    return `
      <div class="intro-card" data-index="${index}">
        ${renderAvatar(entry)}
        <div class="body">
          <div class="who">
            <span class="name">${escapeHtml(entry.name)}</span>
            ${roleHtml}
          </div>
          <div class="msg">${escapeHtml(entry.message)}</div>
          <div class="actions">
            <button type="button" class="copy">복사하기</button>
            ${deleteBtn}
          </div>
        </div>
      </div>`;
  }

  function renderSection(section, state) {
    const listEl = document.getElementById('list-' + section);
    if (!listEl) return;

    if (state === 'loading') {
      listEl.innerHTML = `<div class="intro-empty">불러오는 중…</div>`;
      return;
    }
    if (state === 'error') {
      listEl.innerHTML = `<div class="intro-empty">목록을 불러오지 못했어요. 잠시 후 새로고침 해주세요.</div>`;
      return;
    }
    const entries = cache[section] || [];
    if (entries.length === 0) {
      listEl.innerHTML = `<div class="intro-empty">아직 등록된 소개가 없어요. 첫 번째로 소개해보세요!</div>`;
      return;
    }
    listEl.innerHTML = entries.map((e, i) => renderCard(e, i, section)).join('');
  }

  function renderModeNote() {
    const noteEl = document.getElementById('intro-mode-note');
    if (!noteEl) return;
    if (SHEET_MODE) {
      noteEl.innerHTML = `<div><b>안내</b>모든 사람에게 실시간으로 공유되는 구글 시트에 연결되어 있어요. 자유롭게 소개(+사진)를 남겨주세요.</div>`;
    } else {
      noteEl.innerHTML = `<div><b>안내</b>아직 구글 시트 연동 전이라, 지금 입력하는 내용은 <strong>내 브라우저에만</strong> 저장돼요. 다른 사람에게도 보이게 하려면 카드의 "복사하기" 버튼으로 내용을 복사해서 운영 카카오톡 채널로 전달해주세요.</div>`;
    }
  }

  // ---------- init: load all entries once, group by section ----------
  async function init() {
    renderModeNote();
    SECTIONS.forEach((s) => renderSection(s, 'loading'));

    if (!SHEET_MODE) {
      SECTIONS.forEach((s) => {
        cache[s] = loadLocal(s);
        renderSection(s);
      });
      return;
    }

    try {
      const all = await fetchAllFromSheet();
      SECTIONS.forEach((s) => (cache[s] = []));
      all.forEach((entry) => {
        if (cache[entry.section]) cache[entry.section].push(entry);
      });
      SECTIONS.forEach((s) => renderSection(s));
    } catch (err) {
      console.error('intro sheet load failed', err);
      SECTIONS.forEach((s) => renderSection(s, 'error'));
    }
  }

  function showToast(section) {
    const toast = document.querySelector(`.intro-form[data-section="${section}"] .toast`);
    if (!toast) return;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function setFormBusy(form, busy) {
    const btn = form.querySelector('button.submit');
    if (!btn) return;
    btn.disabled = busy;
    btn.textContent = busy ? '저장 중…' : '소개 남기기';
  }

  function resetPhotoPicker(form, section) {
    pendingPhoto[section] = null;
    const fileInput = form.querySelector('input[type="file"][name="photo"]');
    const preview = form.querySelector('.photo-preview');
    const clearBtn = form.querySelector('.photo-clear');
    const pickerLabel = form.querySelector('.photo-picker .picker-label');
    if (fileInput) fileInput.value = '';
    if (preview) {
      preview.classList.remove('show');
      preview.src = '';
    }
    if (clearBtn) clearBtn.classList.remove('show');
    if (pickerLabel) pickerLabel.textContent = '사진 선택';
  }

  function setupForm(section) {
    const form = document.querySelector(`.intro-form[data-section="${section}"]`);
    if (!form) return;
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const nameEl = form.querySelector('input[name="name"]');
      const roleEl = form.querySelector('input[name="role"]');
      const msgEl = form.querySelector('textarea[name="message"]');

      const name = (nameEl.value || '').trim();
      const role = (roleEl.value || '').trim();
      const message = (msgEl.value || '').trim();
      if (!name || !message) {
        nameEl.focus();
        return;
      }
      const photo = pendingPhoto[section];

      setFormBusy(form, true);
      try {
        if (SHEET_MODE) {
          const payload = { name, role, message };
          if (photo) {
            payload.photoBase64 = photo.base64;
            payload.photoMime = photo.mime;
          }
          const result = await postToSheet(section, payload);
          cache[section].push({
            name,
            role,
            message,
            photo: result.photoUrl || '',
          });
        } else {
          const entries = loadLocal(section);
          entries.push({ name, role, message, photo: photo ? photo.dataUrl : '' });
          saveLocal(section, entries);
          cache[section] = entries;
        }
        renderSection(section);
        nameEl.value = '';
        roleEl.value = '';
        msgEl.value = '';
        resetPhotoPicker(form, section);
        showToast(section);
      } catch (err) {
        console.error('submit failed', err);
        alert('저장하지 못했어요. 네트워크 상태를 확인하고 다시 시도해주세요.');
      } finally {
        setFormBusy(form, false);
      }
    });
  }

  function sectionLabel(section) {
    if (section === 'kia') return '기아';
    if (section === 'office') return '운영사무국';
    if (section === 'curator') return '큐레이터';
    return section;
  }

  function copyText(text, btn) {
    const done = () => {
      const original = btn.textContent;
      btn.textContent = '복사됨';
      setTimeout(() => (btn.textContent = original), 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      /* ignore */
    }
    document.body.removeChild(ta);
    done();
  }

  function setupListActions(section) {
    const listEl = document.getElementById('list-' + section);
    if (!listEl) return;
    listEl.addEventListener('click', (ev) => {
      const btn = ev.target.closest('button');
      if (!btn) return;
      const card = btn.closest('.intro-card');
      const index = Number(card.getAttribute('data-index'));
      const entry = (cache[section] || [])[index];
      if (!entry) return;

      if (btn.classList.contains('copy')) {
        const roleTxt = entry.role ? ` (${entry.role})` : '';
        const text = `[${sectionLabel(section)}] ${entry.name}${roleTxt}\n${entry.message}`;
        copyText(text, btn);
      } else if (btn.classList.contains('remove') && !SHEET_MODE) {
        const entries = loadLocal(section);
        entries.splice(index, 1);
        saveLocal(section, entries);
        cache[section] = entries;
        renderSection(section);
      }
    });
  }

  SECTIONS.forEach((section) => {
    setupForm(section);
    setupListActions(section);
    setupPhotoPicker(section);
  });
  init();
})();
