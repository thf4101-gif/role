/**
 * @license
 * 마블 히어로 학급 1인 1역할 배정 도우미 - script.js
 * GitHub Pages 호스팅을 위해 순수 JavaScript(ES6+)로 작성되었습니다.
 */

// ==========================================================================
// 1. 기본 예시 데이터: 마블 어벤져스 학급 요원 12명 & 히어로 임무 12개
// ==========================================================================
const DEFAULT_STUDENTS = [
  '김하은', '이도현', '박서윤', '최민준',
  '정예린', '강현우', '윤지아', '송시우',
  '한수아', '임도윤', '배채원', '오서진'
];

const DEFAULT_ROLES = [
  { title: '캡틴 칠판 지우미', icon: '🛡️', desc: '수업 후 칠판과 교탁을 캡틴처럼 단정하고 깨끗하게 정리해요' },
  { title: '아이언 도서 정리함', icon: '🤖', desc: '학급 문고 책꽂이를 아이언맨 수트처럼 각 맞춰 바르게 정돈해요' },
  { title: '토르 에너지 지킴이', icon: '⚡', desc: '쉬는 시간과 이동 수업 때 빈 교실 불과 모니터를 번개처럼 꺼요' },
  { title: '스파이더 줄서기 반장', icon: '🕸️', desc: '이동 수업이나 급식실 갈 때 거미줄처럼 질서 있게 두 줄로 서요' },
  { title: '헐크 분리수거 박사', icon: '💥', desc: '종이와 플라스틱 등 분리수거통을 헐크 파워로 완벽하게 관리해요' },
  { title: '블랙팬서 우유 도우미', icon: '🥛', desc: '급식실에서 우유 상자를 날렵하게 챙겨와 친구들에게 배부해요' },
  { title: '닥터 창문 환기 대장', icon: '🪟', desc: '아침 자습 전과 점심 후 교실 창문을 열어 맑은 공기를 불러와요' },
  { title: '호크아이 식사 지킴이', icon: '🍱', desc: '점심시간 손 씻기와 질서 있는 식사 매너를 명사수처럼 살펴요' },
  { title: '앤트맨 위생/방역 요원', icon: '🧴', desc: '손소독제를 채워두고 교실 구석구석 청결을 세심하게 지켜요' },
  { title: '그루트 식물 사랑이', icon: '🌱', desc: '교실 화분에 정성껏 물을 주며 아이 엠 그루트처럼 보살펴요' },
  { title: '비전 알림장 배부 요정', icon: '📄', desc: '선생님 가정통신문과 학습지를 친구들에게 신속 정확하게 나눠줘요' },
  { title: '캡틴 마블 칭찬 배달부', icon: '💌', desc: '친구들의 고마운 마음과 칭찬 쪽지를 빛의 속도로 전달해요' }
];

// 마블 히어로 트레이딩 카드 팔레트 (12가지 히어로 테마)
const HERO_PALETTES = [
  { hero: 'Captain America', accent: '#0984e3', bg: '#f0f7ff', border: '#0984e3', iconBg: '#dbeafe' },
  { hero: 'Iron Man', accent: '#e23636', bg: '#fff5f5', border: '#e23636', iconBg: '#fee2e2' },
  { hero: 'Thor', accent: '#f59e0b', bg: '#fffbeb', border: '#d97706', iconBg: '#fef3c7' },
  { hero: 'Spider-Man', accent: '#ef4444', bg: '#fff1f2', border: '#3b82f6', iconBg: '#ffe4e6' },
  { hero: 'Hulk', accent: '#10b981', bg: '#f0fdf4', border: '#059669', iconBg: '#d1fae5' },
  { hero: 'Black Panther', accent: '#6366f1', bg: '#f5f3ff', border: '#1e293b', iconBg: '#ede9fe' },
  { hero: 'Doctor Strange', accent: '#f97316', bg: '#fff7ed', border: '#ea580c', iconBg: '#ffedd5' },
  { hero: 'Hawkeye', accent: '#8b5cf6', bg: '#f5f3ff', border: '#7c3aed', iconBg: '#ddd6fe' },
  { hero: 'Ant-Man', accent: '#ec4899', bg: '#fdf2f8', border: '#db2777', iconBg: '#fce7f3' },
  { hero: 'Groot', accent: '#84cc16', bg: '#f7fee7', border: '#65a30d', iconBg: '#ecfccb' },
  { hero: 'Vision', accent: '#06b6d4', bg: '#ecfeff', border: '#0891b2', iconBg: '#cffafe' },
  { hero: 'Captain Marvel', accent: '#eab308', bg: '#fefce8', border: '#dc2626', iconBg: '#fef08a' }
];

// ==========================================================================
// 2. 상태 관리 (State)
// ==========================================================================
const STORAGE_KEY = 'marvel_class_roles_app_v2';

let appState = {
  students: [...DEFAULT_STUDENTS],
  roles: JSON.parse(JSON.stringify(DEFAULT_ROLES)),
  assignments: [], // [{ id, studentName, roleTitle, roleIcon, roleDesc, checked: false }]
  sheetUrl: '',
  printSettings: {
    title: '⚡ 우리 반 어벤져스 1인 1역할 작전 배치도 ⚡',
    className: '3학년 2반',
    date: '2026학년도 1학기',
    slogan: '"책임감과 용기로 함께 만드는 최고의 우리 교실!"',
    layout: 'card' // 'card' | 'table'
  }
};

// ==========================================================================
// 3. 효과음 & 비주얼 애니메이션 (Web Audio API & Confetti)
// ==========================================================================
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playPop(freq = 520, duration = 0.08) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playFanfare() {
    try {
      this.init();
      if (!this.ctx) return;
      // 히어로 팡파레 시퀀스
      const notes = [392, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playPop(freq, 0.22);
        }, idx * 100);
      });
    } catch (e) {}
  }
}

const sound = new SoundFX();

// 마블 히어로 콘페티 (레드, 골드, 일렉트릭 블루, 에메랄드)
class ConfettiEffect {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animId = null;
    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst() {
    if (!this.ctx) return;
    this.resize();
    const colors = ['#e23636', '#ffcc00', '#0984e3', '#2ed573', '#ffffff', '#ff4757'];
    this.particles = [];
    for (let i = 0; i < 110; i++) {
      this.particles.push({
        x: window.innerWidth * (0.2 + Math.random() * 0.6),
        y: window.innerHeight * 0.45,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.95) * 16,
        size: Math.random() * 9 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    if (this.animId) cancelAnimationFrame(this.animId);
    this.loop();
  }

  loop() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let alive = 0;

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4;
      p.vx *= 0.97;
      p.rotation += p.vRot;
      p.opacity -= 0.009;

      if (p.opacity > 0 && p.y < this.canvas.height + 50) {
        alive++;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        this.ctx.restore();
      }
    }

    if (alive > 0) {
      this.animId = requestAnimationFrame(() => this.loop());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

let confetti;

// ==========================================================================
// 4. 로컬 스토리지 데이터 관리
// ==========================================================================
function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.students) && parsed.students.length > 0) {
        appState.students = parsed.students;
      }
      if (Array.isArray(parsed.roles) && parsed.roles.length > 0) {
        appState.roles = parsed.roles;
      }
      if (Array.isArray(parsed.assignments)) {
        appState.assignments = parsed.assignments;
      }
      if (parsed.sheetUrl) {
        appState.sheetUrl = parsed.sheetUrl;
      }
      if (parsed.printSettings) {
        appState.printSettings = Object.assign(appState.printSettings, parsed.printSettings);
      }
    }
  } catch (err) {
    console.warn('저장 데이터 복원 오류, 기본값을 유지합니다.', err);
  }
}

function saveCurrentState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (err) {
    console.error('로컬스토리지 저장 실패:', err);
  }
}

// ==========================================================================
// 5. 핵심 알고리즘: Fisher-Yates 셔플 & 히어로 1:1 매칭
// ==========================================================================
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function performAssignment() {
  if (appState.students.length === 0) {
    showToast('⚠️ 요원 명단이 비어 있습니다. [요원 관리]에서 등록해 주세요.');
    return;
  }
  if (appState.roles.length === 0) {
    showToast('⚠️ 배정할 히어로 임무가 없습니다. [임무 관리]에서 추가해 주세요.');
    return;
  }

  const emptyState = document.getElementById('empty-state');
  const shufflingState = document.getElementById('shuffling-state');
  const cardsGrid = document.getElementById('cards-grid');
  const diceIcon = document.getElementById('dice-icon');

  emptyState.style.display = 'none';
  cardsGrid.style.display = 'none';
  shufflingState.style.display = 'flex';

  if (diceIcon) {
    diceIcon.style.transform = 'rotate(720deg) scale(1.4)';
  }

  // 셔플 비트음
  for (let i = 0; i < 6; i++) {
    setTimeout(() => sound.playPop(350 + i * 90, 0.06), i * 110);
  }

  setTimeout(() => {
    const shuffledRoles = shuffleArray(appState.roles);
    const newAssignments = [];
    const totalCount = appState.students.length;

    for (let i = 0; i < totalCount; i++) {
      const studentName = appState.students[i];
      const role = shuffledRoles[i % shuffledRoles.length];

      newAssignments.push({
        id: i + 1,
        studentName: studentName,
        roleTitle: role.title,
        roleIcon: role.icon || '⚡',
        roleDesc: role.desc || '우리 반을 위해 히어로 임무를 성실히 수행해요!',
        checked: false
      });
    }

    appState.assignments = newAssignments;
    saveCurrentState();

    shufflingState.style.display = 'none';
    renderAssignmentsGrid();
    cardsGrid.style.display = 'grid';

    if (diceIcon) {
      diceIcon.style.transform = 'none';
    }

    // 마블 어셈블 팡파레 & 콘페티
    sound.playFanfare();
    if (confetti) confetti.burst();

    showToast(`🚀 어벤져스 어셈블! 총 ${newAssignments.length}명의 히어로 배정이 완료되었습니다!`);
    updateSummaryUI();
  }, 750);
}

// ==========================================================================
// 6. UI 렌더링 함수들 (마블 트레이딩 카드 생성)
// ==========================================================================
function renderAssignmentsGrid(searchTerm = '') {
  const container = document.getElementById('cards-grid');
  const emptyState = document.getElementById('empty-state');
  const assignments = appState.assignments;

  if (!assignments || assignments.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'flex';
    return;
  }

  container.innerHTML = '';
  emptyState.style.display = 'none';
  container.style.display = 'grid';

  const filterLower = searchTerm.trim().toLowerCase();
  let matchedCount = 0;

  assignments.forEach((item, index) => {
    if (filterLower) {
      const matchName = item.studentName.toLowerCase().includes(filterLower);
      const matchRole = item.roleTitle.toLowerCase().includes(filterLower);
      const matchDesc = item.roleDesc.toLowerCase().includes(filterLower);
      if (!matchName && !matchRole && !matchDesc) {
        return;
      }
    }

    matchedCount++;
    const palette = HERO_PALETTES[index % HERO_PALETTES.length];

    const card = document.createElement('div');
    card.className = 'role-card';
    card.style.setProperty('--hero-card-accent', palette.accent);
    card.style.setProperty('--hero-card-bg', palette.iconBg);

    card.innerHTML = `
      <div class="card-header">
        <div class="student-badge">
          <span class="student-no">${item.id}</span>
          <span class="student-name">${escapeHtml(item.studentName)} 요원</span>
        </div>
        <span class="role-tag-pill">HERO #${item.id}</span>
      </div>

      <div class="card-body">
        <div class="role-icon-box" title="${escapeHtml(item.roleTitle)}">
          ${item.roleIcon}
        </div>
        <div class="role-text-box">
          <h4 class="role-title">${escapeHtml(item.roleTitle)}</h4>
          <p class="role-desc">${escapeHtml(item.roleDesc)}</p>
        </div>
      </div>

      <div class="card-footer">
        <label class="mission-checkbox" title="오늘의 히어로 임무 완수 여부를 체크합니다">
          <input type="checkbox" ${item.checked ? 'checked' : ''} data-index="${index}" class="chk-mission" />
          <span>작전 임무 완수!</span>
        </label>
        <button class="btn-card-action no-print" data-action="swap" data-index="${index}" title="다른 요원과 임무를 교대합니다">
          ⇄ 임무 교대
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  // 미션 체크 이벤트
  container.querySelectorAll('.chk-mission').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      if (appState.assignments[idx]) {
        appState.assignments[idx].checked = e.target.checked;
        saveCurrentState();
        if (e.target.checked) {
          sound.playPop(840, 0.09);
          showToast(`⚡ ${appState.assignments[idx].studentName} 요원, 오늘 히어로 임무 완수! 훌륭합니다!`);
        }
      }
    });
  });

  // 임무 맞교환
  container.querySelectorAll('[data-action="swap"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.index, 10);
      handleRoleSwapPrompt(idx);
    });
  });

  document.getElementById('assigned-count').textContent = matchedCount;
}

function handleRoleSwapPrompt(sourceIdx) {
  const current = appState.assignments[sourceIdx];
  const otherStudents = appState.assignments
    .map((a, i) => `${i + 1}번. ${a.studentName} 요원 (${a.roleTitle})`)
    .filter((_, i) => i !== sourceIdx);

  const input = prompt(
    `[${current.studentName} 요원]의 임무(${current.roleTitle})와 맞바꿀 요원의 번호(1~${appState.assignments.length})를 입력하세요:\n\n` +
    otherStudents.join('\n')
  );

  if (!input) return;
  const targetNo = parseInt(input.trim(), 10);
  const targetIdx = targetNo - 1;

  if (isNaN(targetIdx) || targetIdx < 0 || targetIdx >= appState.assignments.length || targetIdx === sourceIdx) {
    showToast('⚠️ 올바른 요원 번호를 입력해 주세요.');
    return;
  }

  const target = appState.assignments[targetIdx];
  const tempRoleTitle = current.roleTitle;
  const tempRoleIcon = current.roleIcon;
  const tempRoleDesc = current.roleDesc;

  current.roleTitle = target.roleTitle;
  current.roleIcon = target.roleIcon;
  current.roleDesc = target.roleDesc;

  target.roleTitle = tempRoleTitle;
  target.roleIcon = tempRoleIcon;
  target.roleDesc = tempRoleDesc;

  saveCurrentState();
  renderAssignmentsGrid();
  sound.playPop(680, 0.1);
  showToast(`⚡ [${current.studentName} 요원]과 [${target.studentName} 요원]의 임무가 성공적으로 교대되었습니다!`);
}

function updateSummaryUI() {
  const stuCount = appState.students.length;
  const roleCount = appState.roles.length;

  document.getElementById('student-count-num').textContent = stuCount;
  document.getElementById('role-count-num').textContent = roleCount;
  document.getElementById('modal-student-count').textContent = stuCount;
  document.getElementById('modal-role-count').textContent = roleCount;

  const chipStatus = document.getElementById('chip-match-status');
  const statusText = document.getElementById('status-text');
  const balanceAlert = document.getElementById('manage-balance-alert');

  if (stuCount === 0 || roleCount === 0) {
    chipStatus.className = 'chip chip-status warning';
    statusText.textContent = '명단 또는 임무 부족';
    if (balanceAlert) {
      balanceAlert.className = 'balance-bad';
      balanceAlert.textContent = '요원 명단과 임무를 등록해 주세요.';
    }
  } else if (stuCount === roleCount) {
    chipStatus.className = 'chip chip-status';
    statusText.textContent = `출동 준비 완료 (${stuCount} : ${roleCount})`;
    if (balanceAlert) {
      balanceAlert.className = 'balance-good';
      balanceAlert.textContent = `요원 수와 임무 수가 완벽히 일치합니다 (${stuCount}명 : ${roleCount}개)`;
    }
  } else {
    chipStatus.className = 'chip chip-status warning';
    statusText.textContent = `인원수 불일치 (${stuCount}명 / ${roleCount}개)`;
    if (balanceAlert) {
      balanceAlert.className = 'balance-bad';
      balanceAlert.textContent = `주의: 요원(${stuCount}명)과 임무(${roleCount}개) 수가 달라 순환 배정됩니다.`;
    }
  }

  // 인쇄 뷰 메타 동기화
  document.getElementById('print-view-title').textContent = appState.printSettings.title;
  document.getElementById('print-view-class').textContent = appState.printSettings.className;
  document.getElementById('print-view-date').textContent = appState.printSettings.date;
  document.getElementById('print-view-slogan').textContent = appState.printSettings.slogan;
}

// ==========================================================================
// 7. 요원 명단 및 히어로 임무 관리 모달
// ==========================================================================
function renderManageLists() {
  const studentsContainer = document.getElementById('students-list-view');
  const rolesContainer = document.getElementById('roles-list-view');

  // 학생 명단
  studentsContainer.innerHTML = '';
  appState.students.forEach((name, idx) => {
    const row = document.createElement('div');
    row.className = 'manage-item-row';
    row.innerHTML = `
      <div class="manage-item-left">
        <span class="manage-item-badge">#${idx + 1}</span>
        <span class="manage-item-name"><strong>${escapeHtml(name)}</strong> 요원</span>
      </div>
      <button class="btn-remove-item" data-type="student" data-index="${idx}" title="제외">&times;</button>
    `;
    studentsContainer.appendChild(row);
  });

  // 역할 목록
  rolesContainer.innerHTML = '';
  appState.roles.forEach((r, idx) => {
    const row = document.createElement('div');
    row.className = 'manage-item-row';
    row.innerHTML = `
      <div class="manage-item-left">
        <span class="manage-item-badge">#${idx + 1}</span>
        <span style="font-size: 1.3rem; margin-right: 4px;">${r.icon || '⚡'}</span>
        <strong>${escapeHtml(r.title)}</strong>
        <span style="font-size: 0.82rem; color: #64748b; margin-left: 6px;">${escapeHtml(r.desc || '')}</span>
      </div>
      <button class="btn-remove-item" data-type="role" data-index="${idx}" title="삭제">&times;</button>
    `;
    rolesContainer.appendChild(row);
  });

  document.querySelectorAll('.btn-remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.currentTarget.dataset.type;
      const idx = parseInt(e.currentTarget.dataset.index, 10);
      if (type === 'student') {
        appState.students.splice(idx, 1);
      } else {
        appState.roles.splice(idx, 1);
      }
      saveCurrentState();
      renderManageLists();
      updateSummaryUI();
    });
  });

  updateSummaryUI();
}

function addNewStudent() {
  const input = document.getElementById('new-student-name');
  const name = input.value.trim();
  if (!name) return;

  appState.students.push(name);
  input.value = '';
  saveCurrentState();
  renderManageLists();
  updateSummaryUI();
  sound.playPop(520, 0.05);
  input.focus();
}

function addNewRole() {
  const iconInput = document.getElementById('new-role-icon');
  const titleInput = document.getElementById('new-role-title');
  const descInput = document.getElementById('new-role-desc');

  const title = titleInput.value.trim();
  if (!title) {
    showToast('⚠️ 히어로 임무명을 입력하세요.');
    titleInput.focus();
    return;
  }

  const icon = iconInput.value.trim() || '⚡';
  const desc = descInput.value.trim() || '우리 반을 위해 히어로 임무를 성실히 수행해요!';

  appState.roles.push({ title, icon, desc });
  titleInput.value = '';
  descInput.value = '';
  saveCurrentState();
  renderManageLists();
  updateSummaryUI();
  sound.playPop(560, 0.05);
  titleInput.focus();
}

// ==========================================================================
// 8. 구글 스프레드시트 (Apps Script) 본부 연동
// ==========================================================================
async function handleSheetLoad() {
  if (!appState.sheetUrl) {
    openModal('modal-sheet-config');
    showToast('🌐 구글 Apps Script 웹 앱 URL을 먼저 등록해 주세요.');
    return;
  }

  showToast('🔄 스프레드시트 본부에서 요원 명단을 불러오는 중...');
  try {
    const res = await fetch(appState.sheetUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json();

    if (data && data.success) {
      if (Array.isArray(data.students) && data.students.length > 0) {
        appState.students = data.students;
      }
      if (Array.isArray(data.roles) && data.roles.length > 0) {
        appState.roles = data.roles;
      }
      saveCurrentState();
      renderManageLists();
      updateSummaryUI();
      sound.playFanfare();
      showToast(`✅ 시트에서 요원 ${appState.students.length}명, 임무 ${appState.roles.length}개를 불러왔습니다!`);
    } else {
      throw new Error(data.message || '응답 데이터 형식 오류');
    }
  } catch (err) {
    console.warn('Apps Script 통신 오류:', err);
    showToast(`⚠️ 시트 연결 중 응답 오류 (${err.message}). Web App 권한이 '모든 사용자'인지 확인하세요.`);
  }
}

async function handleSheetSave() {
  if (!appState.assignments || appState.assignments.length === 0) {
    showToast('⚠️ 먼저 [⚡ 역할 배정하기]를 눌러 작전 배치를 완료해 주세요!');
    return;
  }

  if (!appState.sheetUrl) {
    openModal('modal-sheet-config');
    showToast('🌐 결과를 저장할 구글 Apps Script 웹 앱 URL을 먼저 등록해 주세요.');
    return;
  }

  showToast('💾 스프레드시트에 작전 결과를 저장하는 중...');
  try {
    const payload = {
      assignments: appState.assignments,
      timestamp: new Date().toISOString()
    };

    const res = await fetch(appState.sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'cors'
    });

    const result = await res.json();
    if (result && result.success) {
      sound.playPop(800, 0.1);
      showToast('✅ 구글 스프레드시트 [히어로배정결과] 시트에 저장이 완료되었습니다!');
    } else {
      showToast('✅ 저장을 완료했습니다. (스프레드시트를 새로고침하여 확인하세요)');
    }
  } catch (err) {
    // CORS 302 리다이렉트 대비 no-cors 모드 재시도
    try {
      await fetch(appState.sheetUrl, {
        method: 'POST',
        body: JSON.stringify({ assignments: appState.assignments }),
        mode: 'no-cors'
      });
      showToast('✅ 구글 스프레드시트에 결과 저장이 요청되었습니다!');
    } catch (e2) {
      showToast('⚠️ 저장 실패: URL과 권한 설정을 다시 확인해 주세요.');
    }
  }
}

// ==========================================================================
// 9. 교실 게시판 부착용 A4 인쇄
// ==========================================================================
function prepareAndExecutePrint() {
  appState.printSettings.title = document.getElementById('input-print-title').value.trim() || '우리 반 어벤져스 1인 1역할 작전 배치도';
  appState.printSettings.className = document.getElementById('input-print-class').value.trim() || '우리 반';
  appState.printSettings.date = document.getElementById('input-print-date').value.trim() || '2026학년도';
  appState.printSettings.slogan = document.getElementById('input-print-slogan').value.trim() || '';

  saveCurrentState();
  updateSummaryUI();

  closeModal('modal-print-setup');

  if (!appState.assignments || appState.assignments.length === 0) {
    showToast('⚠️ 배정 결과가 없어 빈 배치도로 인쇄됩니다.');
  }

  setTimeout(() => {
    window.print();
  }, 200);
}

// ==========================================================================
// 10. 결과 텍스트 복사 (알림장용)
// ==========================================================================
function copyResultsToClipboard() {
  if (!appState.assignments || appState.assignments.length === 0) {
    showToast('⚠️ 복사할 작전 결과가 없습니다. 먼저 배정하기를 눌러주세요.');
    return;
  }

  const lines = [
    `⚡ [${appState.printSettings.className}] 어벤져스 1인 1역할 작전배치도 ⚡`,
    `일자: ${appState.printSettings.date}`,
    '================================='
  ];

  appState.assignments.forEach(item => {
    lines.push(`${item.id}번 ${item.studentName} 요원 : ${item.roleIcon} ${item.roleTitle} - ${item.roleDesc}`);
  });

  lines.push('=================================');
  lines.push('모든 히어로 요원들은 맡은 임무에 최선을 다해 주세요! 🚀');

  const fullText = lines.join('\n');
  navigator.clipboard.writeText(fullText).then(() => {
    sound.playPop(700, 0.08);
    showToast('📋 작전 결과가 클립보드에 복사되었습니다! (알림장/메신저에 붙여넣기)');
  }).catch(() => {
    const t = document.createElement('textarea');
    t.value = fullText;
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
    showToast('📋 작전 결과가 클립보드에 복사되었습니다!');
  });
}

// ==========================================================================
// 11. 모달 및 팝업 헬퍼
// ==========================================================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}

function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast-message');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'flex';

  if (window._toastTimer) clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.style.display = 'none';
  }, duration);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

// ==========================================================================
// 12. DOM 로드 완료 및 이벤트 바인딩
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  confetti = new ConfettiEffect('confetti-canvas');
  loadSavedState();
  updateSummaryUI();

  if (appState.assignments && appState.assignments.length > 0) {
    renderAssignmentsGrid();
  }

  // 메인 배정 버튼
  const btnAssign = document.getElementById('btn-assign');
  if (btnAssign) btnAssign.addEventListener('click', performAssignment);

  // 시트 연동 버튼
  const btnSheetLoad = document.getElementById('btn-sheet-load');
  if (btnSheetLoad) btnSheetLoad.addEventListener('click', handleSheetLoad);

  const btnSheetSave = document.getElementById('btn-sheet-save');
  if (btnSheetSave) btnSheetSave.addEventListener('click', handleSheetSave);

  const btnSheetConfig = document.getElementById('btn-sheet-config');
  if (btnSheetConfig) {
    btnSheetConfig.addEventListener('click', () => {
      document.getElementById('input-sheet-url').value = appState.sheetUrl || '';
      updateSheetStatusDisplay();
      openModal('modal-sheet-config');
    });
  }

  // 인쇄 모달 열기
  const btnPrintOpen = document.getElementById('btn-print-open');
  if (btnPrintOpen) {
    btnPrintOpen.addEventListener('click', () => {
      document.getElementById('input-print-title').value = appState.printSettings.title;
      document.getElementById('input-print-class').value = appState.printSettings.className;
      document.getElementById('input-print-date').value = appState.printSettings.date;
      document.getElementById('input-print-slogan').value = appState.printSettings.slogan;
      openModal('modal-print-setup');
    });
  }

  const btnExecutePrint = document.getElementById('btn-execute-print');
  if (btnExecutePrint) btnExecutePrint.addEventListener('click', prepareAndExecutePrint);

  const btnCancelPrint = document.getElementById('btn-cancel-print-setup');
  if (btnCancelPrint) btnCancelPrint.addEventListener('click', () => closeModal('modal-print-setup'));

  const btnClosePrintSetup = document.getElementById('btn-close-print-setup');
  if (btnClosePrintSetup) btnClosePrintSetup.addEventListener('click', () => closeModal('modal-print-setup'));

  // 명단·임무 관리 모달
  const btnManage = document.getElementById('btn-manage');
  if (btnManage) {
    btnManage.addEventListener('click', () => {
      renderManageLists();
      openModal('modal-manage');
    });
  }

  const btnCloseManage = document.getElementById('btn-close-manage');
  if (btnCloseManage) btnCloseManage.addEventListener('click', () => closeModal('modal-manage'));

  const btnSaveManage = document.getElementById('btn-save-manage');
  if (btnSaveManage) btnSaveManage.addEventListener('click', () => closeModal('modal-manage'));

  // 탭 전환
  const tabBtnStudents = document.getElementById('tab-btn-students');
  const tabBtnRoles = document.getElementById('tab-btn-roles');
  const tabContentStudents = document.getElementById('tab-content-students');
  const tabContentRoles = document.getElementById('tab-content-roles');

  if (tabBtnStudents && tabBtnRoles) {
    tabBtnStudents.addEventListener('click', () => {
      tabBtnStudents.classList.add('active');
      tabBtnRoles.classList.remove('active');
      tabContentStudents.classList.add('active');
      tabContentRoles.classList.remove('active');
    });

    tabBtnRoles.addEventListener('click', () => {
      tabBtnRoles.classList.add('active');
      tabBtnStudents.classList.remove('active');
      tabContentRoles.classList.add('active');
      tabContentStudents.classList.remove('active');
    });
  }

  // 요원 추가
  const btnAddStudent = document.getElementById('btn-add-student');
  const newStudentNameInput = document.getElementById('new-student-name');
  if (btnAddStudent && newStudentNameInput) {
    btnAddStudent.addEventListener('click', addNewStudent);
    newStudentNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addNewStudent();
    });
  }

  // 임무 추가
  const btnAddRole = document.getElementById('btn-add-role');
  const newRoleTitleInput = document.getElementById('new-role-title');
  const newRoleDescInput = document.getElementById('new-role-desc');
  if (btnAddRole && newRoleTitleInput) {
    btnAddRole.addEventListener('click', addNewRole);
    newRoleDescInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addNewRole();
    });
  }

  // 일괄 명단 등록
  const btnBatchStudents = document.getElementById('btn-batch-students');
  if (btnBatchStudents) {
    btnBatchStudents.addEventListener('click', () => {
      document.getElementById('textarea-batch-students').value = appState.students.join('\n');
      openModal('modal-batch');
    });
  }

  const btnApplyBatch = document.getElementById('btn-apply-batch');
  if (btnApplyBatch) {
    btnApplyBatch.addEventListener('click', () => {
      const raw = document.getElementById('textarea-batch-students').value;
      const names = raw.split('\n').map(s => s.trim()).filter(Boolean);
      if (names.length === 0) {
        showToast('⚠️ 최소 1명 이상의 요원 이름을 입력하세요.');
        return;
      }
      appState.students = names;
      saveCurrentState();
      renderManageLists();
      closeModal('modal-batch');
      showToast(`✅ 요원 ${names.length}명이 반영되었습니다.`);
    });
  }

  const btnCancelBatch = document.getElementById('btn-cancel-batch');
  if (btnCancelBatch) btnCancelBatch.addEventListener('click', () => closeModal('modal-batch'));

  const btnCloseBatch = document.getElementById('btn-close-batch');
  if (btnCloseBatch) btnCloseBatch.addEventListener('click', () => closeModal('modal-batch'));

  // 추천 마블 세트 복원
  const btnBatchRoles = document.getElementById('btn-batch-roles');
  if (btnBatchRoles) {
    btnBatchRoles.addEventListener('click', () => {
      if (confirm('마블 추천 12개 히어로 임무 세트로 복원하시겠습니까?')) {
        appState.roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
        saveCurrentState();
        renderManageLists();
        showToast('✨ 마블 12개 히어로 임무가 복원되었습니다.');
      }
    });
  }

  // 작전명령 복사
  const btnCopyResult = document.getElementById('btn-copy-result');
  if (btnCopyResult) btnCopyResult.addEventListener('click', copyResultsToClipboard);

  // 기본값 복원
  const btnResetDefault = document.getElementById('btn-reset-default');
  if (btnResetDefault) {
    btnResetDefault.addEventListener('click', () => {
      if (confirm('요원 12명과 마블 히어로 임무 12개의 기본값으로 초기화하시겠습니까?')) {
        appState.students = [...DEFAULT_STUDENTS];
        appState.roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
        appState.assignments = [];
        saveCurrentState();
        renderAssignmentsGrid();
        updateSummaryUI();
        showToast('🔄 마블 히어로 기본 데이터로 복원되었습니다.');
      }
    });
  }

  // 검색
  const inputSearch = document.getElementById('input-search');
  const btnClearSearch = document.getElementById('btn-clear-search');
  if (inputSearch) {
    inputSearch.addEventListener('input', (e) => {
      const val = e.target.value;
      if (btnClearSearch) btnClearSearch.style.display = val ? 'block' : 'none';
      renderAssignmentsGrid(val);
    });
  }

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      inputSearch.value = '';
      btnClearSearch.style.display = 'none';
      renderAssignmentsGrid('');
      inputSearch.focus();
    });
  }

  // 시트 설정
  const btnCloseSheetConfig = document.getElementById('btn-close-sheet-config');
  if (btnCloseSheetConfig) btnCloseSheetConfig.addEventListener('click', () => closeModal('modal-sheet-config'));

  const btnSaveSheetUrl = document.getElementById('btn-save-sheet-url');
  if (btnSaveSheetUrl) {
    btnSaveSheetUrl.addEventListener('click', () => {
      const url = document.getElementById('input-sheet-url').value.trim();
      appState.sheetUrl = url;
      saveCurrentState();
      updateSheetStatusDisplay();
      closeModal('modal-sheet-config');
      showToast('💾 스프레드시트 본부 URL이 저장되었습니다.');
    });
  }

  const btnTestSheetConn = document.getElementById('btn-test-sheet-conn');
  if (btnTestSheetConn) {
    btnTestSheetConn.addEventListener('click', async () => {
      const url = document.getElementById('input-sheet-url').value.trim();
      if (!url) {
        showToast('⚠️ 테스트할 URL을 입력하세요.');
        return;
      }
      showToast('📡 본부 연결 신호 송출 중...');
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.success) {
          showToast('✅ 연결 성공! Apps Script 본부와 정상 동기화되었습니다.');
        } else {
          showToast('⚠️ 연결 성공했으나 반환 형식을 점검해 주세요.');
        }
      } catch (err) {
        showToast('⚠️ 신호 연결 실패: URL과 "모든 사용자" 권한을 점검하세요.');
      }
    });
  }

  const btnCopyCode = document.getElementById('btn-copy-code');
  if (btnCopyCode) {
    btnCopyCode.addEventListener('click', () => {
      const code = document.getElementById('apps-script-code').innerText;
      navigator.clipboard.writeText(code).then(() => {
        showToast('📋 Apps Script 코드가 복사되었습니다.');
      });
    });
  }

  // 모달 배경 클릭 닫기
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.style.display = 'none';
    });
  });
});

function updateSheetStatusDisplay() {
  const dot = document.getElementById('sheet-status-dot');
  const text = document.getElementById('sheet-status-text');
  if (appState.sheetUrl) {
    dot.className = 'status-indicator-dot connected';
    text.textContent = `연동 활성화: ${appState.sheetUrl.substring(0, 38)}...`;
  } else {
    dot.className = 'status-indicator-dot';
    text.textContent = '현재 상태: 등록된 URL 없음 (브라우저 로컬 저장소 모드)';
  }
}
