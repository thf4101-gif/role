/**
 * @license
 * 학급 1인 1역할 배정 도우미 - script.js
 * GitHub Pages 호스팅을 위해 순수 JavaScript(ES6+)로 작성되었습니다.
 */

// ==========================================================================
// 1. 기본 예시 데이터 (학생 12명 & 역할 12개)
// ==========================================================================
const DEFAULT_STUDENTS = [
  '김하은', '이도현', '박서윤', '최민준',
  '정예린', '강현우', '윤지아', '송시우',
  '한수아', '임도윤', '배채원', '오서진'
];

const DEFAULT_ROLES = [
  { title: '칠판 지우미', icon: '🧼', desc: '수업 후 칠판과 분필 가루를 깨끗하게 정리해요' },
  { title: '우유 도우미', icon: '🥛', desc: '급식실에서 우유 상자를 챙겨와 친구들에게 나눠줘요' },
  { title: '에너지 지킴이', icon: '💡', desc: '쉬는 시간과 이동 수업 때 빈 교실 불과 모니터를 꺼요' },
  { title: '도서 정리함', icon: '📚', desc: '학급 문고 책꽂이를 반듯하고 단정하게 정돈해요' },
  { title: '줄서기 반장', icon: '🚶', desc: '특별실 이동이나 급식 줄을 설 때 바르게 앞장서요' },
  { title: '식사 예절 지킴이', icon: '🍱', desc: '점심시간 손 씻기와 조용하고 바른 식사를 도와요' },
  { title: '창문 환기 대장', icon: '🪟', desc: '아침 자습 전과 점심시간 후 맑은 공기로 환기해요' },
  { title: '분리수거 박사', icon: '♻️', desc: '종이와 플라스틱 등 분리배출 통을 바르게 지켜요' },
  { title: '알림장 배부 요정', icon: '📄', desc: '선생님 가정통신문과 학습지를 친구들에게 배부해요' },
  { title: '방역/위생 지킴이', icon: '🧴', desc: '손소독제를 채워두고 교실 구석구석 청결을 살펴요' },
  { title: '식물 사랑이', icon: '🌱', desc: '교실 화분에 잊지 않고 물을 주며 쑥쑥 자라게 도와요' },
  { title: '칭찬 배달부', icon: '💌', desc: '친구들의 고마운 마음과 칭찬 쪽지를 모아 전해줘요' }
];

// 파스텔 카드 테마 색상 (12가지 부드러운 톤)
const PASTEL_PALETTES = [
  { border: '#ffeaa7', bgLight: '#fffcf0', iconBg: '#fff3cd', accent: '#f39c12' },
  { border: '#c7ecee', bgLight: '#f4fbff', iconBg: '#dff9fb', accent: '#0abde3' },
  { border: '#e8daef', bgLight: '#faf5fc', iconBg: '#f3e5f5', accent: '#9b59b6' },
  { border: '#ffcccc', bgLight: '#fff5f5', iconBg: '#ffebee', accent: '#e74c3c' },
  { border: '#d4edda', bgLight: '#f3fbf5', iconBg: '#e8f8f0', accent: '#27ae60' },
  { border: '#fed330', bgLight: '#fffdf0', iconBg: '#fef5d1', accent: '#f1c40f' },
  { border: '#d1ecf1', bgLight: '#f0f9fb', iconBg: '#e1f5fe', accent: '#2980b9' },
  { border: '#fce4ec', bgLight: '#fff2f6', iconBg: '#f8bbd0', accent: '#e91e63' },
  { border: '#ffecd2', bgLight: '#fff9f4', iconBg: '#ffe0b2', accent: '#e67e22' },
  { border: '#e2f0cb', bgLight: '#f7fbf0', iconBg: '#dcedc8', accent: '#689f38' },
  { border: '#dcdde1', bgLight: '#f8f9fa', iconBg: '#f1f2f6', accent: '#718093' },
  { border: '#dff9fb', bgLight: '#f1fcff', iconBg: '#b2bec3', accent: '#575fcf' }
];

// ==========================================================================
// 2. 상태 관리 (State)
// ==========================================================================
const STORAGE_KEY = 'class_roles_app_data_v1';

let appState = {
  students: [...DEFAULT_STUDENTS],
  roles: JSON.parse(JSON.stringify(DEFAULT_ROLES)),
  assignments: [], // [{ id, studentName, roleTitle, roleIcon, roleDesc, checked: false }]
  sheetUrl: '',
  printSettings: {
    title: '🌟 우리 반 1인 1역할 배정표 🌟',
    className: '3학년 2반',
    date: '2026년 1학기',
    slogan: '"책임감을 가지고 서로 돕는 행복한 우리 교실!"',
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
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // 오디오 미지원 환경 무시
    }
  }

  playFanfare() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [440, 554, 659, 880];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playPop(freq, 0.18);
        }, idx * 110);
      });
    } catch (e) {}
  }
}

const sound = new SoundFX();

// 경량 캔버스 콘페티 (외부 라이브러리 없이 자체 구현)
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
    const colors = ['#ff7675', '#74b9ff', '#55efc4', '#ffeaa7', '#a29bfe', '#fd79a8'];
    this.particles = [];
    for (let i = 0; i < 90; i++) {
      this.particles.push({
        x: window.innerWidth * (0.2 + Math.random() * 0.6),
        y: window.innerHeight * 0.4,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.9) * 14,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
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
      p.vy += 0.35; // 중력
      p.vx *= 0.98; // 공기 저항
      p.rotation += p.vRot;
      p.opacity -= 0.008;

      if (p.opacity > 0 && p.y < this.canvas.height + 50) {
        alive++;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = Math.max(0, p.opacity);
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
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
// 4. 로컬 스토리지 동기화
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
    console.warn('저장된 데이터를 불러오는 중 오류가 발생하여 기본값을 사용합니다.', err);
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
// 5. 핵심 알고리즘: Fisher-Yates 셔플 & 1:1 역할 배정
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
    showToast('⚠️ 학생 명단이 비어 있습니다. [명단 관리]에서 학생을 추가해 주세요.');
    return;
  }
  if (appState.roles.length === 0) {
    showToast('⚠️ 배정할 역할이 없습니다. [역할 관리]에서 역할을 추가해 주세요.');
    return;
  }

  // 셔플 애니메이션 시작
  const emptyState = document.getElementById('empty-state');
  const shufflingState = document.getElementById('shuffling-state');
  const cardsGrid = document.getElementById('cards-grid');
  const diceIcon = document.getElementById('dice-icon');

  emptyState.style.display = 'none';
  cardsGrid.style.display = 'none';
  shufflingState.style.display = 'flex';

  if (diceIcon) {
    diceIcon.style.transform = 'rotate(720deg) scale(1.3)';
  }

  // 틱톡 셔플 소리
  for (let i = 0; i < 5; i++) {
    setTimeout(() => sound.playPop(300 + i * 80, 0.05), i * 120);
  }

  setTimeout(() => {
    // 공정한 무작위 셔플: 역할을 무작위로 섞음
    const shuffledRoles = shuffleArray(appState.roles);
    const newAssignments = [];

    // 학생 수와 역할 수가 다를 경우를 유연하게 처리
    const totalCount = appState.students.length;
    for (let i = 0; i < totalCount; i++) {
      const studentName = appState.students[i];
      // 역할 수가 부족하면 순환 배정, 충분하면 1:1 매칭
      const role = shuffledRoles[i % shuffledRoles.length];

      newAssignments.push({
        id: i + 1,
        studentName: studentName,
        roleTitle: role.title,
        roleIcon: role.icon || '⭐',
        roleDesc: role.desc || '우리 반을 위해 소중한 역할을 맡았어요.',
        checked: false
      });
    }

    appState.assignments = newAssignments;
    saveCurrentState();

    // 셔플 완료 UI 표시
    shufflingState.style.display = 'none';
    renderAssignmentsGrid();
    cardsGrid.style.display = 'grid';

    if (diceIcon) {
      diceIcon.style.transform = 'none';
    }

    // 축하 팡파레 & 콘페티
    sound.playFanfare();
    if (confetti) confetti.burst();

    showToast(`🎉 1인 1역할 배정이 완료되었습니다! (총 ${newAssignments.length}명)`);
    updateSummaryUI();
  }, 750);
}

// ==========================================================================
// 6. UI 렌더링 함수들
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
    // 검색 필터 적용
    if (filterLower) {
      const matchName = item.studentName.toLowerCase().includes(filterLower);
      const matchRole = item.roleTitle.toLowerCase().includes(filterLower);
      const matchDesc = item.roleDesc.toLowerCase().includes(filterLower);
      if (!matchName && !matchRole && !matchDesc) {
        return;
      }
    }

    matchedCount++;
    const palette = PASTEL_PALETTES[index % PASTEL_PALETTES.length];

    const card = document.createElement('div');
    card.className = 'role-card';
    card.style.setProperty('--card-border-color', palette.border);
    card.style.setProperty('--card-bg-light', palette.bgLight);
    card.style.setProperty('--card-icon-bg', palette.iconBg);
    card.style.setProperty('--card-accent-color', palette.accent);

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
          ⇄ 교환
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  // 미션 체크박스 이벤트 연결
  container.querySelectorAll('.chk-mission').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      if (appState.assignments[idx]) {
        appState.assignments[idx].checked = e.target.checked;
        saveCurrentState();
        if (e.target.checked) {
          sound.playPop(780, 0.08);
          showToast(`👏 ${appState.assignments[idx].studentName} 학생, 오늘 역할 실천 완료!`);
        }
      }
    });
  });

  // 역할 맞교환 버튼 이벤트 연결
  container.querySelectorAll('[data-action="swap"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.index, 10);
      handleRoleSwapPrompt(idx);
    });
  });

  document.getElementById('assigned-count').textContent = matchedCount;
}

// 개별 학생 역할 맞교환 헬퍼
function handleRoleSwapPrompt(sourceIdx) {
  const current = appState.assignments[sourceIdx];
  const otherStudents = appState.assignments
    .map((a, i) => `${i + 1}. ${a.studentName} (${a.roleTitle})`)
    .filter((_, i) => i !== sourceIdx);

  const input = prompt(
    `[${current.studentName}] 친구의 역할(${current.roleTitle})과 바꿀 친구의 번호(1~${appState.assignments.length})를 입력해 주세요:\n\n` +
    otherStudents.join('\n')
  );

  if (!input) return;
  const targetNo = parseInt(input.trim(), 10);
  const targetIdx = targetNo - 1;

  if (isNaN(targetIdx) || targetIdx < 0 || targetIdx >= appState.assignments.length || targetIdx === sourceIdx) {
    showToast('⚠️ 올바른 친구 번호를 입력해 주세요.');
    return;
  }

  const target = appState.assignments[targetIdx];
  // 역할 맞교환
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
  sound.playPop(640, 0.1);
  showToast(`✨ [${current.studentName}]와 [${target.studentName}]의 역할이 서로 교환되었습니다.`);
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
    statusText.textContent = '명단 또는 역할 부족';
    if (balanceAlert) {
      balanceAlert.className = 'balance-bad';
      balanceAlert.textContent = '학생 명단과 역할을 입력해 주세요.';
    }
  } else if (stuCount === roleCount) {
    chipStatus.className = 'chip chip-status';
    statusText.textContent = `배정 준비 완료 (${stuCount} : ${roleCount})`;
    if (balanceAlert) {
      balanceAlert.className = 'balance-good';
      balanceAlert.textContent = `학생 수와 역할 수가 완벽히 일치합니다 (${stuCount}명 : ${roleCount}개)`;
    }
  } else {
    chipStatus.className = 'chip chip-status warning';
    statusText.textContent = `인원수 불일치 (${stuCount}명 / ${roleCount}개)`;
    if (balanceAlert) {
      balanceAlert.className = 'balance-bad';
      balanceAlert.textContent = `주의: 학생(${stuCount}명)과 역할(${roleCount}개) 수가 다릅니다. (순환 배정됨)`;
    }
  }

  // 인쇄 헤더 업데이트
  document.getElementById('print-view-title').textContent = appState.printSettings.title;
  document.getElementById('print-view-class').textContent = appState.printSettings.className;
  document.getElementById('print-view-date').textContent = appState.printSettings.date;
  document.getElementById('print-view-slogan').textContent = appState.printSettings.slogan;
}

// ==========================================================================
// 7. 학생 & 역할 관리 모달 로직
// ==========================================================================
function renderManageLists() {
  const studentsContainer = document.getElementById('students-list-view');
  const rolesContainer = document.getElementById('roles-list-view');

  // 학생 명단 렌더링
  studentsContainer.innerHTML = '';
  appState.students.forEach((name, idx) => {
    const row = document.createElement('div');
    row.className = 'manage-item-row';
    row.innerHTML = `
      <div class="manage-item-left">
        <span class="manage-item-badge">${idx + 1}</span>
        <span class="manage-item-name">${escapeHtml(name)}</span>
      </div>
      <button class="btn-remove-item" data-type="student" data-index="${idx}" title="삭제">&times;</button>
    `;
    studentsContainer.appendChild(row);
  });

  // 역할 목록 렌더링
  rolesContainer.innerHTML = '';
  appState.roles.forEach((r, idx) => {
    const row = document.createElement('div');
    row.className = 'manage-item-row';
    row.innerHTML = `
      <div class="manage-item-left">
        <span class="manage-item-badge">${idx + 1}</span>
        <span style="font-size: 1.2rem; margin-right: 4px;">${r.icon || '⭐'}</span>
        <strong>${escapeHtml(r.title)}</strong>
        <span style="font-size: 0.8rem; color: #64748b; margin-left: 6px;">${escapeHtml(r.desc || '')}</span>
      </div>
      <button class="btn-remove-item" data-type="role" data-index="${idx}" title="삭제">&times;</button>
    `;
    rolesContainer.appendChild(row);
  });

  // 개별 삭제 버튼 이벤트
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
  sound.playPop(500, 0.05);
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

  const icon = iconInput.value.trim() || '⭐';
  const desc = descInput.value.trim() || '우리 반을 위해 소중한 역할을 맡았어요.';

  appState.roles.push({ title, icon, desc });
  titleInput.value = '';
  descInput.value = '';
  saveCurrentState();
  renderManageLists();
  updateSummaryUI();
  sound.playPop(520, 0.05);
  titleInput.focus();
}

// ==========================================================================
// 8. 구글 스프레드시트 (Apps Script) 연동 기능
// ==========================================================================
async function handleSheetLoad() {
  if (!appState.sheetUrl) {
    openModal('modal-sheet-config');
    showToast('💡 구글 Apps Script 웹 앱 URL을 먼저 설정해 주세요.');
    return;
  }

  showToast('🔄 스프레드시트에서 데이터를 불러오는 중...');
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
      showToast(`✅ 시트에서 학생 ${appState.students.length}명, 역할 ${appState.roles.length}개를 불러왔습니다!`);
    } else {
      throw new Error(data.message || '응답 데이터 형식 오류');
    }
  } catch (err) {
    console.warn('Apps Script GET 통신 오류 또는 CORS 제약:', err);
    // 모의 데모 피드백 제공
    showToast(`⚠️ 시트 연결 중 응답 오류 (${err.message}). Web App의 배포 권한이 '모든 사용자'인지 확인해 주세요.`);
  }
}

async function handleSheetSave() {
  if (!appState.assignments || appState.assignments.length === 0) {
    showToast('⚠️ 먼저 [🎲 역할 배정하기]를 눌러 배정을 완료해 주세요!');
    return;
  }

  if (!appState.sheetUrl) {
    openModal('modal-sheet-config');
    showToast('💡 결과를 저장할 구글 Apps Script 웹 앱 URL을 먼저 등록해 주세요.');
    return;
  }

  showToast('💾 스프레드시트에 저장하는 중...');
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
      sound.playPop(750, 0.1);
      showToast('✅ 구글 스프레드시트 [배정결과] 시트에 저장이 완료되었습니다!');
    } else {
      showToast('✅ 저장을 전송했습니다. (스프레드시트를 새로고침하여 확인하세요)');
    }
  } catch (err) {
    console.warn('Apps Script POST 에러 (CORS 리다이렉트 발생 시도):', err);
    // Apps Script는 POST 시 302 리다이렉트를 반환할 수 있으므로 no-cors 모드로 재시도 시 안전하게 저장됨
    try {
      await fetch(appState.sheetUrl, {
        method: 'POST',
        body: JSON.stringify({ assignments: appState.assignments }),
        mode: 'no-cors'
      });
      showToast('✅ 구글 스프레드시트에 배정 결과가 저장 요청되었습니다!');
    } catch (e2) {
      showToast('⚠️ 저장 요청 실패: URL과 권한 설정을 다시 확인해 주세요.');
    }
  }
}

// ==========================================================================
// 9. 교실 게시판 부착용 A4 인쇄 기능
// ==========================================================================
function prepareAndExecutePrint() {
  // 인쇄 전용 메타 정보 반영
  appState.printSettings.title = document.getElementById('input-print-title').value.trim() || '우리 반 1인 1역할 배정표';
  appState.printSettings.className = document.getElementById('input-print-class').value.trim() || '우리 반';
  appState.printSettings.date = document.getElementById('input-print-date').value.trim() || '2026학년도';
  appState.printSettings.slogan = document.getElementById('input-print-slogan').value.trim() || '';

  const selectedLayout = document.querySelector('input[name="print-layout"]:checked');
  appState.printSettings.layout = selectedLayout ? selectedLayout.value : 'card';

  saveCurrentState();
  updateSummaryUI();

  // 테이블 레이아웃 클래스 토글
  const grid = document.getElementById('cards-grid');
  if (appState.printSettings.layout === 'table') {
    grid.classList.add('print-as-table');
  } else {
    grid.classList.remove('print-as-table');
  }

  // 모달 닫기
  closeModal('modal-print-setup');

  // 배정 결과가 없는 상태에서 인쇄할 경우 안내
  if (!appState.assignments || appState.assignments.length === 0) {
    showToast('⚠️ 배정 결과가 없어 빈 양식으로 인쇄됩니다. 필요 시 먼저 배정하기를 실행하세요.');
  }

  // 브라우저 기본 인쇄 다이얼로그 호출
  setTimeout(() => {
    window.print();
  }, 200);
}

// ==========================================================================
// 10. 결과 텍스트 복사 (알림장, 메신저용)
// ==========================================================================
function copyResultsToClipboard() {
  if (!appState.assignments || appState.assignments.length === 0) {
    showToast('⚠️ 복사할 배정 결과가 없습니다. 먼저 배정하기를 눌러주세요.');
    return;
  }

  const lines = [
    `🌟 [${appState.printSettings.className}] 1인 1역할 배정 결과 🌟`,
    `일자: ${appState.printSettings.date}`,
    '---------------------------------'
  ];

  appState.assignments.forEach(item => {
    lines.push(`${item.id}번 ${item.studentName} : ${item.roleIcon} ${item.roleTitle} - ${item.roleDesc}`);
  });

  lines.push('---------------------------------');
  lines.push('모두 맡은 역할을 성실히 실천해 보아요! 👏');

  const fullText = lines.join('\n');
  navigator.clipboard.writeText(fullText).then(() => {
    sound.playPop(620, 0.08);
    showToast('📋 배정 결과가 클립보드에 복사되었습니다! (알림장이나 메신저에 붙여넣기)');
  }).catch(() => {
    // 구형 브라우저 대체
    const t = document.createElement('textarea');
    t.value = fullText;
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
    showToast('📋 배정 결과가 클립보드에 복사되었습니다!');
  });
}

// ==========================================================================
// 11. 모달 및 팝업 헬퍼 함수
// ==========================================================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
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
// 12. DOM 로드 완료 및 이벤트 리스너 바인딩
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 콘페티 초기화
  confetti = new ConfettiEffect('confetti-canvas');

  // 로컬 저장소 상태 로드
  loadSavedState();

  // 초기 UI 렌더링
  updateSummaryUI();
  if (appState.assignments && appState.assignments.length > 0) {
    renderAssignmentsGrid();
  }

  // 핵심 버튼: [🎲 역할 배정하기]
  const btnAssign = document.getElementById('btn-assign');
  if (btnAssign) {
    btnAssign.addEventListener('click', performAssignment);
  }

  // 상단 시트 연동 버튼들
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

  // A4 게시판 인쇄 버튼
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

  // 인쇄 실행 버튼
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

  // 관리 모달 내 탭 전환
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

  // 학생 추가 버튼 & 엔터 키
  const btnAddStudent = document.getElementById('btn-add-student');
  const newStudentNameInput = document.getElementById('new-student-name');
  if (btnAddStudent && newStudentNameInput) {
    btnAddStudent.addEventListener('click', addNewStudent);
    newStudentNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addNewStudent();
    });
  }

  // 역할 추가 버튼 & 엔터 키
  const btnAddRole = document.getElementById('btn-add-role');
  const newRoleTitleInput = document.getElementById('new-role-title');
  const newRoleDescInput = document.getElementById('new-role-desc');
  if (btnAddRole && newRoleTitleInput) {
    btnAddRole.addEventListener('click', addNewRole);
    newRoleDescInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addNewRole();
    });
  }

  // 일괄 입력 모달
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
        showToast('⚠️ 최소 1명 이상의 학생 이름을 입력해 주세요.');
        return;
      }
      appState.students = names;
      saveCurrentState();
      renderManageLists();
      closeModal('modal-batch');
      showToast(`✅ 학생 ${names.length}명이 반영되었습니다.`);
    });
  }

  const btnCancelBatch = document.getElementById('btn-cancel-batch');
  if (btnCancelBatch) btnCancelBatch.addEventListener('click', () => closeModal('modal-batch'));

  const btnCloseBatch = document.getElementById('btn-close-batch');
  if (btnCloseBatch) btnCloseBatch.addEventListener('click', () => closeModal('modal-batch'));

  // 추천 역할 세트 불러오기 버튼
  const btnBatchRoles = document.getElementById('btn-batch-roles');
  if (btnBatchRoles) {
    btnBatchRoles.addEventListener('click', () => {
      if (confirm('기본 추천 12개 역할 세트로 교체하시겠습니까?')) {
        appState.roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
        saveCurrentState();
        renderManageLists();
        showToast('✨ 추천 12개 역할 세트가 적용되었습니다.');
      }
    });
  }

  // 결과 복사 버튼
  const btnCopyResult = document.getElementById('btn-copy-result');
  if (btnCopyResult) btnCopyResult.addEventListener('click', copyResultsToClipboard);

  // 기본값 복원 버튼
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
        showToast('🔄 기본 12명 예시 데이터로 복원되었습니다.');
      }
    });
  }

  // 검색 인풋 핸들러
  const inputSearch = document.getElementById('input-search');
  const btnClearSearch = document.getElementById('btn-clear-search');
  if (inputSearch) {
    inputSearch.addEventListener('input', (e) => {
      const val = e.target.value;
      if (btnClearSearch) {
        btnClearSearch.style.display = val ? 'block' : 'none';
      }
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

  // 시트 설정 모달 내 제어
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
      showToast('💾 스프레드시트 Web App URL이 저장되었습니다.');
    });
  }

  const btnTestSheetConn = document.getElementById('btn-test-sheet-conn');
  if (btnTestSheetConn) {
    btnTestSheetConn.addEventListener('click', async () => {
      const url = document.getElementById('input-sheet-url').value.trim();
      if (!url) {
        showToast('⚠️ 테스트할 URL을 입력해 주세요.');
        return;
      }
      showToast('📡 테스트 요청 전송 중...');
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.success) {
          showToast('✅ 연결 성공! Apps Script가 정상 응답했습니다.');
        } else {
          showToast('⚠️ 연결되었으나 응답 형식을 확인해 주세요.');
        }
      } catch (err) {
        showToast('⚠️ 요청 실패. Apps Script URL과 "모든 사용자" 접근 권한을 확인하세요.');
      }
    });
  }

  const btnCopyCode = document.getElementById('btn-copy-code');
  if (btnCopyCode) {
    btnCopyCode.addEventListener('click', () => {
      const code = document.getElementById('apps-script-code').innerText;
      navigator.clipboard.writeText(code).then(() => {
        showToast('📋 Apps Script 예제 코드가 복사되었습니다.');
      });
    });
  }

  // 모달 바깥 배경 클릭 시 닫기
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.style.display = 'none';
      }
    });
  });
});

function updateSheetStatusDisplay() {
  const dot = document.getElementById('sheet-status-dot');
  const text = document.getElementById('sheet-status-text');
  if (appState.sheetUrl) {
    dot.className = 'status-indicator-dot connected';
    text.textContent = `설정 완료: ${appState.sheetUrl.substring(0, 38)}...`;
  } else {
    dot.className = 'status-indicator-dot';
    text.textContent = '현재 상태: 설정된 URL 없음 (브라우저 로컬 저장소 모드로 작동 중)';
  }
}
