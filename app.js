/**
 * RUN2EARN - HIGH-TECH RUNNING WEB APPLICATION
 * Core Rule: 1 Meter = 100 VNĐ (Enhanced by shoe multipliers & buffs)
 */

(function () {
  'use strict';

  // ==========================================
  // CONFIG & STATE
  // ==========================================
  const BASE_RATE_PER_METER = 100; // 1m = 100 VNĐ

  const SHOES_CATALOG = [
    {
      id: 'shoe_basic',
      name: 'Giày Tiêu Chuẩn',
      tier: 'common',
      tierLabel: 'Cơ Bản',
      multiplier: 1.0,
      price: 0,
      icon: 'fa-shoe-prints',
      desc: 'Đôi giày thể thao cơ bản. Hệ số thu nhập 100₫ / mét.',
      owned: true
    },
    {
      id: 'shoe_nitro',
      name: 'Air Zoom Nitro',
      tier: 'rare',
      tierLabel: 'Hiếm',
      multiplier: 1.3,
      price: 25000,
      icon: 'fa-bolt',
      desc: 'Đế đệm khí nén phản lực. Tăng 30% thu nhập (130₫ / mét).',
      owned: false
    },
    {
      id: 'shoe_vapor',
      name: 'Carbon VaporFly',
      tier: 'epic',
      tierLabel: 'Sử Thi',
      multiplier: 1.6,
      price: 80000,
      icon: 'fa-meteor',
      desc: 'Đĩa carbon siêu nhẹ tăng lực đẩy. Tăng 60% thu nhập (160₫ / mét).',
      owned: false
    },
    {
      id: 'shoe_quantum',
      name: 'Cyberpunk Quantum',
      tier: 'legendary',
      tierLabel: 'Huyền Thoại',
      multiplier: 2.0,
      price: 250000,
      icon: 'fa-rocket',
      desc: 'Giày công nghệ lượng tử Cyberpunk. Nhân đôi x2 thu nhập (200₫ / mét).',
      owned: false
    },
    {
      id: 'shoe_hermes',
      name: 'Thần Tốc Hermes',
      tier: 'legendary',
      tierLabel: 'Thần Thánh',
      multiplier: 3.0,
      price: 1000000,
      icon: 'fa-crown',
      desc: 'Đôi giày có cánh của thần Hermes. Nhân ba x3 thu nhập (300₫ / mét).',
      owned: false
    }
  ];

  const BUFFS_CATALOG = [
    {
      id: 'buff_energy',
      name: 'Nước Tăng Lực RedBull',
      price: 5000,
      duration: 30, // seconds
      multiplier: 2.0,
      icon: 'fa-bolt-lightning',
      desc: 'Nhân đôi (x2) toàn bộ thu nhập chạy trong 30 giây rực cháy!'
    },
    {
      id: 'buff_magnet',
      name: 'Chip Hút Kim Tiền',
      price: 15000,
      duration: 45,
      multiplier: 1.5,
      icon: 'fa-magnet',
      desc: 'Cộng thêm +50% tiền thưởng và nhặt xu vàng liên tục trong 45 giây.'
    }
  ];

  const ACHIEVEMENTS_LIST = [
    { id: 'first_step', title: 'Bước Chân Đầu Tiên', desc: 'Chạy được 100m đầu tiên', icon: 'fa-shoe-prints' },
    { id: 'runner_1k', title: 'Chiến Binh 1KM', desc: 'Chinh phục cự ly 1.000m (1km)', icon: 'fa-medal' },
    { id: 'first_100k', title: 'Triệu Phú Nhí', desc: 'Kiếm được 100.000₫ tổng cộng', icon: 'fa-sack-dollar' },
    { id: 'speed_demon', title: 'Thần Gió Siêu Tốc', desc: 'Đạt vận tốc trên 15 km/h', icon: 'fa-gauge-high' },
    { id: 'first_cashout', title: 'Rút Tiền Về Ví', desc: 'Thực hiện lệnh rút tiền đầu tiên', icon: 'fa-money-bill-transfer' },
    { id: 'shoe_collector', title: 'Tín Đồ Sneaker', desc: 'Sở hữu ít nhất 3 đôi giày trong bộ sưu tập', icon: 'fa-box-open' }
  ];

  // Scenic Route Coordinates for Map
  const ROUTES = {
    hoan_kiem: [
      [21.0285, 105.8542],
      [21.0315, 105.8535],
      [21.0335, 105.8525],
      [21.0345, 105.8538],
      [21.0318, 105.8558],
      [21.0278, 105.8562],
      [21.0270, 105.8530],
      [21.0285, 105.8542]
    ],
    nguyen_hue: [
      [10.7745, 106.7025],
      [10.7732, 106.7038],
      [10.7718, 106.7052],
      [10.7705, 106.7065],
      [10.7718, 106.7052],
      [10.7732, 106.7038],
      [10.7745, 106.7025]
    ],
    my_khe: [
      [16.0595, 108.2465],
      [16.0545, 108.2472],
      [16.0490, 108.2480],
      [16.0430, 108.2490],
      [16.0370, 108.2505],
      [16.0430, 108.2490],
      [16.0490, 108.2480],
      [16.0545, 108.2472],
      [16.0595, 108.2465]
    ],
    free_run: [
      [21.0285, 105.8542],
      [21.0295, 105.8555]
    ]
  };

  // Main Application State
  const state = {
    isRunning: false,
    isPaused: false,
    mode: 'sim', // 'sim' or 'gps'
    soundEnabled: true,

    // Run metrics
    distanceMeters: 0,
    sessionEarnings: 0,
    elapsedSeconds: 0,
    currentSpeedKmh: 8.0, // Default sim speed
    calories: 0,
    steps: 0,
    paceMinPerKm: 0,

    // Persistence
    totalWalletVnd: 0,
    equippedShoeId: 'shoe_basic',
    ownedShoes: ['shoe_basic'],
    unlockedAchievements: [],
    runHistory: [],

    // Active Temporary Buff
    activeBuff: null,
    buffSecondsLeft: 0,

    // Timers & Loops
    simInterval: null,
    canvasAnimFrame: null,
    gpsWatchId: null,
    lastGpsPosition: null,

    // Milestones tracking
    lastMilestoneReached: 0,

    // Map instances
    leafletMap: null,
    mapRunnerMarker: null,
    mapRoutePolyline: null,
    mapTraveledPolyline: null,
    currentRouteWaypoints: [],
    currentWaypointIndex: 0,
    traveledPoints: []
  };

  // ==========================================
  // STORAGE & PERSISTENCE
  // ==========================================
  function loadPersistedData() {
    try {
      const savedWallet = localStorage.getItem('r2e_wallet');
      if (savedWallet !== null) state.totalWalletVnd = parseInt(savedWallet, 10) || 0;

      const savedShoe = localStorage.getItem('r2e_equipped_shoe');
      if (savedShoe) state.equippedShoeId = savedShoe;

      const savedOwned = localStorage.getItem('r2e_owned_shoes');
      if (savedOwned) {
        state.ownedShoes = JSON.parse(savedOwned);
      }

      const savedAch = localStorage.getItem('r2e_achievements');
      if (savedAch) state.unlockedAchievements = JSON.parse(savedAch);

      const savedHistory = localStorage.getItem('r2e_history');
      if (savedHistory) state.runHistory = JSON.parse(savedHistory);

      const savedSound = localStorage.getItem('r2e_sound');
      if (savedSound !== null) state.soundEnabled = savedSound === 'true';
    } catch (e) {
      console.warn('Could not load localStorage:', e);
    }
  }

  function savePersistedData() {
    try {
      localStorage.setItem('r2e_wallet', state.totalWalletVnd);
      localStorage.setItem('r2e_equipped_shoe', state.equippedShoeId);
      localStorage.setItem('r2e_owned_shoes', JSON.stringify(state.ownedShoes));
      localStorage.setItem('r2e_achievements', JSON.stringify(state.unlockedAchievements));
      localStorage.setItem('r2e_history', JSON.stringify(state.runHistory));
      localStorage.setItem('r2e_sound', state.soundEnabled);
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }

  // ==========================================
  // AUDIO SYNTHESIZER (Web Audio API)
  // ==========================================
  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play crisp arcade coin sound
  function playCoinSound() {
    if (!state.soundEnabled) return;
    initAudioContext();
    if (!audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      // Audio error ignored
    }
  }

  // Play triumphant milestone fanfare
  function playFanfareSound() {
    if (!state.soundEnabled) return;
    initAudioContext();
    if (!audioCtx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = audioCtx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.2, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.3);
    });
  }

  // Ting-ting bank transfer sound
  function playTingTingSound() {
    if (!state.soundEnabled) return;
    initAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    [1567.98, 2093.00].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      gain.gain.setValueAtTime(0.25, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.5);
    });
  }

  // Vietnamese Voice Coach
  function speakVoice(text) {
    if (!state.soundEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  // ==========================================
  // DOM REFERENCES
  // ==========================================
  const dom = {
    // Nav & Header
    headerBalance: document.getElementById('header-balance'),
    audioToggleBtn: document.getElementById('audio-toggle-btn'),
    audioIcon: document.getElementById('audio-icon'),
    balanceWidget: document.getElementById('balance-widget'),
    navTabs: document.querySelectorAll('.nav-tab'),
    tabPanes: document.querySelectorAll('.tab-pane'),

    // Hero & HUD
    currentRateText: document.getElementById('current-rate-text'),
    hudShoeBadge: document.getElementById('hud-shoe-badge'),
    sessionEarnings: document.getElementById('session-earnings'),
    floatingCoinsPool: document.getElementById('floating-coins-pool'),
    modeSimBtn: document.getElementById('mode-sim-btn'),
    modeGpsBtn: document.getElementById('mode-gps-btn'),

    // Visualizer
    visTabTrack: document.getElementById('vis-tab-track'),
    visTabMap: document.getElementById('vis-tab-map'),
    trackVisContainer: document.getElementById('track-visualizer-container'),
    mapVisContainer: document.getElementById('map-visualizer-container'),
    trackCanvas: document.getElementById('track-canvas'),
    canvasSpeedLabel: document.getElementById('canvas-speed-label'),
    runnerStateBadge: document.getElementById('runner-state-badge'),
    nextMilestoneText: document.getElementById('next-milestone-text'),
    milestonePercentText: document.getElementById('milestone-percent-text'),
    milestoneProgressBar: document.getElementById('milestone-progress-bar'),
    routeSelect: document.getElementById('route-select'),
    gpsStatusPill: document.getElementById('gps-status-pill'),
    gpsStatusText: document.getElementById('gps-status-text'),

    // Telemetry Cards
    valDistance: document.getElementById('val-distance'),
    unitDistance: document.getElementById('unit-distance'),
    valDistanceKm: document.getElementById('val-distance-km'),
    valSpeed: document.getElementById('val-speed'),
    valPace: document.getElementById('val-pace'),
    valTime: document.getElementById('val-time'),
    runStatusText: document.getElementById('run-status-text'),
    valCalories: document.getElementById('val-calories'),
    valSteps: document.getElementById('val-steps'),
    valTotalWallet: document.getElementById('val-total-wallet'),

    // Controls
    simSpeedControls: document.getElementById('sim-speed-controls'),
    gpsInfoControls: document.getElementById('gps-info-controls'),
    speedPresetBtns: document.querySelectorAll('.speed-preset-btn'),
    simSpeedSlider: document.getElementById('sim-speed-slider'),
    sliderSpeedVal: document.getElementById('slider-speed-val'),
    gpsAccuracy: document.getElementById('gps-accuracy'),
    gpsCoords: document.getElementById('gps-coords'),
    btnStartRun: document.getElementById('btn-start-run'),
    btnPauseRun: document.getElementById('btn-pause-run'),
    btnResumeRun: document.getElementById('btn-resume-run'),
    btnStopRun: document.getElementById('btn-stop-run'),

    // Shop
    shoesShopGrid: document.getElementById('shoes-shop-grid'),
    buffsShopGrid: document.getElementById('buffs-shop-grid'),

    // Wallet
    cashoutAvailableBalance: document.getElementById('cashout-available-balance'),
    cashoutAccountNumber: document.getElementById('cashout-account-number'),
    cashoutAccountName: document.getElementById('cashout-account-name'),
    cashoutAmount: document.getElementById('cashout-amount'),
    btnCashoutAll: document.getElementById('btn-cashout-all'),
    btnSubmitCashout: document.getElementById('btn-submit-cashout'),
    quickChips: document.querySelectorAll('.chip-btn'),
    payMethodRadios: document.querySelectorAll('input[name="payMethod"]'),

    // Achievements & History
    badgesContainer: document.getElementById('badges-container'),
    unlockedBadgesCount: document.getElementById('unlocked-badges-count'),
    historyTbody: document.getElementById('history-tbody'),
    btnClearHistory: document.getElementById('btn-clear-history'),

    // Modals
    modalRunFinish: document.getElementById('modal-run-finish'),
    modalFinishMoney: document.getElementById('modal-finish-money'),
    modalFinishRate: document.getElementById('modal-finish-rate'),
    modalFinishDistance: document.getElementById('modal-finish-distance'),
    modalFinishTime: document.getElementById('modal-finish-time'),
    modalFinishCal: document.getElementById('modal-finish-cal'),
    modalFinishSpeed: document.getElementById('modal-finish-speed'),
    modalBtnClaim: document.getElementById('modal-btn-claim'),

    modalReceipt: document.getElementById('modal-receipt'),
    modalCloseReceipt: document.getElementById('modal-close-receipt'),
    receiptDoneBtn: document.getElementById('receipt-done-btn'),
    receiptAmount: document.getElementById('receipt-amount'),
    receiptMethod: document.getElementById('receipt-method'),
    receiptAccount: document.getElementById('receipt-account'),
    receiptReceiver: document.getElementById('receipt-receiver'),
    receiptTxid: document.getElementById('receipt-txid'),
    receiptTimestamp: document.getElementById('receipt-timestamp'),

    toastContainer: document.getElementById('toast-container')
  };

  // ==========================================
  // HELPERS & FORMATTERS
  // ==========================================
  function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN').format(Math.floor(amount)) + ' ₫';
  }

  function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function getEquippedShoe() {
    return SHOES_CATALOG.find(s => s.id === state.equippedShoeId) || SHOES_CATALOG[0];
  }

  function getCurrentRatePerMeter() {
    const shoe = getEquippedShoe();
    let mult = shoe.multiplier;
    if (state.activeBuff && state.buffSecondsLeft > 0) {
      mult *= state.activeBuff.multiplier;
    }
    return Math.round(BASE_RATE_PER_METER * mult);
  }

  function showToast(message, icon = 'fa-circle-check') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid ${icon}" style="color: var(--neon-green)"></i> <span>${message}</span>`;
    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Floating arcade coin counter animation
  function spawnFloatingCoin(amount) {
    if (!dom.floatingCoinsPool) return;
    const floater = document.createElement('div');
    floater.className = 'floating-coin-burst';
    floater.innerHTML = `+${amount.toLocaleString('vi-VN')}₫`;

    // Random slight horizontal offset for organic arcade burst
    const randomX = (Math.random() - 0.5) * 160;
    floater.style.left = `calc(50% + ${randomX}px)`;
    floater.style.top = '10px';

    dom.floatingCoinsPool.appendChild(floater);
    setTimeout(() => {
      floater.remove();
    }, 1200);
  }

  // ==========================================
  // MILESTONE & REWARD CHECKS
  // ==========================================
  function checkMilestones(distance) {
    const nextMilestone = Math.floor(distance / 100 + 1) * 100;
    const progressIn100m = distance % 100;

    dom.nextMilestoneText.textContent = `${nextMilestone}m (+${(nextMilestone * getCurrentRatePerMeter()).toLocaleString('vi-VN')}₫)`;
    dom.milestonePercentText.textContent = `${Math.floor(progressIn100m)}%`;
    dom.milestoneProgressBar.style.width = `${progressIn100m}%`;

    // Milestone announcement every 100m
    const current100mBlock = Math.floor(distance / 100);
    if (current100mBlock > state.lastMilestoneReached && distance >= 100) {
      state.lastMilestoneReached = current100mBlock;
      playFanfareSound();
      showToast(`🔥 Cột mốc ${current100mBlock * 100}m hoàn thành! Đã cộng ${(current100mBlock * 100 * getCurrentRatePerMeter()).toLocaleString('vi-VN')}₫!`, 'fa-fire');
      speakVoice(`Bạn đã chạy được ${current100mBlock * 100} mét! Tuyệt vời!`);

      // Check achievements
      checkAchievements();
    }
  }

  function checkAchievements() {
    let unlockedAny = false;

    // 1. First step (100m)
    if (state.distanceMeters >= 100 && !state.unlockedAchievements.includes('first_step')) {
      unlockAchievement('first_step');
      unlockedAny = true;
    }
    // 2. 1KM club
    if (state.distanceMeters >= 1000 && !state.unlockedAchievements.includes('runner_1k')) {
      unlockAchievement('runner_1k');
      unlockedAny = true;
    }
    // 3. 100k VND
    if (state.totalWalletVnd >= 100000 && !state.unlockedAchievements.includes('first_100k')) {
      unlockAchievement('first_100k');
      unlockedAny = true;
    }
    // 4. Speed demon
    if (state.currentSpeedKmh >= 15.0 && !state.unlockedAchievements.includes('speed_demon')) {
      unlockAchievement('speed_demon');
      unlockedAny = true;
    }
    // 5. Shoe collector (>= 3 shoes owned)
    if (state.ownedShoes.length >= 3 && !state.unlockedAchievements.includes('shoe_collector')) {
      unlockAchievement('shoe_collector');
      unlockedAny = true;
    }

    if (unlockedAny) {
      renderAchievements();
      savePersistedData();
    }
  }

  function unlockAchievement(id) {
    if (!state.unlockedAchievements.includes(id)) {
      state.unlockedAchievements.push(id);
      const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
      if (ach) {
        showToast(`🏆 Danh hiệu mới mở khóa: "${ach.title}"!`, 'fa-trophy');
        playFanfareSound();
      }
    }
  }

  // ==========================================
  // RUN TELEMETRY & RUNNING ENGINE
  // ==========================================
  function updateTelemetryUI() {
    // Distance
    if (state.distanceMeters < 1000) {
      dom.valDistance.textContent = Math.floor(state.distanceMeters);
      dom.unitDistance.textContent = 'm';
    } else {
      dom.valDistance.textContent = (state.distanceMeters / 1000).toFixed(2);
      dom.unitDistance.textContent = 'km';
    }
    dom.valDistanceKm.textContent = `${(state.distanceMeters / 1000).toFixed(2)} km`;

    // Speed & Pace
    const speed = state.isRunning && !state.isPaused ? state.currentSpeedKmh : 0.0;
    dom.valSpeed.textContent = speed.toFixed(1);
    dom.canvasSpeedLabel.textContent = speed.toFixed(1);

    if (speed > 0.5) {
      const paceDecimal = 60 / speed;
      const paceMins = Math.floor(paceDecimal);
      const paceSecs = Math.floor((paceDecimal - paceMins) * 60);
      dom.valPace.textContent = `Pace: ${paceMins}:${paceSecs.toString().padStart(2, '0')} /km`;
    } else {
      dom.valPace.textContent = 'Pace: --:-- /km';
    }

    // Time
    dom.valTime.textContent = formatTime(state.elapsedSeconds);

    // Earnings
    dom.sessionEarnings.textContent = Math.floor(state.sessionEarnings).toLocaleString('vi-VN');
    dom.headerBalance.textContent = formatMoney(state.totalWalletVnd + state.sessionEarnings);
    dom.valTotalWallet.textContent = formatMoney(state.totalWalletVnd);
    dom.cashoutAvailableBalance.textContent = formatMoney(state.totalWalletVnd);

    // Calories (~0.065 kcal per meter for average runner)
    state.calories = Math.floor(state.distanceMeters * 0.065);
    dom.valCalories.textContent = state.calories;

    // Steps (~1.3 steps per meter)
    state.steps = Math.floor(state.distanceMeters * 1.32);
    dom.valSteps.textContent = `${state.steps.toLocaleString('vi-VN')} bước chân`;

    // Rate text badge
    const currentRate = getCurrentRatePerMeter();
    let buffTag = '';
    if (state.activeBuff && state.buffSecondsLeft > 0) {
      buffTag = ` [⚡ ${state.activeBuff.name} x${state.activeBuff.multiplier}: ${state.buffSecondsLeft}s]`;
    }
    dom.currentRateText.textContent = `HỆ SỐ: ${currentRate}₫ / MÉT${buffTag}`;

    const shoe = getEquippedShoe();
    dom.hudShoeBadge.innerHTML = `<i class="fa-solid ${shoe.icon}"></i> ${shoe.name} (x${shoe.multiplier})`;

    // Runner state badge
    if (state.isRunning && !state.isPaused) {
      dom.runnerStateBadge.className = 'runner-cadence-badge running';
      dom.runnerStateBadge.innerHTML = `<i class="fa-solid fa-person-running"></i> ĐANG CHẠY (${speed.toFixed(1)} km/h)`;
      dom.runStatusText.textContent = 'Trạng thái: Đang hoạt động';
      dom.runStatusText.style.color = 'var(--neon-green)';
    } else if (state.isPaused) {
      dom.runnerStateBadge.className = 'runner-cadence-badge';
      dom.runnerStateBadge.innerHTML = `<i class="fa-solid fa-pause"></i> TẠM DỪNG`;
      dom.runStatusText.textContent = 'Trạng thái: Tạm dừng';
      dom.runStatusText.style.color = '#f59e0b';
    } else {
      dom.runnerStateBadge.className = 'runner-cadence-badge';
      dom.runnerStateBadge.innerHTML = `<i class="fa-solid fa-shoe-prints"></i> SẴN SÀNG`;
      dom.runStatusText.textContent = 'Trạng thái: Chưa bắt đầu';
      dom.runStatusText.style.color = 'var(--text-dim)';
    }
  }

  // Add Distance and compute real-time earnings
  function accumulateDistance(deltaMeters) {
    if (deltaMeters <= 0) return;

    state.distanceMeters += deltaMeters;

    // Calculate cash earned for this increment: 1m = 100 VNĐ * multiplier
    const rate = getCurrentRatePerMeter();
    const deltaCash = deltaMeters * rate;
    state.sessionEarnings += deltaCash;

    // Trigger visual floating coin and sound whenever at least 1 full meter or block is earned
    if (Math.random() < 0.35 || deltaMeters >= 1) {
      spawnFloatingCoin(Math.round(deltaMeters * rate));
      playCoinSound();
    }

    checkMilestones(state.distanceMeters);
  }

  // Simulation Tick (Every 500ms)
  function onSimulationTick() {
    if (!state.isRunning || state.isPaused) return;

    state.elapsedSeconds += 0.5;

    // Active Buff Countdown
    if (state.activeBuff && state.buffSecondsLeft > 0) {
      state.buffSecondsLeft -= 0.5;
      if (state.buffSecondsLeft <= 0) {
        state.activeBuff = null;
        showToast('⚡ Hết thời gian hiệu lực Buff!', 'fa-info');
      }
    }

    // Convert km/h to meters per 0.5 second: (km/h * 1000 / 3600) * 0.5
    const metersThisTick = (state.currentSpeedKmh * 1000 / 3600) * 0.5;
    accumulateDistance(metersThisTick);

    // Progress route on Leaflet Map
    advanceMapRoute(metersThisTick);

    updateTelemetryUI();
  }

  // ==========================================
  // GPS ENGINE (HTML5 Geolocation)
  // ==========================================
  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const toRad = Math.PI / 180;
    const dLat = (lat2 - lat1) * toRad;
    const dLon = (lon2 - lon1) * toRad;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function startGpsTracking() {
    if (!('geolocation' in navigator)) {
      showToast('Trình duyệt không hỗ trợ định vị GPS.', 'fa-triangle-exclamation');
      return;
    }

    dom.gpsStatusText.textContent = 'Đang tìm kiếm tín hiệu vệ tinh...';

    state.gpsWatchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed } = position.coords;
        dom.gpsAccuracy.textContent = `±${Math.round(accuracy)}m`;
        dom.gpsCoords.textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        dom.gpsStatusText.textContent = `GPS Đang hoạt động (±${Math.round(accuracy)}m)`;

        if (!state.isRunning || state.isPaused) {
          state.lastGpsPosition = { lat: latitude, lon: longitude };
          return;
        }

        if (state.lastGpsPosition) {
          const deltaM = haversineDistance(
            state.lastGpsPosition.lat,
            state.lastGpsPosition.lon,
            latitude,
            longitude
          );

          // Filter GPS jitter noise: only register if moved > 1.2m and accuracy <= 25m
          if (deltaM >= 1.2 && accuracy <= 35) {
            accumulateDistance(deltaM);

            // Compute speed in km/h if available from device
            if (speed !== null && speed !== undefined && speed > 0) {
              state.currentSpeedKmh = speed * 3.6;
            } else {
              // Estimate speed from delta distance / delta time
              state.currentSpeedKmh = (deltaM / 1.0) * 3.6;
            }

            // Update Map
            if (state.leafletMap && state.mapRunnerMarker) {
              const newLatLng = [latitude, longitude];
              state.mapRunnerMarker.setLatLng(newLatLng);
              state.traveledPoints.push(newLatLng);
              state.mapTraveledPolyline.setLatLngs(state.traveledPoints);
              state.leafletMap.panTo(newLatLng);
            }
          }
        }

        state.lastGpsPosition = { lat: latitude, lon: longitude };
        updateTelemetryUI();
      },
      (error) => {
        console.warn('GPS Error:', error);
        dom.gpsStatusText.textContent = 'Không bắt được GPS (Sử dụng mô phỏng)';
        dom.gpsAccuracy.textContent = 'Mất tín hiệu';
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000
      }
    );
  }

  function stopGpsTracking() {
    if (state.gpsWatchId !== null) {
      navigator.geolocation.clearWatch(state.gpsWatchId);
      state.gpsWatchId = null;
    }
  }

  // ==========================================
  // LEAFLET MAP INTEGRATION
  // ==========================================
  function initLeafletMap() {
    const defaultCenter = [21.0285, 105.8542]; // Hồ Hoàn Kiếm, Hà Nội

    state.leafletMap = L.map('leaflet-map', {
      zoomControl: true,
      attributionControl: false
    }).setView(defaultCenter, 16);

    // Dark Cyber Map Tile Layer (CartoDB DarkMatter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(state.leafletMap);

    // Glowing Neon Route Path
    state.currentRouteWaypoints = ROUTES[dom.routeSelect.value] || ROUTES.hoan_kiem;
    state.mapRoutePolyline = L.polyline(state.currentRouteWaypoints, {
      color: '#00f0ff',
      weight: 5,
      opacity: 0.5,
      dashArray: '8, 8'
    }).addTo(state.leafletMap);

    // Traveled glowing green line
    state.traveledPoints = [state.currentRouteWaypoints[0]];
    state.mapTraveledPolyline = L.polyline(state.traveledPoints, {
      color: '#00ff88',
      weight: 6,
      opacity: 0.9
    }).addTo(state.leafletMap);

    // Custom Runner Marker with pulsating icon
    const runnerIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: #00ff88;
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 20px #00ff88;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #070a12;
          font-size: 14px;
        ">
          <i class="fa-solid fa-person-running"></i>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    state.mapRunnerMarker = L.marker(state.currentRouteWaypoints[0], { icon: runnerIcon }).addTo(state.leafletMap);
    state.leafletMap.fitBounds(state.mapRoutePolyline.getBounds(), { padding: [40, 40] });
  }

  function advanceMapRoute(deltaMeters) {
    if (!state.leafletMap || !state.currentRouteWaypoints || state.currentRouteWaypoints.length < 2) return;

    // Simple smooth waypoint interpolation for simulation
    const waypoints = state.currentRouteWaypoints;
    const currIndex = state.currentWaypointIndex;
    const nextIndex = (currIndex + 1) % waypoints.length;

    const p1 = waypoints[currIndex];
    const p2 = waypoints[nextIndex];

    const segmentDistance = haversineDistance(p1[0], p1[1], p2[0], p2[1]);
    const stepRatio = Math.min(1, deltaMeters / Math.max(10, segmentDistance));

    const currentPos = state.mapRunnerMarker.getLatLng();
    const newLat = currentPos.lat + (p2[0] - p1[0]) * stepRatio;
    const newLng = currentPos.lng + (p2[1] - p1[1]) * stepRatio;

    const newLatLng = [newLat, newLng];
    state.mapRunnerMarker.setLatLng(newLatLng);
    state.traveledPoints.push(newLatLng);
    state.mapTraveledPolyline.setLatLngs(state.traveledPoints);

    // If close to next waypoint, advance index
    const distToTarget = haversineDistance(newLat, newLng, p2[0], p2[1]);
    if (distToTarget < 15) {
      state.currentWaypointIndex = nextIndex;
    }

    state.leafletMap.panTo(newLatLng, { animate: true, duration: 0.5 });
  }

  function changeRoute(routeKey) {
    if (!ROUTES[routeKey]) return;
    state.currentRouteWaypoints = ROUTES[routeKey];
    state.currentWaypointIndex = 0;
    state.traveledPoints = [state.currentRouteWaypoints[0]];

    if (state.mapRoutePolyline) {
      state.mapRoutePolyline.setLatLngs(state.currentRouteWaypoints);
    }
    if (state.mapTraveledPolyline) {
      state.mapTraveledPolyline.setLatLngs(state.traveledPoints);
    }
    if (state.mapRunnerMarker) {
      state.mapRunnerMarker.setLatLng(state.currentRouteWaypoints[0]);
    }
    if (state.leafletMap) {
      state.leafletMap.fitBounds(state.mapRoutePolyline.getBounds(), { padding: [40, 40] });
    }
  }

  // ==========================================
  // 3D NEON TRACK CANVAS VISUALIZER
  // ==========================================
  let canvasOffset = 0;
  let runnerAnimPhase = 0;

  function initCanvas() {
    const canvas = dom.trackCanvas;
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function draw() {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Dark futuristic background
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Sky horizon neon glow
      const horizonY = height * 0.35;
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#03050a');
      skyGrad.addColorStop(1, '#0e1a32');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // Distant City Skyline Silhouette
      ctx.fillStyle = '#09101f';
      for (let i = 0; i < 16; i++) {
        const bW = 35 + ((i * 19) % 25);
        const bH = 20 + ((i * 37) % 65);
        ctx.fillRect(i * 45 - 20, horizonY - bH, bW, bH);
      }

      // Track Perspective Surface
      const trackGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      trackGrad.addColorStop(0, '#091124');
      trackGrad.addColorStop(1, '#02060f');
      ctx.fillStyle = trackGrad;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // Perspective Running Road
      const topRoadWidth = width * 0.15;
      const bottomRoadWidth = width * 0.85;
      const centerX = width / 2;

      ctx.beginPath();
      ctx.moveTo(centerX - topRoadWidth / 2, horizonY);
      ctx.lineTo(centerX + topRoadWidth / 2, horizonY);
      ctx.lineTo(centerX + bottomRoadWidth / 2, height);
      ctx.lineTo(centerX - bottomRoadWidth / 2, height);
      ctx.closePath();
      ctx.fillStyle = '#0b1426';
      ctx.fill();

      // Neon road borders
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Road Speed Lines (Motion effect)
      if (state.isRunning && !state.isPaused) {
        canvasOffset = (canvasOffset + (state.currentSpeedKmh * 0.08)) % 1;
        runnerAnimPhase += state.currentSpeedKmh * 0.035;
      }

      const numDashes = 12;
      for (let i = 0; i < numDashes; i++) {
        const rawPos = (i / numDashes + canvasOffset) % 1;
        // Non-linear projection for perspective depth
        const p = Math.pow(rawPos, 2.2);
        const y = horizonY + (height - horizonY) * p;
        const currentRoadW = topRoadWidth + (bottomRoadWidth - topRoadWidth) * p;
        const dashW = currentRoadW * 0.08;
        const dashH = 4 + 18 * p;

        ctx.fillStyle = p > 0.6 ? '#00ff88' : '#00f0ff';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8 * p;
        ctx.fillRect(centerX - dashW / 2, y, dashW, dashH);
      }
      ctx.shadowBlur = 0;

      // Draw Animated Runner Avatar
      drawRunnerAvatar(ctx, centerX, height * 0.78, runnerAnimPhase);

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  // Draw Runner Silhouette with Dynamic Running Leg & Arm Swing
  function drawRunnerAvatar(ctx, x, y, phase) {
    const isMoving = state.isRunning && !state.isPaused;
    const legSwing = isMoving ? Math.sin(phase) * 22 : 0;
    const armSwing = isMoving ? Math.cos(phase) * 18 : 0;
    const bodyBounce = isMoving ? Math.abs(Math.sin(phase * 2)) * 6 : 0;

    const runnerY = y - bodyBounce;

    ctx.save();
    ctx.translate(x, runnerY);

    // Glowing Runner Shadow on track
    ctx.beginPath();
    ctx.ellipse(0, 36 + bodyBounce, 28, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 255, 136, 0.25)';
    ctx.fill();

    // Sparkles / Golden coins floating from heels when running!
    if (isMoving && Math.random() < 0.45) {
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(-14 + (Math.random() - 0.5) * 16, 28 + Math.random() * 8, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Legs
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // Left leg
    ctx.beginPath();
    ctx.moveTo(-4, 6);
    ctx.lineTo(-4 - legSwing * 0.6, 20);
    ctx.lineTo(-6 - legSwing, 34);
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(4, 6);
    ctx.lineTo(4 + legSwing * 0.6, 20);
    ctx.lineTo(6 + legSwing, 34);
    ctx.stroke();

    // Torso / Body
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(0, 8);
    ctx.stroke();

    // Arms
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3.5;
    // Left arm
    ctx.beginPath();
    ctx.moveTo(-2, -8);
    ctx.lineTo(-12 + armSwing, 4);
    ctx.stroke();
    // Right arm
    ctx.beginPath();
    ctx.moveTo(2, -8);
    ctx.lineTo(12 - armSwing, 4);
    ctx.stroke();

    // Head
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, -22, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  // ==========================================
  // RUN CONTROL ACTIONS (START / PAUSE / STOP)
  // ==========================================
  function startRun() {
    initAudioContext();
    state.isRunning = true;
    state.isPaused = false;

    dom.btnStartRun.classList.add('hidden');
    dom.btnPauseRun.classList.remove('hidden');
    dom.btnResumeRun.classList.add('hidden');
    dom.btnStopRun.removeAttribute('disabled');

    // Start simulation loop
    if (state.mode === 'sim') {
      if (!state.simInterval) {
        state.simInterval = setInterval(onSimulationTick, 500);
      }
    } else {
      startGpsTracking();
    }

    playFanfareSound();
    speakVoice('Bắt đầu buổi chạy! Mỗi một mét kiếm ngay một trăm đồng!');
    showToast('🚀 Buổi chạy đã bắt đầu! Đang tính tiền theo từng mét!', 'fa-bolt');
    updateTelemetryUI();
  }

  function pauseRun() {
    state.isPaused = true;
    dom.btnPauseRun.classList.add('hidden');
    dom.btnResumeRun.classList.remove('hidden');
    showToast('⏸️ Đã tạm dừng buổi chạy.', 'fa-pause');
    updateTelemetryUI();
  }

  function resumeRun() {
    state.isPaused = false;
    dom.btnResumeRun.classList.add('hidden');
    dom.btnPauseRun.classList.remove('hidden');
    showToast('▶️ Tiếp tục chạy!', 'fa-play');
    updateTelemetryUI();
  }

  function finishRun() {
    if (!state.isRunning) return;

    // Stop intervals and GPS
    if (state.simInterval) {
      clearInterval(state.simInterval);
      state.simInterval = null;
    }
    stopGpsTracking();

    state.isRunning = false;
    state.isPaused = false;

    // Reset controls buttons
    dom.btnStartRun.classList.remove('hidden');
    dom.btnPauseRun.classList.add('hidden');
    dom.btnResumeRun.classList.add('hidden');
    dom.btnStopRun.setAttribute('disabled', 'true');

    // Save history record
    const runRecord = {
      id: 'RUN-' + Date.now().toString(36).toUpperCase(),
      date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      mode: state.mode === 'sim' ? 'Mô phỏng' : 'GPS Thực tế',
      distance: state.distanceMeters,
      duration: state.elapsedSeconds,
      avgSpeed: state.elapsedSeconds > 0 ? (state.distanceMeters / state.elapsedSeconds) * 3.6 : 0,
      moneyEarned: Math.floor(state.sessionEarnings)
    };

    state.runHistory.unshift(runRecord);
    renderRunHistory();

    // Populate Finish Modal
    dom.modalFinishMoney.textContent = `+${runRecord.moneyEarned.toLocaleString('vi-VN')} ₫`;
    dom.modalFinishRate.textContent = `Hệ số áp dụng: ${getCurrentRatePerMeter()}₫ / mét`;
    dom.modalFinishDistance.textContent = runRecord.distance < 1000 ? `${Math.floor(runRecord.distance)} m` : `${(runRecord.distance / 1000).toFixed(2)} km`;
    dom.modalFinishTime.textContent = formatTime(runRecord.duration);
    dom.modalFinishCal.textContent = `${state.calories} kcal`;
    dom.modalFinishSpeed.textContent = `${runRecord.avgSpeed.toFixed(1)} km/h`;

    dom.modalRunFinish.classList.remove('hidden');

    playFanfareSound();
    speakVoice(`Chúc mừng bạn hoàn thành buổi chạy và nhận được ${runRecord.moneyEarned.toLocaleString('vi-VN')} đồng!`);

    savePersistedData();
  }

  function claimAndResetSession() {
    // Add session earnings to wallet
    state.totalWalletVnd += Math.floor(state.sessionEarnings);

    // Reset session variables
    state.distanceMeters = 0;
    state.sessionEarnings = 0;
    state.elapsedSeconds = 0;
    state.calories = 0;
    state.steps = 0;
    state.lastMilestoneReached = 0;

    dom.modalRunFinish.classList.add('hidden');

    savePersistedData();
    checkAchievements();
    updateTelemetryUI();
    showToast('💰 Tiền thưởng đã được cộng vào Ví Chính!', 'fa-coins');
  }

  // ==========================================
  // SHOP & GEAR UPGRADE
  // ==========================================
  function renderShop() {
    dom.shoesShopGrid.innerHTML = '';

    SHOES_CATALOG.forEach(shoe => {
      const isOwned = state.ownedShoes.includes(shoe.id);
      const isEquipped = state.equippedShoeId === shoe.id;

      const card = document.createElement('div');
      card.className = `shoe-card ${isEquipped ? 'equipped' : ''}`;

      let actionBtnHtml = '';
      if (isEquipped) {
        actionBtnHtml = `<button class="shoe-action-btn btn-equipped-active"><i class="fa-solid fa-check"></i> ĐANG SỬ DỤNG</button>`;
      } else if (isOwned) {
        actionBtnHtml = `<button class="shoe-action-btn btn-equip-shoe" data-shoe-id="${shoe.id}"><i class="fa-solid fa-shoe-prints"></i> TRANG BỊ</button>`;
      } else {
        actionBtnHtml = `<button class="shoe-action-btn btn-buy-shoe" data-shoe-id="${shoe.id}"><i class="fa-solid fa-cart-shopping"></i> MUA ${shoe.price.toLocaleString('vi-VN')} ₫</button>`;
      }

      card.innerHTML = `
        <div class="shoe-header">
          <span class="shoe-tier-tag tier-${shoe.tier}">${shoe.tierLabel}</span>
          ${isEquipped ? '<span style="color: var(--neon-green); font-size: 0.75rem; font-weight: 800;"><i class="fa-solid fa-star"></i> MẶC ĐỊNH</span>' : ''}
        </div>
        <div class="shoe-icon-box">
          <i class="fa-solid ${shoe.icon}"></i>
        </div>
        <div class="shoe-name">${shoe.name}</div>
        <div class="shoe-desc">${shoe.desc}</div>
        <div class="shoe-multiplier-badge">
          <span class="mult-label">Tỷ lệ đổi thưởng:</span>
          <span class="mult-value">${Math.round(BASE_RATE_PER_METER * shoe.multiplier)}₫ / m (x${shoe.multiplier})</span>
        </div>
        ${actionBtnHtml}
      `;

      dom.shoesShopGrid.appendChild(card);
    });

    // Buffs
    dom.buffsShopGrid.innerHTML = '';
    BUFFS_CATALOG.forEach(buff => {
      const buffCard = document.createElement('div');
      buffCard.className = 'buff-card';
      buffCard.innerHTML = `
        <div class="buff-icon">
          <i class="fa-solid ${buff.icon}"></i>
        </div>
        <div class="buff-info">
          <div class="buff-name">${buff.name}</div>
          <div class="buff-desc">${buff.desc}</div>
        </div>
        <button class="buff-price-btn" data-buff-id="${buff.id}">
          MUA ${buff.price.toLocaleString('vi-VN')}₫
        </button>
      `;
      dom.buffsShopGrid.appendChild(buffCard);
    });
  }

  function handleShoeAction(shoeId) {
    const shoe = SHOES_CATALOG.find(s => s.id === shoeId);
    if (!shoe) return;

    const isOwned = state.ownedShoes.includes(shoeId);

    if (isOwned) {
      // Equip shoe
      state.equippedShoeId = shoeId;
      showToast(`👟 Đã trang bị "${shoe.name}"! Tỷ lệ mới: ${getCurrentRatePerMeter()}₫/m`, 'fa-shoe-prints');
      playCoinSound();
    } else {
      // Buy shoe
      if (state.totalWalletVnd < shoe.price) {
        showToast(`Số dư không đủ! Cần thêm ${(shoe.price - state.totalWalletVnd).toLocaleString('vi-VN')}₫ nữa!`, 'fa-circle-exclamation');
        return;
      }

      state.totalWalletVnd -= shoe.price;
      state.ownedShoes.push(shoeId);
      state.equippedShoeId = shoeId;
      showToast(`🎉 Mua thành công "${shoe.name}"! Đã tự động trang bị!`, 'fa-circle-check');
      playFanfareSound();
    }

    savePersistedData();
    renderShop();
    updateTelemetryUI();
    checkAchievements();
  }

  function handleBuffAction(buffId) {
    const buff = BUFFS_CATALOG.find(b => b.id === buffId);
    if (!buff) return;

    if (state.totalWalletVnd < buff.price) {
      showToast(`Số dư không đủ để mua "${buff.name}"!`, 'fa-circle-exclamation');
      return;
    }

    state.totalWalletVnd -= buff.price;
    state.activeBuff = buff;
    state.buffSecondsLeft = buff.duration;

    showToast(`⚡ Đã kích hoạt "${buff.name}"! Thu nhập nhân đôi trong ${buff.duration}s!`, 'fa-bolt');
    playFanfareSound();

    savePersistedData();
    updateTelemetryUI();
  }

  // ==========================================
  // WALLET & CASHOUT SIMULATION
  // ==========================================
  function handleCashoutSubmit() {
    const accountNum = dom.cashoutAccountNumber.value.trim();
    const accountName = dom.cashoutAccountName.value.trim();
    const amountVal = parseInt(dom.cashoutAmount.value, 10);
    const selectedMethod = document.querySelector('input[name="payMethod"]:checked')?.value || 'momo';

    if (!accountNum) {
      showToast('Vui lòng nhập số điện thoại hoặc số tài khoản!', 'fa-circle-exclamation');
      dom.cashoutAccountNumber.focus();
      return;
    }
    if (!accountName) {
      showToast('Vui lòng nhập tên người nhận tiền!', 'fa-circle-exclamation');
      dom.cashoutAccountName.focus();
      return;
    }
    if (!amountVal || amountVal < 1000) {
      showToast('Số tiền rút tối thiểu là 1.000 ₫!', 'fa-circle-exclamation');
      dom.cashoutAmount.focus();
      return;
    }
    if (amountVal > state.totalWalletVnd) {
      showToast(`Số dư ví không đủ! Bạn chỉ có ${formatMoney(state.totalWalletVnd)}`, 'fa-circle-exclamation');
      return;
    }

    // Process Cashout
    state.totalWalletVnd -= amountVal;

    // Generate Transaction Details
    const txId = 'R2E-' + Math.floor(10000000 + Math.random() * 90000000);
    const methodNames = {
      momo: 'Ví Điện Tử MoMo',
      zalopay: 'Ví ZaloPay',
      vietcombank: 'Ngân hàng Vietcombank',
      mbbank: 'Ngân hàng Quân Đội MB Bank',
      techcombank: 'Ngân hàng Techcombank'
    };

    dom.receiptAmount.textContent = formatMoney(amountVal);
    dom.receiptMethod.textContent = methodNames[selectedMethod] || selectedMethod.toUpperCase();
    dom.receiptAccount.textContent = accountNum.length > 4 ? accountNum.slice(0, 3) + '****' + accountNum.slice(-3) : accountNum;
    dom.receiptReceiver.textContent = accountName.toUpperCase();
    dom.receiptTxid.textContent = txId;
    dom.receiptTimestamp.textContent = new Date().toLocaleString('vi-VN');

    // Show receipt modal
    dom.modalReceipt.classList.remove('hidden');
    playTingTingSound();
    speakVoice(`Rút tiền thành công! ${amountVal.toLocaleString('vi-VN')} đồng đã được chuyển về tài khoản.`);

    // Reset form inputs
    dom.cashoutAmount.value = '';

    unlockAchievement('first_cashout');
    savePersistedData();
    updateTelemetryUI();
  }

  // ==========================================
  // ACHIEVEMENTS & RUN HISTORY RENDERING
  // ==========================================
  function renderAchievements() {
    dom.badgesContainer.innerHTML = '';
    let count = 0;

    ACHIEVEMENTS_LIST.forEach(ach => {
      const isUnlocked = state.unlockedAchievements.includes(ach.id);
      if (isUnlocked) count++;

      const item = document.createElement('div');
      item.className = `badge-item ${isUnlocked ? 'unlocked' : ''}`;
      item.innerHTML = `
        <div class="badge-icon">
          <i class="fa-solid ${ach.icon}"></i>
        </div>
        <div class="badge-title">${ach.title}</div>
        <div class="badge-desc">${ach.desc}</div>
      `;
      dom.badgesContainer.appendChild(item);
    });

    dom.unlockedBadgesCount.textContent = `${count} / ${ACHIEVEMENTS_LIST.length} Mở khóa`;
  }

  function renderRunHistory() {
    dom.historyTbody.innerHTML = '';

    if (state.runHistory.length === 0) {
      dom.historyTbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-dim); padding: 24px;">
            <i class="fa-solid fa-person-running"></i> Chưa có dữ liệu buổi chạy nào. Hãy bắt đầu chạy ngay!
          </td>
        </tr>
      `;
      return;
    }

    state.runHistory.forEach(record => {
      const tr = document.createElement('tr');
      const distStr = record.distance < 1000 ? `${Math.floor(record.distance)} m` : `${(record.distance / 1000).toFixed(2)} km`;
      tr.innerHTML = `
        <td>${record.date}</td>
        <td><span class="badge-tag">${record.mode}</span></td>
        <td><strong>${distStr}</strong></td>
        <td>${formatTime(record.duration)}</td>
        <td>${record.avgSpeed ? record.avgSpeed.toFixed(1) : 0} km/h</td>
        <td style="color: var(--neon-green); font-weight: 800;">+${record.moneyEarned.toLocaleString('vi-VN')} ₫</td>
      `;
      dom.historyTbody.appendChild(tr);
    });
  }

  // ==========================================
  // EVENT LISTENERS & SETUP
  // ==========================================
  function setupEventListeners() {
    // Navigation Tabs
    dom.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        dom.navTabs.forEach(t => t.classList.remove('active'));
        dom.tabPanes.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const targetPane = document.getElementById(tab.getAttribute('data-tab'));
        if (targetPane) targetPane.classList.add('active');

        // Leaflet map refresh size if opened
        if (tab.getAttribute('data-tab') === 'run-screen' && state.leafletMap) {
          setTimeout(() => state.leafletMap.invalidateSize(), 200);
        }
      });
    });

    // Sound Toggle Button
    dom.audioToggleBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      dom.audioIcon.className = state.soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
      dom.audioToggleBtn.classList.toggle('active-glow', state.soundEnabled);
      showToast(state.soundEnabled ? '🔊 Đã bật âm thanh & Giọng nói' : '🔇 Đã tắt âm thanh', 'fa-volume-high');
      savePersistedData();
    });

    // Header Balance Click -> Go to Wallet tab
    dom.balanceWidget.addEventListener('click', () => {
      const walletTabBtn = document.getElementById('tab-wallet-btn');
      if (walletTabBtn) walletTabBtn.click();
    });

    // Mode Selector: Simulation vs GPS
    dom.modeSimBtn.addEventListener('click', () => {
      if (state.isRunning) {
        showToast('Vui lòng kết thúc buổi chạy hiện tại trước khi đổi chế độ!', 'fa-circle-info');
        return;
      }
      state.mode = 'sim';
      dom.modeSimBtn.classList.add('active');
      dom.modeGpsBtn.classList.remove('active');
      dom.simSpeedControls.classList.remove('hidden');
      dom.gpsInfoControls.classList.add('hidden');
      stopGpsTracking();
      updateTelemetryUI();
    });

    dom.modeGpsBtn.addEventListener('click', () => {
      if (state.isRunning) {
        showToast('Vui lòng kết thúc buổi chạy hiện tại trước khi đổi chế độ!', 'fa-circle-info');
        return;
      }
      state.mode = 'gps';
      dom.modeGpsBtn.classList.add('active');
      dom.modeSimBtn.classList.remove('active');
      dom.simSpeedControls.classList.add('hidden');
      dom.gpsInfoControls.classList.remove('hidden');
      startGpsTracking();
      updateTelemetryUI();
    });

    // Visualizer View Tabs (3D Track vs Map)
    dom.visTabTrack.addEventListener('click', () => {
      dom.visTabTrack.classList.add('active');
      dom.visTabMap.classList.remove('active');
      dom.trackVisContainer.classList.add('active');
      dom.mapVisContainer.classList.remove('active');
    });

    dom.visTabMap.addEventListener('click', () => {
      dom.visTabMap.classList.add('active');
      dom.visTabTrack.classList.remove('active');
      dom.mapVisContainer.classList.add('active');
      dom.trackVisContainer.classList.remove('active');
      if (state.leafletMap) {
        setTimeout(() => state.leafletMap.invalidateSize(), 150);
      }
    });

    // Route Select dropdown
    dom.routeSelect.addEventListener('change', (e) => {
      changeRoute(e.target.value);
    });

    // Speed Preset Buttons
    dom.speedPresetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.speedPresetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const speed = parseFloat(btn.getAttribute('data-speed'));
        state.currentSpeedKmh = speed;
        dom.simSpeedSlider.value = speed;
        dom.sliderSpeedVal.textContent = `${speed.toFixed(1)} km/h`;
        updateTelemetryUI();
      });
    });

    // Speed Slider
    dom.simSpeedSlider.addEventListener('input', (e) => {
      const speed = parseFloat(e.target.value);
      state.currentSpeedKmh = speed;
      dom.sliderSpeedVal.textContent = `${speed.toFixed(1)} km/h`;
      dom.speedPresetBtns.forEach(b => b.classList.remove('active'));
      updateTelemetryUI();
    });

    // Run Buttons
    dom.btnStartRun.addEventListener('click', startRun);
    dom.btnPauseRun.addEventListener('click', pauseRun);
    dom.btnResumeRun.addEventListener('click', resumeRun);
    dom.btnStopRun.addEventListener('click', finishRun);

    // Modal Claim
    dom.modalBtnClaim.addEventListener('click', claimAndResetSession);

    // Shop Event Delegation
    dom.shoesShopGrid.addEventListener('click', (e) => {
      const buyBtn = e.target.closest('.btn-buy-shoe');
      const equipBtn = e.target.closest('.btn-equip-shoe');
      if (buyBtn) {
        handleShoeAction(buyBtn.getAttribute('data-shoe-id'));
      } else if (equipBtn) {
        handleShoeAction(equipBtn.getAttribute('data-shoe-id'));
      }
    });

    dom.buffsShopGrid.addEventListener('click', (e) => {
      const buffBtn = e.target.closest('.buff-price-btn');
      if (buffBtn) {
        handleBuffAction(buffBtn.getAttribute('data-buff-id'));
      }
    });

    // Wallet Cashout
    dom.btnCashoutAll.addEventListener('click', () => {
      dom.cashoutAmount.value = state.totalWalletVnd;
    });

    dom.quickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        dom.cashoutAmount.value = chip.getAttribute('data-val');
      });
    });

    dom.payMethodRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        document.querySelectorAll('.pay-method-btn').forEach(btn => btn.classList.remove('active'));
        radio.closest('.pay-method-btn').classList.add('active');
      });
    });

    dom.btnSubmitCashout.addEventListener('click', handleCashoutSubmit);

    // Receipt Modal Close
    dom.modalCloseReceipt.addEventListener('click', () => {
      dom.modalReceipt.classList.add('hidden');
    });
    dom.receiptDoneBtn.addEventListener('click', () => {
      dom.modalReceipt.classList.add('hidden');
    });

    // Clear History
    dom.btnClearHistory.addEventListener('click', () => {
      if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chạy không?')) {
        state.runHistory = [];
        renderRunHistory();
        savePersistedData();
        showToast('Đã xóa sạch lịch sử chạy!', 'fa-trash-can');
      }
    });
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================
  function init() {
    loadPersistedData();
    setupEventListeners();
    initCanvas();
    initLeafletMap();
    renderShop();
    renderAchievements();
    renderRunHistory();
    updateTelemetryUI();

    // Sound toggle state
    dom.audioIcon.className = state.soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    dom.audioToggleBtn.classList.toggle('active-glow', state.soundEnabled);

    console.log('RUN2EARN Web App initialized successfully! 1m = 100₫');
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
