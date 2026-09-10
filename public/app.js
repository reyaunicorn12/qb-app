// =========================================================
// 🏖️ KAHUNA BOWL - MAIN CLIENT APPLICATION
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  // App State
  const state = {
    serverInfo: null,
    categories: [],
    currentTossup: null,
    readingInterval: null,
    wordsList: [],
    currentWordIndex: 0,
    powerIndex: -1,
    isReading: false,
    isPaused: false,
    isBuzzed: false,
    isDead: false,
    buzzTimer: null,
    buzzSecondsLeft: 7.0,
    wpm: 260,
    
    // Solo Scores & Stats
    solo: {
      score: 0,
      powers: 0,
      tens: 0,
      negs: 0,
      bonusPts: 0,
      heard: 0,
      lastBuzzedBeforePower: false,
      lastAnswerAwarded: 0
    },

    // Hotseat 2-Player State
    hotseat: {
      team1Name: 'Team Coral Reef',
      team2Name: 'Team Wave Rider',
      team1Score: 0,
      team2Score: 0,
      currentTossup: null,
      readingInterval: null,
      wordsList: [],
      currentWordIndex: 0,
      powerIndex: -1,
      isReading: false,
      activeBuzzerTeam: null, // 1 or 2
      lockedOutTeams: new Set()
    },

    // Speed Drill State
    drill: {
      active: false,
      timer: null,
      secondsLeft: 60,
      score: 0,
      streak: 0,
      maxStreak: 0,
      currentQuestion: null
    }
  };

  // DOM Elements
  const els = {
    portDisplay: document.getElementById('portDisplay'),
    activePortGuide: document.getElementById('activePortGuide'),
    ambientWaveBtn: document.getElementById('ambientWaveBtn'),
    soundFxBtn: document.getElementById('soundFxBtn'),
    themeBtns: document.querySelectorAll('.theme-btn'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    toast: document.getElementById('toast'),

    // Solo Elements
    soloCategorySelect: document.getElementById('soloCategorySelect'),
    soloDiffSelect: document.getElementById('soloDiffSelect'),
    wpmSlider: document.getElementById('wpmSlider'),
    wpmValue: document.getElementById('wpmValue'),
    nextQuestionBtn: document.getElementById('nextQuestionBtn'),
    pauseResumeBtn: document.getElementById('pauseResumeBtn'),
    pauseResumeIcon: document.getElementById('pauseResumeIcon'),
    qCategoryTag: document.getElementById('qCategoryTag'),
    qSubTag: document.getElementById('qSubTag'),
    qDiffTag: document.getElementById('qDiffTag'),
    powerIndicator: document.getElementById('powerIndicator'),
    questionStream: document.getElementById('questionStream'),
    readingProgress: document.getElementById('readingProgress'),
    soloBuzzBtn: document.getElementById('soloBuzzBtn'),
    buzzTimerContainer: document.getElementById('buzzTimerContainer'),
    timerSeconds: document.getElementById('timerSeconds'),
    timerProgress: document.getElementById('timerProgress'),
    answerForm: document.getElementById('answerForm'),
    answerInput: document.getElementById('answerInput'),
    promptNotice: document.getElementById('promptNotice'),
    resultFeedbackBox: document.getElementById('resultFeedbackBox'),
    resultHeadline: document.getElementById('resultHeadline'),
    revealedAnswer: document.getElementById('revealedAnswer'),
    triviaExplanation: document.getElementById('triviaExplanation'),
    judgeAcceptBtn: document.getElementById('judgeAcceptBtn'),
    judgeRejectBtn: document.getElementById('judgeRejectBtn'),
    judgeForgiveBtn: document.getElementById('judgeForgiveBtn'),
    bonusSection: document.getElementById('bonusSection'),
    bonusLeadIn: document.getElementById('bonusLeadIn'),
    bonusPartsContainer: document.getElementById('bonusPartsContainer'),

    // Solo Scoreboard Sidebar
    soloScore: document.getElementById('soloScore'),
    countPowers: document.getElementById('countPowers'),
    countTens: document.getElementById('countTens'),
    countNegs: document.getElementById('countNegs'),
    countBonusPts: document.getElementById('countBonusPts'),
    heardCount: document.getElementById('heardCount'),
    powerRateDisplay: document.getElementById('powerRateDisplay'),
    ppthDisplay: document.getElementById('ppthDisplay'),
    bonusConvDisplay: document.getElementById('bonusConvDisplay'),
    saveScoreBtn: document.getElementById('saveScoreBtn'),
    resetSessionBtn: document.getElementById('resetSessionBtn'),

    // Hotseat Elements
    team1Name: document.getElementById('team1Name'),
    team2Name: document.getElementById('team2Name'),
    team1Score: document.getElementById('team1Score'),
    team2Score: document.getElementById('team2Score'),
    hotseatNextBtn: document.getElementById('hotseatNextBtn'),
    hotseatLockoutStatus: document.getElementById('hotseatLockoutStatus'),
    hotseatStream: document.getElementById('hotseatStream'),
    buzzTeam1Btn: document.getElementById('buzzTeam1Btn'),
    buzzTeam2Btn: document.getElementById('buzzTeam2Btn'),
    hotseatAnswerSection: document.getElementById('hotseatAnswerSection'),
    buzzerWho: document.getElementById('buzzerWho'),
    hotseatForm: document.getElementById('hotseatForm'),
    hotseatAnswerInput: document.getElementById('hotseatAnswerInput'),
    hotseatFeedback: document.getElementById('hotseatFeedback'),
    hotseatHeadline: document.getElementById('hotseatHeadline'),
    hotseatRevealedAns: document.getElementById('hotseatRevealedAns'),

    // Speed Drill Elements
    drillTimerDisplay: document.getElementById('drillTimerDisplay'),
    drillStreakDisplay: document.getElementById('drillStreakDisplay'),
    drillScoreDisplay: document.getElementById('drillScoreDisplay'),
    drillStartPanel: document.getElementById('drillStartPanel'),
    startDrillBtn: document.getElementById('startDrillBtn'),
    drillActivePanel: document.getElementById('drillActivePanel'),
    drillCategoryTag: document.getElementById('drillCategoryTag'),
    drillClueText: document.getElementById('drillClueText'),
    drillForm: document.getElementById('drillForm'),
    drillInput: document.getElementById('drillInput'),
    drillPassBtn: document.getElementById('drillPassBtn'),
    drillFeedback: document.getElementById('drillFeedback'),
    drillGameOverPanel: document.getElementById('drillGameOverPanel'),
    drillFinalScore: document.getElementById('drillFinalScore'),
    drillMaxStreak: document.getElementById('drillMaxStreak'),
    drillRetryBtn: document.getElementById('drillRetryBtn'),

    // Question Bank Elements
    addQuestionForm: document.getElementById('addQuestionForm'),
    totalQuestionsCount: document.getElementById('totalQuestionsCount'),
    librarySearchInput: document.getElementById('librarySearchInput'),
    questionsList: document.getElementById('questionsList'),
    importJsonFile: document.getElementById('importJsonFile'),

    // Stats Elements
    leaderboardBody: document.getElementById('leaderboardBody'),
    categoryStatsGrid: document.getElementById('categoryStatsGrid'),

    // Modal
    saveScoreModal: document.getElementById('saveScoreModal'),
    modalFinalScore: document.getElementById('modalFinalScore'),
    modalFinalPowers: document.getElementById('modalFinalPowers'),
    modalPlayerName: document.getElementById('modalPlayerName'),
    modalConfirmBtn: document.getElementById('modalConfirmBtn'),
    modalCancelBtn: document.getElementById('modalCancelBtn')
  };

  // =========================================================
  // INITIALIZATION & SERVER FETCHING
  // =========================================================
  async function initApp() {
    try {
      const res = await fetch('/api/info');
      const data = await res.json();
      state.serverInfo = data;
      
      // Update port displays
      if (data.port) {
        els.portDisplay.textContent = data.port;
        if (els.activePortGuide) {
          els.activePortGuide.textContent = data.port;
        }
      }
    } catch (e) {
      console.warn('Could not fetch server info:', e);
    }

    await loadCategories();
    await loadQuestionsLibrary();
    await loadLeaderboard();
    setupEventListeners();
  }

  async function loadCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      state.categories = data.categories || [];

      // Populate Solo Category Select
      els.soloCategorySelect.innerHTML = '<option value="All">🌴 All Categories (Mixed Reef)</option>';
      data.categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.name;
        opt.textContent = `${cat.name} (${cat.count})`;
        els.soloCategorySelect.appendChild(opt);
      });

      // Populate Stats Category Badges
      els.categoryStatsGrid.innerHTML = '';
      data.categories.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'category-badge-card';
        card.innerHTML = `
          <div class="cat-name">${cat.name}</div>
          <div class="cat-count">${cat.count}</div>
          <small>Questions</small>
        `;
        els.categoryStatsGrid.appendChild(card);
      });
    } catch (e) {
      console.error('Error loading categories:', e);
    }
  }

  // =========================================================
  // TOAST NOTIFICATIONS
  // =========================================================
  function showToast(msg, duration = 3000) {
    els.toast.textContent = msg;
    els.toast.classList.remove('hidden');
    setTimeout(() => {
      els.toast.classList.add('hidden');
    }, duration);
  }

  // =========================================================
  // SOLO MODE LOGIC (PROTOBOWL STREAMER)
  // =========================================================
  
  function parseTossupText(fullText) {
    // Look for (*) power marker
    const powerMarker = '(*)';
    let rawText = fullText;
    let powerWordIdx = -1;

    if (rawText.includes(powerMarker)) {
      const parts = rawText.split(powerMarker);
      const prePowerWords = parts[0].trim().split(/\s+/).filter(Boolean);
      const postPowerWords = parts[1].trim().split(/\s+/).filter(Boolean);
      powerWordIdx = prePowerWords.length;
      return {
        words: [...prePowerWords, ...postPowerWords],
        powerIndex: powerWordIdx
      };
    } else {
      return {
        words: rawText.trim().split(/\s+/).filter(Boolean),
        powerIndex: -1
      };
    }
  }

  async function fetchRandomTossup() {
    const category = els.soloCategorySelect.value;
    const difficulty = els.soloDiffSelect.value;
    const url = `/api/random-tossup?category=${encodeURIComponent(category)}&difficulty=${encodeURIComponent(difficulty)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('No question returned');
      const question = await res.json();
      return question;
    } catch (e) {
      showToast('⚠️ No more questions match this filter!');
      return null;
    }
  }

  async function startSoloQuestion() {
    clearInterval(state.readingInterval);
    clearInterval(state.buzzTimer);

    // Hide previous feedback
    els.resultFeedbackBox.classList.add('hidden');
    els.bonusSection.classList.add('hidden');
    els.answerForm.classList.add('hidden');
    els.buzzTimerContainer.classList.add('hidden');
    els.promptNotice.classList.add('hidden');
    els.promptNotice.textContent = '';
    els.answerInput.value = '';

    const q = await fetchRandomTossup();
    if (!q) return;

    state.currentTossup = q;
    state.solo.heard++;
    updateSoloScoreboard();

    // Setup UI tags
    els.qCategoryTag.textContent = q.category || 'General';
    els.qSubTag.textContent = q.subcategory || 'Trivia';
    els.qDiffTag.textContent = q.difficulty || 'Regular';

    // Parse words & power
    const parsed = parseTossupText(q.question);
    state.wordsList = parsed.words;
    state.powerIndex = parsed.powerIndex;
    state.currentWordIndex = 0;
    state.isReading = true;
    state.isPaused = false;
    state.isBuzzed = false;
    state.isDead = false;

    els.powerIndicator.classList.remove('dead');
    els.powerIndicator.innerHTML = '<span class="power-star">⭐</span><span class="power-text">POWER ZONE (+15)</span>';
    els.soloBuzzBtn.disabled = false;
    els.pauseResumeBtn.disabled = false;
    els.pauseResumeIcon.textContent = '⏸️ Pause';

    renderStreamedWords();
    startStreamLoop();
  }

  function startStreamLoop() {
    clearInterval(state.readingInterval);
    const msPerWord = Math.round((60 / state.wpm) * 1000);

    state.readingInterval = setInterval(() => {
      if (state.isPaused || state.isBuzzed || state.isDead) return;

      if (state.currentWordIndex < state.wordsList.length) {
        state.currentWordIndex++;
        renderStreamedWords();

        // Check if power passed
        if (state.powerIndex !== -1 && state.currentWordIndex > state.powerIndex) {
          els.powerIndicator.classList.add('dead');
          els.powerIndicator.innerHTML = '<span class="power-star">🌊</span><span class="power-text">REGULAR ZONE (+10)</span>';
        }

        // Progress bar
        const pct = (state.currentWordIndex / state.wordsList.length) * 100;
        els.readingProgress.style.width = `${pct}%`;
      } else {
        // Question finished reading
        clearInterval(state.readingInterval);
        state.isDead = true;
        els.powerIndicator.classList.add('dead');
        els.powerIndicator.innerHTML = '<span class="power-star">🏖️</span><span class="power-text">END OF QUESTION (0 / +10)</span>';
      }
    }, msPerWord);
  }

  function renderStreamedWords() {
    let html = '';
    for (let i = 0; i < state.currentWordIndex; i++) {
      const isPowerWord = (state.powerIndex !== -1 && i < state.powerIndex);
      const cls = isPowerWord ? 'stream-word-power' : 'stream-word-normal';
      html += `<span class="${cls}">${state.wordsList[i]}</span> `;
    }
    els.questionStream.innerHTML = html || '<em>Reading started...</em>';
  }

  function triggerSoloBuzz() {
    if (!state.currentTossup || state.isBuzzed) return;

    state.isBuzzed = true;
    clearInterval(state.readingInterval);

    // Check if in power zone
    state.solo.lastBuzzedBeforePower = (state.powerIndex !== -1 && state.currentWordIndex <= state.powerIndex);

    window.beachAudio.playBuzzerSound();

    // Disable buzz button & show answer input
    els.soloBuzzBtn.disabled = true;
    els.answerForm.classList.remove('hidden');
    els.buzzTimerContainer.classList.remove('hidden');
    els.answerInput.value = '';
    els.answerInput.focus();

    // Start 7s countdown
    state.buzzSecondsLeft = 7.0;
    els.timerSeconds.textContent = '7.0s';
    els.timerProgress.style.width = '100%';

    clearInterval(state.buzzTimer);
    const tickMs = 100;
    state.buzzTimer = setInterval(() => {
      state.buzzSecondsLeft -= (tickMs / 1000);
      if (state.buzzSecondsLeft <= 0) {
        clearInterval(state.buzzTimer);
        state.buzzSecondsLeft = 0;
        els.timerSeconds.textContent = '0.0s';
        els.timerProgress.style.width = '0%';
        handleSoloTimeOut();
      } else {
        els.timerSeconds.textContent = `${state.buzzSecondsLeft.toFixed(1)}s`;
        const pct = (state.buzzSecondsLeft / 7.0) * 100;
        els.timerProgress.style.width = `${pct}%`;
      }
    }, tickMs);
  }

  async function handleSoloAnswerSubmit(userAns) {
    clearInterval(state.buzzTimer);
    els.buzzTimerContainer.classList.add('hidden');
    els.answerForm.classList.add('hidden');

    const q = state.currentTossup;
    if (!q) return;

    try {
      const res = await fetch('/api/check-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAnswer: userAns,
          primaryAnswer: q.answer,
          accept: q.accept,
          promptOn: q.promptOn
        })
      });

      const check = await res.json();

      if (check.prompt) {
        // Prompt situation - give player another chance
        els.answerForm.classList.remove('hidden');
        els.buzzTimerContainer.classList.remove('hidden');
        els.promptNotice.textContent = check.message || 'Prompt: Please be more specific!';
        els.promptNotice.classList.remove('hidden');
        els.answerInput.focus();
        // Reset timer to 4s for prompt
        state.buzzSecondsLeft = 4.0;
        state.buzzTimer = setInterval(() => {
          state.buzzSecondsLeft -= 0.1;
          if (state.buzzSecondsLeft <= 0) {
            clearInterval(state.buzzTimer);
            handleSoloAnswerSubmit('__PROMPT_TIMEOUT__');
          } else {
            els.timerSeconds.textContent = `${state.buzzSecondsLeft.toFixed(1)}s`;
            els.timerProgress.style.width = `${(state.buzzSecondsLeft / 4.0) * 100}%`;
          }
        }, 100);
        return;
      }

      if (check.correct) {
        // CORRECT ANSWER!
        let pts = 10;
        let isPower = state.solo.lastBuzzedBeforePower;

        if (isPower) {
          pts = 15;
          state.solo.powers++;
          window.beachAudio.playPowerChime();
        } else {
          state.solo.tens++;
          window.beachAudio.playTenChime();
        }

        state.solo.score += pts;
        state.solo.lastAnswerAwarded = pts;

        showFeedback(true, isPower ? '⭐ POWER! (+15 Points)' : '✅ CORRECT! (+10 Points)', isPower ? 'correct-power' : 'correct-ten');
        
        // Show full remaining question
        state.currentWordIndex = state.wordsList.length;
        renderStreamedWords();

        // Check if bonus is available
        if (q.bonus && q.bonus.parts && q.bonus.parts.length > 0) {
          renderBonusSection(q.bonus);
        }

      } else {
        // INCORRECT ANSWER
        let neg = (!state.isDead); // Neg only if question was not finished reading
        let pts = neg ? -5 : 0;
        
        if (neg) {
          state.solo.negs++;
          state.solo.score -= 5;
          window.beachAudio.playNegBonk();
        }

        state.solo.lastAnswerAwarded = pts;
        showFeedback(false, neg ? '🥥 NEG! Incorrect buzz during reading (-5 Points)' : '🌊 INCORRECT (0 Points)', neg ? 'incorrect-neg' : 'incorrect-zero');

        // Reveal full text
        state.currentWordIndex = state.wordsList.length;
        renderStreamedWords();
      }

      updateSoloScoreboard();

    } catch (e) {
      console.error('Check answer error:', e);
    }
  }

  function handleSoloTimeOut() {
    window.beachAudio.playNegBonk();
    const neg = (!state.isDead);
    if (neg) {
      state.solo.negs++;
      state.solo.score -= 5;
    }
    showFeedback(false, neg ? '⏳ TIME EXPIRED! Neg penalty (-5 Points)' : '⏳ TIME EXPIRED (0 Points)', 'incorrect-neg');
    state.currentWordIndex = state.wordsList.length;
    renderStreamedWords();
    updateSoloScoreboard();
  }

  function showFeedback(correct, headlineText, boxClass) {
    const q = state.currentTossup;
    els.resultFeedbackBox.className = `result-box ${boxClass}`;
    els.resultHeadline.textContent = headlineText;
    els.revealedAnswer.textContent = q.answer;
    els.triviaExplanation.textContent = q.explanation || '';
    els.resultFeedbackBox.classList.remove('hidden');
  }

  // Render 3-Part Bonus
  function renderBonusSection(bonus) {
    els.bonusLeadIn.textContent = bonus.leadIn || 'For 10 points each:';
    els.bonusPartsContainer.innerHTML = '';

    bonus.parts.forEach((part, idx) => {
      const item = document.createElement('div');
      item.className = 'bonus-part-item';
      item.innerHTML = `
        <p class="bonus-prompt-text"><strong>Part ${idx + 1} [10 pts]:</strong> ${part.prompt}</p>
        <div class="bonus-ans-row">
          <input type="text" class="tiki-input bonus-part-input" data-idx="${idx}" placeholder="Your answer for part ${idx + 1}...">
          <button class="tiki-btn tiki-btn-gold bonus-part-submit" data-idx="${idx}">Submit 🏖️</button>
        </div>
        <div class="bonus-part-result hidden" id="bonusPartRes-${idx}"></div>
      `;
      els.bonusPartsContainer.appendChild(item);
    });

    els.bonusSection.classList.remove('hidden');

    // Attach bonus check handlers
    document.querySelectorAll('.bonus-part-submit').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        const input = document.querySelector(`.bonus-part-input[data-idx="${idx}"]`);
        const userAns = input.value.trim();
        const part = bonus.parts[idx];
        const resDiv = document.getElementById(`bonusPartRes-${idx}`);

        btn.disabled = true;
        input.disabled = true;

        const res = await fetch('/api/check-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userAnswer: userAns,
            primaryAnswer: part.answer,
            accept: part.accept
          })
        });

        const check = await res.json();
        resDiv.classList.remove('hidden');

        if (check.correct) {
          window.beachAudio.playTenChime();
          state.solo.score += 10;
          state.solo.bonusPts += 10;
          resDiv.innerHTML = `<span style="color:#059669">✅ CORRECT (+10 pts)! Answer: ${part.answer}</span>`;
        } else {
          resDiv.innerHTML = `<span style="color:#dc2626">❌ Missed (0 pts). Official: ${part.answer}</span>`;
        }

        updateSoloScoreboard();
      });
    });
  }

  function updateSoloScoreboard() {
    els.soloScore.textContent = state.solo.score;
    els.countPowers.textContent = state.solo.powers;
    els.countTens.textContent = state.solo.tens;
    els.countNegs.textContent = state.solo.negs;
    els.countBonusPts.textContent = state.solo.bonusPts;
    els.heardCount.textContent = state.solo.heard;

    // Computed rates
    const powerRate = state.solo.heard > 0 ? ((state.solo.powers / state.solo.heard) * 100).toFixed(0) : '0';
    els.powerRateDisplay.textContent = `${powerRate}%`;

    const ppth = state.solo.heard > 0 ? (state.solo.score / state.solo.heard).toFixed(1) : '0.0';
    els.ppthDisplay.textContent = ppth;

    const correctTossups = state.solo.powers + state.solo.tens;
    const maxBonus = correctTossups * 30;
    const bonusConv = maxBonus > 0 ? ((state.solo.bonusPts / maxBonus) * 100).toFixed(0) : '0';
    els.bonusConvDisplay.textContent = `${bonusConv}%`;
  }

  // Judge Overrule
  function applyJudgeOverride(type) {
    if (!state.currentTossup) return;

    // Rollback last answer
    state.solo.score -= state.solo.lastAnswerAwarded;

    if (type === 'accept') {
      let isPower = state.solo.lastBuzzedBeforePower;
      let pts = isPower ? 15 : 10;
      state.solo.score += pts;
      state.solo.lastAnswerAwarded = pts;
      showFeedback(true, `👨‍⚖️ Judge Overruled: ACCEPTED (${isPower ? '+15 Power' : '+10'})`, isPower ? 'correct-power' : 'correct-ten');
      window.beachAudio.playTenChime();
    } else if (type === 'reject') {
      let neg = (!state.isDead);
      let pts = neg ? -5 : 0;
      state.solo.score += pts;
      state.solo.lastAnswerAwarded = pts;
      showFeedback(false, `👨‍⚖️ Judge Overruled: REJECTED (${pts} pts)`, 'incorrect-neg');
    } else if (type === 'forgive') {
      state.solo.lastAnswerAwarded = 0;
      showFeedback(false, `👨‍⚖️ Judge Overruled: Neg Forgiven (0 pts)`, 'incorrect-zero');
    }

    updateSoloScoreboard();
  }

  // =========================================================
  // HOTSEAT 2-PLAYER CLASH MODE
  // =========================================================
  
  async function startHotseatQuestion() {
    clearInterval(state.hotseat.readingInterval);

    els.hotseatFeedback.classList.add('hidden');
    els.hotseatAnswerSection.classList.add('hidden');
    els.hotseatAnswerInput.value = '';

    const q = await fetchRandomTossup();
    if (!q) return;

    state.hotseat.currentTossup = q;
    state.hotseat.activeBuzzerTeam = null;
    state.hotseat.lockedOutTeams.clear();

    const parsed = parseTossupText(q.question);
    state.hotseat.wordsList = parsed.words;
    state.hotseat.powerIndex = parsed.powerIndex;
    state.hotseat.currentWordIndex = 0;
    state.hotseat.isReading = true;

    els.hotseatLockoutStatus.className = 'lockout-badge';
    els.hotseatLockoutStatus.textContent = 'READY TO BUZZ';
    els.buzzTeam1Btn.disabled = false;
    els.buzzTeam2Btn.disabled = false;

    renderHotseatWords();

    const msPerWord = Math.round((60 / state.wpm) * 1000);
    state.hotseat.readingInterval = setInterval(() => {
      if (state.hotseat.activeBuzzerTeam) return;

      if (state.hotseat.currentWordIndex < state.hotseat.wordsList.length) {
        state.hotseat.currentWordIndex++;
        renderHotseatWords();
      } else {
        clearInterval(state.hotseat.readingInterval);
      }
    }, msPerWord);
  }

  function renderHotseatWords() {
    let html = '';
    for (let i = 0; i < state.hotseat.currentWordIndex; i++) {
      html += `<span>${state.hotseat.wordsList[i]}</span> `;
    }
    els.hotseatStream.innerHTML = html || '<em>Hotseat tossup reading...</em>';
  }

  function triggerHotseatBuzz(teamNumber) {
    if (!state.hotseat.currentTossup || state.hotseat.activeBuzzerTeam) return;
    if (state.hotseat.lockedOutTeams.has(teamNumber)) return;

    state.hotseat.activeBuzzerTeam = teamNumber;
    window.beachAudio.playBuzzerSound();

    const teamName = teamNumber === 1 ? els.team1Name.value : els.team2Name.value;
    els.buzzerWho.textContent = `🏄 ${teamName} BUZZED IN!`;

    els.hotseatLockoutStatus.className = 'lockout-badge locked';
    els.hotseatLockoutStatus.textContent = `LOCKED: ${teamName}`;

    els.buzzTeam1Btn.disabled = true;
    els.buzzTeam2Btn.disabled = true;
    els.hotseatAnswerSection.classList.remove('hidden');
    els.hotseatAnswerInput.value = '';
    els.hotseatAnswerInput.focus();
  }

  async function handleHotseatAnswerSubmit(userAns) {
    const q = state.hotseat.currentTossup;
    const team = state.hotseat.activeBuzzerTeam;
    if (!q || !team) return;

    els.hotseatAnswerSection.classList.add('hidden');

    try {
      const res = await fetch('/api/check-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAnswer: userAns,
          primaryAnswer: q.answer,
          accept: q.accept
        })
      });

      const check = await res.json();
      const teamName = team === 1 ? els.team1Name.value : els.team2Name.value;

      if (check.correct) {
        let isPower = (state.hotseat.powerIndex !== -1 && state.hotseat.currentWordIndex <= state.hotseat.powerIndex);
        let pts = isPower ? 15 : 10;
        
        if (team === 1) state.hotseat.team1Score += pts;
        else state.hotseat.team2Score += pts;

        if (isPower) window.beachAudio.playPowerChime();
        else window.beachAudio.playTenChime();

        els.hotseatHeadline.textContent = `✅ ${teamName} scored ${pts} points!`;
        els.hotseatRevealedAns.textContent = q.answer;
        els.hotseatFeedback.classList.remove('hidden');

        // Reveal all words
        state.hotseat.currentWordIndex = state.hotseat.wordsList.length;
        renderHotseatWords();
        updateHotseatScores();

      } else {
        // Neg penalty
        let isReading = (state.hotseat.currentWordIndex < state.hotseat.wordsList.length);
        let pts = isReading ? -5 : 0;

        if (team === 1) state.hotseat.team1Score += pts;
        else state.hotseat.team2Score += pts;

        window.beachAudio.playNegBonk();

        state.hotseat.lockedOutTeams.add(team);
        state.hotseat.activeBuzzerTeam = null;

        // If both teams locked out, reveal answer
        if (state.hotseat.lockedOutTeams.size >= 2) {
          els.hotseatHeadline.textContent = `❌ Both teams missed! (0 pts)`;
          els.hotseatRevealedAns.textContent = q.answer;
          els.hotseatFeedback.classList.remove('hidden');
          state.hotseat.currentWordIndex = state.hotseat.wordsList.length;
          renderHotseatWords();
        } else {
          // Re-enable for the other team
          els.hotseatLockoutStatus.textContent = 'REBOUND AVAILABLE';
          if (!state.hotseat.lockedOutTeams.has(1)) els.buzzTeam1Btn.disabled = false;
          if (!state.hotseat.lockedOutTeams.has(2)) els.buzzTeam2Btn.disabled = false;
        }

        updateHotseatScores();
      }
    } catch (e) {
      console.error(e);
    }
  }

  function updateHotseatScores() {
    els.team1Score.textContent = state.hotseat.team1Score;
    els.team2Score.textContent = state.hotseat.team2Score;
  }

  // =========================================================
  // SPEED DRILL MODE
  // =========================================================
  
  function startDrill() {
    state.drill.active = true;
    state.drill.secondsLeft = 60;
    state.drill.score = 0;
    state.drill.streak = 0;
    state.drill.maxStreak = 0;

    els.drillStartPanel.classList.add('hidden');
    els.drillGameOverPanel.classList.add('hidden');
    els.drillActivePanel.classList.remove('hidden');

    updateDrillStats();
    nextDrillQuestion();

    clearInterval(state.drill.timer);
    state.drill.timer = setInterval(() => {
      state.drill.secondsLeft--;
      els.drillTimerDisplay.textContent = `${state.drill.secondsLeft}s`;

      if (state.drill.secondsLeft <= 0) {
        clearInterval(state.drill.timer);
        endDrill();
      }
    }, 1000);
  }

  async function nextDrillQuestion() {
    els.drillFeedback.textContent = '';
    els.drillInput.value = '';
    els.drillInput.focus();

    const q = await fetchRandomTossup();
    if (!q) return;

    state.drill.currentQuestion = q;
    els.drillCategoryTag.textContent = q.category || 'Science';
    
    // In drill mode, show the first sentence as a fast power-clue!
    const sentences = q.question.split('.');
    const clue = sentences.slice(0, 2).join('.') + '...';
    els.drillClueText.textContent = clue;
  }

  async function handleDrillAnswer(userAns) {
    const q = state.drill.currentQuestion;
    if (!q) return;

    const res = await fetch('/api/check-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAnswer: userAns,
        primaryAnswer: q.answer,
        accept: q.accept
      })
    });

    const check = await res.json();

    if (check.correct) {
      state.drill.streak++;
      if (state.drill.streak > state.drill.maxStreak) {
        state.drill.maxStreak = state.drill.streak;
      }
      const streakBonus = Math.min(state.drill.streak * 5, 25);
      const earned = 15 + streakBonus;
      state.drill.score += earned;

      window.beachAudio.playPowerChime();
      els.drillFeedback.innerHTML = `<span style="color:#059669">⭐ YES! +${earned} pts (Streak: ${state.drill.streak}x)</span>`;
    } else {
      state.drill.streak = 0;
      window.beachAudio.playNegBonk();
      els.drillFeedback.innerHTML = `<span style="color:#dc2626">❌ Missed! Was: ${q.answer}</span>`;
    }

    updateDrillStats();
    setTimeout(() => {
      if (state.drill.active) nextDrillQuestion();
    }, 800);
  }

  function updateDrillStats() {
    els.drillScoreDisplay.textContent = state.drill.score;
    els.drillStreakDisplay.textContent = `${state.drill.streak}x`;
  }

  function endDrill() {
    state.drill.active = false;
    els.drillActivePanel.classList.add('hidden');
    els.drillGameOverPanel.classList.remove('hidden');
    els.drillFinalScore.textContent = state.drill.score;
    els.drillMaxStreak.textContent = state.drill.maxStreak;
  }

  // =========================================================
  // QUESTION BANK & CABANA BUILDER
  // =========================================================
  
  async function loadQuestionsLibrary(searchTerm = '') {
    try {
      const url = searchTerm ? `/api/questions?search=${encodeURIComponent(searchTerm)}` : '/api/questions';
      const res = await fetch(url);
      const data = await res.json();

      els.totalQuestionsCount.textContent = data.total || 0;
      els.questionsList.innerHTML = '';

      if (data.questions.length === 0) {
        els.questionsList.innerHTML = '<div style="padding:1rem;color:var(--text-muted)">No questions found.</div>';
        return;
      }

      data.questions.forEach(q => {
        const item = document.createElement('div');
        item.className = 'q-list-item';
        item.innerHTML = `
          <div class="q-item-header">
            <span class="tag tag-category">${q.category}</span>
            <span class="tag tag-diff">${q.difficulty}</span>
          </div>
          <p class="q-item-title">${q.question.substring(0, 110)}...</p>
          <div class="q-item-ans">🔑 ${q.answer}</div>
        `;
        els.questionsList.appendChild(item);
      });
    } catch (e) {
      console.error('Error loading library:', e);
    }
  }

  async function handleAddQuestion(e) {
    e.preventDefault();
    const payload = {
      category: document.getElementById('newCategory').value,
      difficulty: document.getElementById('newDifficulty').value,
      subcategory: document.getElementById('newSubcategory').value,
      question: document.getElementById('newQuestionText').value,
      answer: document.getElementById('newAnswer').value,
      accept: document.getElementById('newAccept').value,
      promptOn: document.getElementById('newPromptOn').value,
      explanation: document.getElementById('newExplanation').value
    };

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('🌺 Custom Question added to Bank!');
        els.addQuestionForm.reset();
        await loadCategories();
        await loadQuestionsLibrary();
      }
    } catch (err) {
      showToast('❌ Error adding question');
    }
  }

  // =========================================================
  // HIGH SCORES & LEADERBOARD
  // =========================================================
  async function loadLeaderboard() {
    try {
      const res = await fetch('/api/scores');
      const scores = await res.json();

      els.leaderboardBody.innerHTML = '';
      if (scores.length === 0) {
        els.leaderboardBody.innerHTML = '<tr><td colspan="7">No records yet! Be the first Beach Kahuna.</td></tr>';
        return;
      }

      scores.forEach((s, idx) => {
        const tr = document.createElement('tr');
        const dateStr = new Date(s.date).toLocaleDateString();
        tr.innerHTML = `
          <td><strong>#${idx + 1}</strong></td>
          <td>${s.playerName}</td>
          <td><strong style="color:#0284c7">${s.score}</strong></td>
          <td>${s.powers || 0}</td>
          <td>${s.tens || 0}</td>
          <td>${s.negs || 0}</td>
          <td><small>${dateStr}</small></td>
        `;
        els.leaderboardBody.appendChild(tr);
      });
    } catch (e) {
      console.error(e);
    }
  }

  async function saveMatchScore(playerName) {
    const payload = {
      playerName: playerName || 'Beachcomber',
      score: state.solo.score,
      powers: state.solo.powers,
      tens: state.solo.tens,
      negs: state.solo.negs,
      bonuses: state.solo.bonusPts,
      totalTossups: state.solo.heard,
      mode: 'Solo'
    };

    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('🏆 High score registered to the Leaderboard!');
        els.saveScoreModal.classList.add('hidden');
        await loadLeaderboard();
      }
    } catch (e) {
      showToast('❌ Error saving score');
    }
  }

  // =========================================================
  // EVENT LISTENERS & SHORTCUTS
  // =========================================================
  function setupEventListeners() {
    // Theme switching
    els.themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        els.themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const theme = btn.dataset.theme;
        document.body.className = theme;
      });
    });

    // Audio controls
    els.ambientWaveBtn.addEventListener('click', () => {
      const active = window.beachAudio.toggleOceanWaves();
      els.ambientWaveBtn.classList.toggle('active', active);
      showToast(active ? '🌊 Ocean wave sounds ON' : 'Ocean sounds OFF');
    });

    els.soundFxBtn.addEventListener('click', () => {
      window.beachAudio.sfxEnabled = !window.beachAudio.sfxEnabled;
      els.soundFxBtn.classList.toggle('active', window.beachAudio.sfxEnabled);
      showToast(window.beachAudio.sfxEnabled ? '🔊 SFX Enabled' : '🔇 SFX Muted');
    });

    // Tab navigation
    els.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        els.tabBtns.forEach(b => b.classList.remove('active'));
        els.tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        document.getElementById(tabId).classList.add('active');
      });
    });

    // Solo controls
    els.wpmSlider.addEventListener('input', (e) => {
      state.wpm = parseInt(e.target.value, 10);
      els.wpmValue.textContent = state.wpm;
    });

    els.nextQuestionBtn.addEventListener('click', startSoloQuestion);

    els.pauseResumeBtn.addEventListener('click', () => {
      state.isPaused = !state.isPaused;
      els.pauseResumeIcon.textContent = state.isPaused ? '▶️ Resume' : '⏸️ Pause';
    });

    els.soloBuzzBtn.addEventListener('click', triggerSoloBuzz);

    els.answerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const ans = els.answerInput.value.trim();
      if (ans) handleSoloAnswerSubmit(ans);
    });

    // Judge overrides
    els.judgeAcceptBtn.addEventListener('click', () => applyJudgeOverride('accept'));
    els.judgeRejectBtn.addEventListener('click', () => applyJudgeOverride('reject'));
    els.judgeForgiveBtn.addEventListener('click', () => applyJudgeOverride('forgive'));

    // Save & Reset match
    els.saveScoreBtn.addEventListener('click', () => {
      els.modalFinalScore.textContent = state.solo.score;
      els.modalFinalPowers.textContent = state.solo.powers;
      els.saveScoreModal.classList.remove('hidden');
    });

    els.modalConfirmBtn.addEventListener('click', () => {
      const name = els.modalPlayerName.value.trim();
      saveMatchScore(name);
    });

    els.modalCancelBtn.addEventListener('click', () => {
      els.saveScoreModal.classList.add('hidden');
    });

    els.resetSessionBtn.addEventListener('click', () => {
      if (confirm('Reset current match statistics to zero?')) {
        state.solo = {
          score: 0,
          powers: 0,
          tens: 0,
          negs: 0,
          bonusPts: 0,
          heard: 0,
          lastBuzzedBeforePower: false,
          lastAnswerAwarded: 0
        };
        updateSoloScoreboard();
        showToast('🔄 Match reset to zero!');
      }
    });

    // Hotseat controls
    els.hotseatNextBtn.addEventListener('click', startHotseatQuestion);
    els.buzzTeam1Btn.addEventListener('click', () => triggerHotseatBuzz(1));
    els.buzzTeam2Btn.addEventListener('click', () => triggerHotseatBuzz(2));

    els.hotseatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const ans = els.hotseatAnswerInput.value.trim();
      if (ans) handleHotseatAnswerSubmit(ans);
    });

    // Drill controls
    els.startDrillBtn.addEventListener('click', startDrill);
    els.drillRetryBtn.addEventListener('click', startDrill);

    els.drillForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const ans = els.drillInput.value.trim();
      if (ans) handleDrillAnswer(ans);
    });

    els.drillPassBtn.addEventListener('click', () => {
      handleDrillAnswer('__PASS__');
    });

    // Editor & Bank
    els.addQuestionForm.addEventListener('submit', handleAddQuestion);

    els.librarySearchInput.addEventListener('input', (e) => {
      loadQuestionsLibrary(e.target.value.trim());
    });

    // Import JSON pack
    els.importJsonFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const list = JSON.parse(event.target.result);
          const res = await fetch('/api/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questions: Array.isArray(list) ? list : (list.questions || []) })
          });
          const result = await res.json();
          showToast(`📥 Successfully imported ${result.added} questions!`);
          await loadCategories();
          await loadQuestionsLibrary();
        } catch (err) {
          showToast('❌ Invalid JSON question file');
        }
      };
      reader.readAsText(file);
    });

    // Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Don't intercept when user is typing in form inputs
      const isInputFocused = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

      // SPACEBAR
      if (e.code === 'Space' && !isInputFocused) {
        e.preventDefault();
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        if (activeTab === 'solo-tab') {
          if (!state.currentTossup || (!state.isReading && state.isDead)) {
            startSoloQuestion();
          } else if (!state.isBuzzed) {
            triggerSoloBuzz();
          }
        } else if (activeTab === 'hotseat-tab') {
          triggerHotseatBuzz(1);
        }
      }

      // HOTSEAT KEYS
      if (!isInputFocused) {
        if (e.key === 'a' || e.key === 'A') {
          triggerHotseatBuzz(1);
        } else if (e.key === 'l' || e.key === 'L') {
          triggerHotseatBuzz(2);
        }
      }

      // PAUSE (Escape or P)
      if ((e.key === 'Escape' || e.key === 'p' || e.key === 'P') && !isInputFocused) {
        state.isPaused = !state.isPaused;
        els.pauseResumeIcon.textContent = state.isPaused ? '▶️ Resume' : '⏸️ Pause';
      }
    });
  }

  // Initialize
  initApp();
});
