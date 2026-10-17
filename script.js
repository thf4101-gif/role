/**
 * @license
 * 학급 1인 1역할 배정 도우미 - script.js
 * Apple Human Interface Design 적용 (순수 JavaScript ES6+)
 */

// ==========================================================================
// 1. 기본 예시 데이터: 학생 12명 & 학급 역할 12개
// ==========================================================================
const DEFAULT_STUDENTS = [
  '김하은', '이도현', '박서윤', '최민준',
  '정예린', '강현우', '윤지아', '송시우',
  '한수아', '임도윤', '배채원', '오서진'
];

const DEFAULT_ROLES = [
  { title: '칠판 지우미', icon: '🧼', desc: '수업 후 칠판과 교탁을 단정하고 깨끗하게 정리해요' },
  { title: '우유 도우미', icon: '🥛', desc: '급식실에서 우유 상자를 챙겨와 친구들에게 나눠줘요' },
  { title: '에너지 지킴이', icon: '💡', desc: '쉬는 시간과 이동 수업 때 빈 교실 불과 모니터를 꺼요' },
  { title: '도서 정리함', icon: '📚', desc: '학급 문고 책꽂이를 반듯하고 단정하게 정돈해요' },
  { title: '줄서기 반장', icon: '🚶', desc: '특별실 이동이나 급식 줄을 설 때 바르게 앞장서요' },
  { title: '식사 예절 지킴이', icon: '🍱', desc: '점심시간 손 씻기와 질서 있는 식사 태도를 도와요' },
  { title: '창문 환기 대장', icon: '🪟', desc: '아침 자습 전과 점심시간 후 맑은 공기로 환기해요' },
  { title: '분리수거 박사', icon: '♻️', desc: '종이와 플라스틱 등 분리배출함을 바르게 관리해요' },
  { title: '알림장 배부 요정', icon: '📄', desc: '선생님 가정통신문과 학습지를 친구들에게 배부해요' },
  { title: '방역/위생 지킴이', icon: '🧴', desc: '손소독제를 채워두고 교실 구석구석 청결을 살펴요' },
  { title: '식물 사랑이', icon: '🌱', desc: '교실 화분에 잊지 않고 물을 주며 정성껏 보살펴요' },
  { title: '칭찬 배달부', icon: '💌', desc: '친구들의 고마운 마음과 칭찬 쪽지를 모아 전해줘요' }
];

// Apple 시스템 틴트 그라디언트 웰 (12종)
const APPLE_ICON_GRADIENTS = [
  'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
  'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
  'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
  'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)',
  'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
  'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)',
  'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
  'linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)',
  'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
  'linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 100%)',
  'linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)'
];

// ==========================================================================
// 2. 상태 관리 (State)
// ==========================================================================
const STORAGE_KEY = 'apple_class_roles_app_v3';

let appState = {
  students: [...DEFAULT_STUDENTS],
  roles: JSON.parse(JSON.stringify(DEFAULT_ROLES)),
  assignments: [], // [{ id, studentName, roleTitle, roleIcon, roleDesc, checked: false }]
  sheetUrl: '',
  printSettings: {
    title: '우리 반 1인 1역할 안내표',
    className: '3학년 2반',
    date: '2026학년도 1학기',
    slogan: '"책임감을 가지고 서로 도우며 함께 성장하는 교실"',
    layout: 'card' // 'card' | 'table'
  }
};

// ==========================================================================
// 3. Apple 감성의 은은한 사운드 & 미니멀 콘페티
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

  playGlassPop(freq = 600, duration = 0.07) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playGentleChime() {
    try {
      this.init();
      if (!this.ctx) return;
      // Apple 알림음 스타일 벨코드 (Db, F, Ab, C)
      const notes = [554.37, 698.46, 830.61, 1046.5];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playGlassPop(freq, 0.28);
        }, idx * 95);
      });
    } catch (e) {}
  }
}

const sound = new SoundFX();

// Apple 미니멀 소프트 콘페티
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
    const colors = ['#0071e3', '#34c759', '#ff9500', '#af52de', '#ff2d55', '#5856d6'];
    this.particles = [];
    for (let i = 0; i < 80; i++) {
      this.particles.push({
        x: window.innerWidth * (0.25 + Math.random() * 0.5),
        y: window.innerHeight * 0.45,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.9) * 13,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 8,
        opacity: 0.95
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
      p.vy += 0.35;
      p.vx *= 0.98;
      p.rotation += p.vRot;
      p.opacity -= 0.009;

      if (p.opacity > 0 && p.y < this.canvas.height + 40) {
        alive++;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
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
// 5. 핵심 알고리즘: Fisher-Yates 무작위 셔플 & 1:1 매칭
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
    showToast('⚠️ 학생 명단이 비어 있습니다. [명단 편집]에서 학생을 추가해 주세요.');
    return;
  }
  if (appState.roles.length === 0) {
    showToast('⚠️ 배정할 역할이 없습니다. [역할 편집]에서 역할을 추가해 주세요.');
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
    diceIcon.style.transform = 'rotate(360deg)';
  }

  // 글래스 틱 사운드
  for (let i = 0; i < 4; i++) {
    setTimeout(() => sound.playGlassPop(500 + i * 80, 0.05), i * 130);
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
        roleIcon: role.icon || '✨',
        roleDesc: role.desc || '우리 반을 위해 소중한 역할을 맡았어요.',
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

    // 성공 차임 & 콘페티
    sound.playGentleChime();
    if (confetti) confetti.burst();

    showToast(`역할 배정이 완료되었습니다. (총 ${newAssignments.length}명)`);
    updateSummaryUI();
  }, 650);
}

// ==========================================================================
// 6. UI 렌더링 함수들 (Apple Card UI)
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
    const iconGrad = APPLE_ICON_GRADIENTS[index % APPLE_ICON_GRADIENTS.length];

    const card = document.createElement('div');
    card.className = 'role-card';
    card.style.setProperty('--card-icon-gradient', iconGrad);

    card.innerHTML = `
      <div class="card-header">
        <div class="student-badge">
          <span class="student-no">${item.id}</span>
          <span class="student-name">${escapeHtml(item.studentName)}</span>
        </div>
        <span class="role-tag-pill">1인 1역할</span>
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
        <label class="mission-checkbox" title="오늘의 역할 실천 여부를 체크합니다">
          <input type="checkbox" ${item.checked ? 'checked' : ''} data-index="${index}" class="chk-mission" />
          <span>오늘의 실천</span>
        </label>
        <button class="btn-card-action no-print" data-action="swap" data-index="${index}" title="다른 친구와 역할을 맞바꿉니다">
          역할 맞바꾸기
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
          sound.playGlassPop(750, 0.08);
          showToast(`${appState.assignments[idx].studentName} 학생, 오늘 역할 실천 완료`);
        }
      }
    });
  });

  // 역할 맞교환 이벤트
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
    .map((a, i) => `${i + 1}번. ${a.studentName} (${a.roleTitle})`)
    .filter((_, i) => i !== sourceIdx);

  const input = prompt(
    `[${current.studentName}] 친구의 역할(${current.roleTitle})과 맞바꿀 학생 번호(1~${appState.assignments.length})를 입력해 주세요:\n\n` +
    otherStudents.join('\n')
  );

  if (!input) return;
  const targetNo = parseInt(input.trim(), 10);
  const targetIdx = targetNo - 1;

  if (isNaN(targetIdx) || targetIdx < 0 || targetIdx >= appState.assignments.length || targetIdx === sourceIdx) {
    showToast('⚠️ 올바른 학생 번호를 입력해 주세요.');
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
  sound.playGlassPop(620, 0.09);
  showToast(`[${current.studentName}]와 [${target.studentName}]의 역할이 교환되었습니다.`);
}

function updateSummaryUI() {
  const stuCount = appState.students.length;
  const roleCount = appState.roles.length;

  document.getElementById('student-count-num').textContent = stuCount;
  document.getElementById('role-count-num').textContent = roleCount;
  document.getElementById('total-count-display').textContent = stuCount;
  document.getElementById('modal-student-count').textContent = stuCount;
  document.getElementById('modal-role-count').textContent = roleCount;

  const chipStatus = document.getElementById('chip-match-status');
  const statusText = document.getElementById('status-text');
  const balanceAlert = document.getElementById('manage-balance-alert');

  if (stuCount === 0 || roleCount === 0) {
    chipStatus.className = 'status-segment status-indicator warning';
    statusText.textContent = '명단 부족';
    if (balanceAlert) {
      balanceAlert.className = 'balance-bad';
      balanceAlert.textContent = '학생 명단과 역할을 입력해 주세요.';
    }
  } else if (stuCount === roleCount) {
    chipStatus.className = 'status-segment status-indicator';
    statusText.textContent = `배정 준비 완료 (${stuCount}:${roleCount})`;
    if (balanceAlert) {
      balanceAlert.className = 'balance-good';
      balanceAlert.textContent = `학생 수와 역할 수가 완벽히 일치합니다 (${stuCount}명 : ${roleCount}개)`;
    }
  } else {
    chipStatus.className = 'status-segment status-indicator warning';
    statusText.textContent = `수량 차이 (${stuCount}명 / ${roleCount}개)`;
    if (balanceAlert) {
      balanceAlert.className = 'balance-bad';
      balanceAlert.textContent = `학생(${stuCount}명)과 역할(${roleCount}개) 수가 일치하지 않습니다.`;
    }
  }

  // 인쇄 메타 갱신
  document.getElementById('print-view-title').textContent = appState.printSettings.title;
  document.getElementById('print-view-class').textContent = appState.printSettings.className;
  document.getElementById('print-view-date').textContent = appState.printSettings.date;
  document.getElementById('print-view-slogan').textContent = appState.printSettings.slogan;
}

// ==========================================================================
// 7. 학생 및 역할 관리 모달
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
        <span class="manage-item-badge">${idx + 1}</span>
        <span class="manage-item-name"><strong>${escapeHtml(name)}</strong></span>
      </div>
      <button class="btn-remove-item" data-type="student" data-index="${idx}" title="삭제">&times;</button>
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
        <span class="manage-item-badge">${idx + 1}</span>
        <span style="font-size: 1.25rem; margin-right: 4px;">${r.icon || '✨'}</span>
        <strong>${escapeHtml(r.title)}</strong>
        <span style="font-size: 0.8rem; color: #86868b; margin-left: 6px;">${escapeHtml(r.desc || '')}</span>
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
  sound.playGlassPop(540, 0.05);
  input.focus();
}

function addNewRole() {
  const iconInput = document.getElementById('new-role-icon');
  const titleInput = document.getElementById('new-role-title');
  const descInput = document.getElementById('new-role-desc');

  const title = titleInput.value.trim();
  if (!title) {
    showToast('⚠️ 역할 이름을 입력해 주세요.');
    titleInput.focus();
    return;
  }

  const icon = iconInput.value.trim() || '✨';
  const desc = descInput.value.trim() || '우리 반을 위해 소중한 역할을 맡았어요.';

  appState.roles.push({ title, icon, desc });
  titleInput.value = '';
  descInput.value = '';
  saveCurrentState();
  renderManageLists();
  updateSummaryUI();
  sound.playGlassPop(580, 0.05);
  titleInput.focus();
}

// ==========================================================================
// 8. 구글 스프레드시트 (Apps Script) 연동
// ==========================================================================
async function handleSheetLoad() {
  if (!appState.sheetUrl) {
    openModal('modal-sheet-config');
    showToast('Apps Script 웹 앱 URL을 먼저 설정해 주세요.');
    return;
  }

  showToast('스프레드시트에서 데이터를 불러오는 중...');
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
      sound.playGentleChime();
      showToast(`시트에서 학생 ${appState.students.length}명, 역할 ${appState.roles.length}개를 불러왔습니다.`);
    } else {
      throw new Error(data.message || '응답 데이터 형식 오류');
    }
  } catch (err) {
    console.warn('Apps Script 통신 오류:', err);
    showToast(`시트 연결 오류 (${err.message}). Web App 배포 권한을 점검하세요.`);
  }
}

async function handleSheetSave() {
  if (!appState.assignments || appState.assignments.length === 0) {
    showToast('먼저 [역할 배정하기]를 실행해 주세요.');
    return;
  }

  if (!appState.sheetUrl) {
    openModal('modal-sheet-config');
    showToast('저장할 Apps Script 웹 앱 URL을 먼저 등록해 주세요.');
    return;
  }

  showToast('스프레드시트에 저장하는 중...');
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
      sound.playGlassPop(800, 0.08);
      showToast('스프레드시트에 저장이 완료되었습니다.');
    } else {
      showToast('저장 요청이 전송되었습니다.');
    }
  } catch (err) {
    try {
      await fetch(appState.sheetUrl, {
        method: 'POST',
        body: JSON.stringify({ assignments: appState.assignments }),
        mode: 'no-cors'
      });
      showToast('스프레드시트에 결과 저장이 요청되었습니다.');
    } catch (e2) {
      showToast('저장 실패: URL과 권한 설정을 점검해 주세요.');
    }
  }
}

// ==========================================================================
// 9. 교실 게시판 부착용 A4 인쇄
// ==========================================================================
function prepareAndExecutePrint() {
  appState.printSettings.title = document.getElementById('input-print-title').value.trim() || '우리 반 1인 1역할 안내표';
  appState.printSettings.className = document.getElementById('input-print-class').value.trim() || '우리 반';
  appState.printSettings.date = document.getElementById('input-print-date').value.trim() || '2026학년도';
  appState.printSettings.slogan = document.getElementById('input-print-slogan').value.trim() || '';

  saveCurrentState();
  updateSummaryUI();

  closeModal('modal-print-setup');

  if (!appState.assignments || appState.assignments.length === 0) {
    showToast('배정 결과가 없어 빈 서식으로 인쇄됩니다.');
  }

  setTimeout(() => {
    window.print();
  }, 180);
}

// ==========================================================================
// 10. 결과 텍스트 복사 (알림장, 메신저용)
// ==========================================================================
function copyResultsToClipboard() {
  if (!appState.assignments || appState.assignments.length === 0) {
    showToast('복사할 배정 결과가 없습니다. 먼저 배정하기를 실행하세요.');
    return;
  }

  const lines = [
    `[${appState.printSettings.className}] 1인 1역할 배정 결과`,
    `일자: ${appState.printSettings.date}`,
    '---------------------------------'
  ];

  appState.assignments.forEach(item => {
    lines.push(`${item.id}번 ${item.studentName} : ${item.roleIcon} ${item.roleTitle} - ${item.roleDesc}`);
  });

  lines.push('---------------------------------');
  lines.push('모두 맡은 역할을 성실히 실천해 보아요!');

  const fullText = lines.join('\n');
  navigator.clipboard.writeText(fullText).then(() => {
    sound.playGlassPop(700, 0.08);
    showToast('결과가 클립보드에 복사되었습니다.');
  }).catch(() => {
    const t = document.createElement('textarea');
    t.value = fullText;
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
    showToast('결과가 클립보드에 복사되었습니다.');
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

function showToast(msg, duration = 2800) {
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
// 12. DOM 로드 완료 및 이벤트 리스너 바인딩
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

  // 시트 연동 버튼들
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

  // 인쇄 설정 모달
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

  // 명단 & 역할 관리 모달
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

  // iOS 세그먼트 컨트롤 탭 전환
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

  // 학생 추가
  const btnAddStudent = document.getElementById('btn-add-student');
  const newStudentNameInput = document.getElementById('new-student-name');
  if (btnAddStudent && newStudentNameInput) {
    btnAddStudent.addEventListener('click', addNewStudent);
    newStudentNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addNewStudent();
    });
  }

  // 역할 추가
  const btnAddRole = document.getElementById('btn-add-role');
  const newRoleTitleInput = document.getElementById('new-role-title');
  const newRoleDescInput = document.getElementById('new-role-desc');
  if (btnAddRole && newRoleTitleInput) {
    btnAddRole.addEventListener('click', addNewRole);
    newRoleDescInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addNewRole();
    });
  }

  // 일괄 입력
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
        showToast('최소 1명 이상의 학생 이름을 입력해 주세요.');
        return;
      }
      appState.students = names;
      saveCurrentState();
      renderManageLists();
      closeModal('modal-batch');
      showToast(`학생 ${names.length}명이 반영되었습니다.`);
    });
  }

  const btnCancelBatch = document.getElementById('btn-cancel-batch');
  if (btnCancelBatch) btnCancelBatch.addEventListener('click', () => closeModal('modal-batch'));

  const btnCloseBatch = document.getElementById('btn-close-batch');
  if (btnCloseBatch) btnCloseBatch.addEventListener('click', () => closeModal('modal-batch'));

  // 추천 역할 세트 복원
  const btnBatchRoles = document.getElementById('btn-batch-roles');
  if (btnBatchRoles) {
    btnBatchRoles.addEventListener('click', () => {
      if (confirm('추천 12개 기본 역할 세트로 복원하시겠습니까?')) {
        appState.roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
        saveCurrentState();
        renderManageLists();
        showToast('추천 역할 세트가 복원되었습니다.');
      }
    });
  }

  // 결과 복사
  const btnCopyResult = document.getElementById('btn-copy-result');
  if (btnCopyResult) btnCopyResult.addEventListener('click', copyResultsToClipboard);

  // 기본값 초기화
  const btnResetDefault = document.getElementById('btn-reset-default');
  if (btnResetDefault) {
    btnResetDefault.addEventListener('click', () => {
      if (confirm('학생 12명과 역할 12개의 기본값으로 초기화하시겠습니까?')) {
        appState.students = [...DEFAULT_STUDENTS];
        appState.roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
        appState.assignments = [];
        saveCurrentState();
        renderAssignmentsGrid();
        updateSummaryUI();
        showToast('기본 데이터로 초기화되었습니다.');
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

  // 시트 설정 모달
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
      showToast('스프레드시트 Web App URL이 저장되었습니다.');
    });
  }

  const btnTestSheetConn = document.getElementById('btn-test-sheet-conn');
  if (btnTestSheetConn) {
    btnTestSheetConn.addEventListener('click', async () => {
      const url = document.getElementById('input-sheet-url').value.trim();
      if (!url) {
        showToast('테스트할 URL을 입력해 주세요.');
        return;
      }
      showToast('연결 테스트 중...');
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.success) {
          showToast('연결 성공: Apps Script가 정상 응답했습니다.');
        } else {
          showToast('연결되었으나 응답 형식을 점검해 주세요.');
        }
      } catch (err) {
        showToast('연결 실패: URL 및 "모든 사용자" 권한을 점검해 주세요.');
      }
    });
  }

  const btnCopyCode = document.getElementById('btn-copy-code');
  if (btnCopyCode) {
    btnCopyCode.addEventListener('click', () => {
      const code = document.getElementById('apps-script-code').innerText;
      navigator.clipboard.writeText(code).then(() => {
        showToast('Apps Script 코드가 복사되었습니다.');
      });
    });
  }

  // 모달 배경 클릭 시 닫기
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
    dot.className = 'apple-dot';
    text.textContent = `연동 활성화: ${appState.sheetUrl.substring(0, 36)}...`;
  } else {
    dot.className = 'apple-dot';
    dot.style.background = '#86868b';
    text.textContent = '현재 상태: 설정된 URL 없음 (브라우저 로컬 저장소 모드)';
  }
}
