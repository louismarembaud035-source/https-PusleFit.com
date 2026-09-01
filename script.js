// ==================== GESTIONNAIRE DES ÉCRANS ====================
function showScreen(key) {
  const screens = {
    home: document.getElementById('home-screen'),
    tracker: document.getElementById('tracker-screen'),
    history: document.getElementById('history-screen'),
    settings: document.getElementById('settings-screen'),
    catalog: document.getElementById('catalog-screen'),
    quiz: document.getElementById('quiz-screen'),
    custom: document.getElementById('custom-screen'),
    nutrition: document.getElementById('nutrition-screen'),
    water: document.getElementById('water-screen'),
    evolution: document.getElementById('evolution-screen'),
    challenge: document.getElementById('challenge-screen'),
    detail: document.getElementById('detail-screen'),
    guided: document.getElementById('guided-screen')
  };

  Object.keys(screens).forEach(k => {
    const s = screens[k];
    if (s) {
      if (k === key) {
        s.classList.remove('hidden');
      } else {
        s.classList.add('hidden');
      }
    }
  });
  window.scrollTo(0, 0);
}

// ==================== ÉTAT GLOBAL & HISTORIQUE ====================
let userDailyGoal = parseInt(localStorage.getItem('pulsefit_cal_goal'), 10) || 2200;
let userCaloriesBurned = parseInt(localStorage.getItem('pulsefit_cal_burned'), 10) || 0;
let loggedFoods = JSON.parse(localStorage.getItem('pulsefit_logged_foods')) || [];
let favoriteFoods = JSON.parse(localStorage.getItem('pulsefit_fav_foods')) || ["riz_blanc", "poulet_grille", "banane", "skyr"];
let workoutHistory = JSON.parse(localStorage.getItem('pulsefit_workout_history')) || [];
let selectedFoodForPortion = null;
let currentTheme = localStorage.getItem('pulsefit_theme') || 'dark-pro';

const BADGES_CONFIG = [
  { id: "first_workout", name: "1er Entraînement", icon: "🥉", reqType: "workouts", reqVal: 1 },
  { id: "five_workouts", name: "Régulier (5 Séances)", icon: "🥈", reqType: "workouts", reqVal: 5 },
  { id: "ten_workouts", name: "Machine (10 Séances)", icon: "🥇", reqType: "workouts", reqVal: 10 },
  { id: "burn_1000", name: "1 000 kcal Brûlées", icon: "🔥", reqType: "burned", reqVal: 1000 },
  { id: "log_food", name: "Diète Carrée", icon: "🥗", reqType: "foods", reqVal: 3 },
  { id: "pong_champ", name: "Pong Master", icon: "🏓", reqType: "pong", reqVal: 5 },
  { id: "breath_zen", name: "Zen Master", icon: "🧘", reqType: "zen", reqVal: 1 },
  { id: "audio_fan", name: "Mélomane", icon: "🎧", reqType: "audio", reqVal: 1 }
];

function applyTheme(themeName) {
  currentTheme = themeName;
  localStorage.setItem('pulsefit_theme', themeName);
  document.body.className = `theme-${themeName}`;
  document.querySelectorAll('.theme-btn').forEach(btn => {
    if (btn.dataset.theme === themeName) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

function saveTrackerState() {
  localStorage.setItem('pulsefit_cal_goal', userDailyGoal);
  localStorage.setItem('pulsefit_cal_burned', userCaloriesBurned);
  localStorage.setItem('pulsefit_logged_foods', JSON.stringify(loggedFoods));
  localStorage.setItem('pulsefit_fav_foods', JSON.stringify(favoriteFoods));
  localStorage.setItem('pulsefit_workout_history', JSON.stringify(workoutHistory));
}

function updateTrackerUI() {
  const totalEaten = loggedFoods.reduce((acc, item) => acc + item.cal, 0);
  const remaining = userDailyGoal - totalEaten + userCaloriesBurned;

  const totalProt = loggedFoods.reduce((acc, item) => acc + parseFloat(item.prot), 0).toFixed(1);
  const totalGluc = loggedFoods.reduce((acc, item) => acc + parseFloat(item.gluc), 0).toFixed(1);
  const totalLip = loggedFoods.reduce((acc, item) => acc + parseFloat(item.lip), 0).toFixed(1);

  const goalEl = document.getElementById('tracker-goal-display');
  const eatenEl = document.getElementById('tracker-eaten-display');
  const burnedEl = document.getElementById('tracker-burned-display');
  const remainingEl = document.getElementById('tracker-remaining-display');
  const barFill = document.getElementById('tracker-progress-fill');

  if(goalEl) goalEl.textContent = userDailyGoal;
  if(eatenEl) eatenEl.textContent = totalEaten;
  if(burnedEl) burnedEl.textContent = userCaloriesBurned;
  if(remainingEl) {
    remainingEl.textContent = remaining;
    remainingEl.style.color = (remaining < 0) ? "var(--brand-rose)" : "var(--brand-primary)";
  }

  if(barFill) {
    const fillPercent = Math.min(100, Math.max(0, (totalEaten / (userDailyGoal + userCaloriesBurned)) * 100));
    barFill.style.width = `${fillPercent}%`;
    barFill.style.backgroundColor = (remaining < 0) ? "var(--brand-rose)" : "var(--brand-primary)";
  }

  const protVal = document.getElementById('macro-prot-val');
  const glucVal = document.getElementById('macro-gluc-val');
  const lipVal = document.getElementById('macro-lip-val');
  if(protVal) protVal.textContent = totalProt;
  if(glucVal) glucVal.textContent = totalGluc;
  if(lipVal) lipVal.textContent = totalLip;

  const protFill = document.getElementById('macro-prot-fill');
  const glucFill = document.getElementById('macro-gluc-fill');
  const lipFill = document.getElementById('macro-lip-fill');
  if(protFill) protFill.style.width = `${Math.min(100, (totalProt / 140) * 100)}%`;
  if(glucFill) glucFill.style.width = `${Math.min(100, (totalGluc / 250) * 100)}%`;
  if(lipFill) lipFill.style.width = `${Math.min(100, (totalLip / 70) * 100)}%`;

  const listEl = document.getElementById('logged-food-list');
  const countEl = document.getElementById('logged-items-count');
  
  if(listEl && countEl) {
    listEl.innerHTML = '';
    countEl.textContent = loggedFoods.length;

    if (loggedFoods.length === 0) {
      listEl.innerHTML = `<li style="color:var(--text-tertiary); justify-content:center;">Aucun aliment enregistré aujourd'hui.</li>`;
    } else {
      loggedFoods.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <div>
            <b>${item.nom}</b>
            <span style="font-size:11px; color:var(--text-secondary); display:block;">${item.displayQty} • P:${item.prot}g G:${item.gluc}g L:${item.lip}g</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-weight:700; color:var(--brand-cyan);">${item.cal} kcal</span>
            <button class="delete-food-btn" onclick="removeFoodItem(${index})" title="Supprimer">✕</button>
          </div>
        `;
        listEl.appendChild(li);
      });
    }
  }

  renderFavorites();
  renderWeeklyChart();
  renderBadges();
  renderHistory();
}

window.removeFoodItem = function(index) {
  loggedFoods.splice(index, 1);
  saveTrackerState();
  updateTrackerUI();
};

function renderFavorites() {
  const container = document.getElementById('favorites-list-container');
  if(!container) return;
  container.innerHTML = '';

  favoriteFoods.forEach(foodId => {
    const food = FOOD_DATABASE.find(f => f.id === foodId);
    if(food) {
      const chip = document.createElement('div');
      chip.className = 'fav-chip';
      chip.innerHTML = `<span>⭐ ${food.nom}</span>`;
      chip.onclick = () => {
        selectedFoodForPortion = food;
        const portionPanel = document.getElementById('food-portion-panel');
        const portionQtyInput = document.getElementById('portion-qty-input');
        const portionUnitLabel = document.getElementById('portion-unit-label');
        const nameEl = document.getElementById('portion-food-name');
        const macroEl = document.getElementById('portion-food-macros');

        if(nameEl) nameEl.textContent = food.nom;
        if(portionUnitLabel) portionUnitLabel.textContent = (food.unit === 'piece') ? "pièce(s)" : "grammes";
        if(portionQtyInput) {
          portionQtyInput.value = (food.unit === 'piece') ? 1 : 100;
          portionQtyInput.step = (food.unit === 'piece') ? 1 : 5;
        }
        if(macroEl) {
          const cal = (food.unit === 'piece') ? Math.round(food.cal * (food.standardWeight / 100)) : food.cal;
          macroEl.textContent = (food.unit === 'piece') ? `1 pièce (~${food.standardWeight}g) ≈ ${cal} kcal` : `100g = ${food.cal} kcal`;
        }
        if(portionPanel) portionPanel.classList.remove('hidden');
      };
      container.appendChild(chip);
    }
  });
}

function renderWeeklyChart() {
  const chart = document.getElementById('weekly-chart-bars');
  if(!chart) return;
  chart.innerHTML = '';

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const fullDaysNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const todayIdx = (new Date().getDay() + 6) % 7;

  days.forEach((day, idx) => {
    const isToday = (idx === todayIdx);
    const col = document.createElement('div');
    col.className = 'chart-col';
    col.style.cursor = 'pointer';

    const simulatedEaten = isToday ? loggedFoods.reduce((acc, i) => acc + i.cal, 0) : 2100 + (idx * 45) % 300;
    const simulatedBurned = isToday ? userCaloriesBurned : 350 + (idx * 60) % 250;
    const target = userDailyGoal;
    const success = simulatedEaten <= target + 200;

    col.innerHTML = `
      <div class="chart-bar-container">
        <div class="chart-bar-fill" style="height:${Math.min(100, Math.max(15, (simulatedEaten / target) * 100))}%; background:${isToday ? 'var(--brand-primary)' : 'var(--brand-cyan)'}"></div>
      </div>
      <span class="chart-day-label" style="color:${isToday ? 'var(--brand-primary)' : 'var(--text-tertiary)'}">${day}</span>
    `;

    col.onclick = () => {
      const detailBox = document.getElementById('day-detail-box');
      const detailTitle = document.getElementById('day-detail-title');
      const detailContent = document.getElementById('day-detail-content');

      if (detailBox && detailTitle && detailContent) {
        detailBox.classList.remove('hidden');
        detailTitle.textContent = `Bilan du ${fullDaysNames[idx]}`;
        detailContent.innerHTML = `Nourriture : <b>${simulatedEaten} kcal</b> • Sport : <b>+${simulatedBurned} kcal</b><br>Statut : <span style="color:${success ? 'var(--brand-primary)' : 'var(--brand-rose)'}; font-weight:700;">${success ? 'Objectif réussi 🎉' : 'Objectif dépassé ⚠️'}</span>`;
      }
    };

    chart.appendChild(col);
  });
}

function renderBadges() {
  const container = document.getElementById('badges-container');
  if(!container) return;
  container.innerHTML = '';

  const workoutsCount = workoutHistory.length;
  const burnedTotal = userCaloriesBurned;
  const foodsCount = loggedFoods.length;

  BADGES_CONFIG.forEach(badge => {
    let unlocked = false;
    if(badge.reqType === 'workouts' && workoutsCount >= badge.reqVal) unlocked = true;
    if(badge.reqType === 'burned' && burnedTotal >= badge.reqVal) unlocked = true;
    if(badge.reqType === 'foods' && foodsCount >= badge.reqVal) unlocked = true;
    if(badge.reqType === 'pong' || badge.reqType === 'zen' || badge.reqType === 'audio') unlocked = true;

    const div = document.createElement('div');
    div.className = `badge-item ${unlocked ? 'unlocked' : ''}`;
    div.innerHTML = `<span class="badge-icon">${badge.icon}</span><span class="badge-name">${badge.name}</span>`;
    container.appendChild(div);
  });
}

function renderHistory() {
  const list = document.getElementById('workout-history-list');
  if(!list) return;
  list.innerHTML = '';

  if(workoutHistory.length === 0) {
    list.innerHTML = `<li style="color:var(--text-tertiary); justify-content:center;">Aucune séance terminée pour le moment.</li>`;
    return;
  }

  workoutHistory.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <b>${item.titre}</b>
        <span style="font-size:11px; color:var(--text-secondary); display:block;">${item.date} • Durée : ${item.duree} min</span>
      </div>
      <span style="font-weight:700; color:var(--brand-primary);">+${item.calories} kcal</span>
    `;
    list.appendChild(li);
  });
}

// ==================== CATALOGUE ET RENDU ====================
let currentLocFilter = 'all';
let currentExoCountFilter = 'all';

function renderCatalog() {
  const grid = document.getElementById('catalog-grid');
  if(!grid) return;
  grid.innerHTML = '';

  const filtered = catalogue.filter(prog => {
    const matchLoc = (currentLocFilter === 'all' || prog.lieu === currentLocFilter);
    const count = prog.exos.length;
    let matchCount = true;
    if (currentExoCountFilter === 'express') matchCount = (count >= 3 && count <= 4);
    else if (currentExoCountFilter === 'medium') matchCount = (count >= 5 && count <= 6);
    else if (currentExoCountFilter === 'intense') matchCount = (count >= 7);
    return matchLoc && matchCount;
  });

  const countEl = document.getElementById('catalog-count');
  if(countEl) countEl.textContent = `${filtered.length} séance${filtered.length > 1 ? 's' : ''}`;

  filtered.forEach(prog => {
    const metrics = calculateWorkoutMetrics(prog.exos, prog.reposSerie, prog.reposExo);
    const card = document.createElement('div');
    card.className = 'session-card';
    card.innerHTML = `
      <div class="session-card-header"><span class="tag-badge">${prog.lieu}</span></div>
      <h4>${prog.titre}</h4>
      <p>${prog.desc}</p>
      <div class="session-card-footer">
        <span>⏱ ${metrics.minutes} min</span>
        <span>🔥 ~${metrics.calories} kcal</span>
        <span>🏋️ ${prog.exos.length} exos</span>
      </div>
    `;
    card.onclick = () => openDetailScreen(prog);
    grid.appendChild(card);
  });
}

// ==================== QCM ====================
let qIndex = 0;
let qAnswers = {};

function startQuiz() {
  qIndex = 0;
  qAnswers = {};
  const exoCountSlider = document.getElementById('exo-count-slider');
  const sliderValueDisplay = document.getElementById('slider-value-display');
  if(exoCountSlider) exoCountSlider.value = 5;
  if(sliderValueDisplay) sliderValueDisplay.textContent = '5';
  displayQuizStep();
}

function displayQuizStep() {
  const q = questions[qIndex];
  const stepCounter = document.getElementById('quiz-step-counter');
  const qTitle = document.getElementById('quiz-question-title');
  const progressBar = document.getElementById('quiz-progress-bar');
  const quizOptionsContainer = document.getElementById('quiz-options-container');
  const quizSliderContainer = document.getElementById('quiz-slider-container');

  if(stepCounter) stepCounter.textContent = `Étape ${qIndex + 1} / ${questions.length}`;
  if(qTitle) qTitle.textContent = q.titre;
  if(progressBar) progressBar.style.width = `${((qIndex + 1) / questions.length) * 100}%`;

  if (q.type === 'choice') {
    if(quizSliderContainer) quizSliderContainer.classList.add('hidden');
    if(quizOptionsContainer) {
      quizOptionsContainer.classList.remove('hidden');
      quizOptionsContainer.innerHTML = '';
      q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.textContent = opt.label;
        btn.onclick = () => {
          qAnswers[q.id] = opt.val;
          qIndex++;
          if (qIndex < questions.length) displayQuizStep();
          else finishQuiz();
        };
        quizOptionsContainer.appendChild(btn);
      });
    }
  } else if (q.type === 'slider') {
    if(quizOptionsContainer) quizOptionsContainer.classList.add('hidden');
    if(quizSliderContainer) quizSliderContainer.classList.remove('hidden');
  }
}

function finishQuiz() {
  const { lieu } = qAnswers;
  const match = catalogue.find(p => p.lieu === lieu) || catalogue[0];
  openDetailScreen(match);
}

const questions = [
  { id: "lieu", titre: "Où souhaites-tu t'entraîner ?", type: "choice", options: [{ label: "En salle de sport (Basic-Fit / Machines)", val: "salle" }, { label: "Dehors (Parc de Street Workout)", val: "street" }, { label: "À la maison (Sans équipement)", val: "maison" }] },
  { id: "objectif", titre: "Quel est ton objectif prioritaire ?", type: "choice", options: [{ label: "Haut du corps (Torse, dos, bras)", val: "haut" }, { label: "Bas du corps (Cuisses & fessiers)", val: "bas" }, { label: "Cardio & Dépense énergétique", val: "cardio" }] },
  { id: "niveau", titre: "Quel est ton niveau de pratique ?", type: "choice", options: [{ label: "Débutant (3-4 séries par exercice)", val: "debutant" }, { label: "Intermédiaire (4-5 séries par exercice)", val: "intermediaire" }, { label: "Confirmé / Volume élevé (6-8 séries)", val: "expert" }] },
  { id: "nbExos", titre: "Combien d'exercices veux-tu dans ta séance ?", type: "slider" }
];

// ==================== CRÉATEUR DE SÉANCE ====================
let customExosList = [];
function resetCustomForm() {
  customExosList = [];
  const title = document.getElementById('custom-title');
  const preview = document.getElementById('custom-preview-list');
  const count = document.getElementById('custom-count');
  if(title) title.value = '';
  if(preview) preview.innerHTML = '';
  if(count) count.textContent = '0';
}

// ==================== FICHE DÉTAIL SÉANCE ====================
let activeWorkout = null;

function updateDetailMetrics() {
  const setRestInput = document.getElementById('set-rest-input');
  const exoRestInput = document.getElementById('exo-rest-input');
  const reposSerie = parseInt(setRestInput ? setRestInput.value : 45, 10) || 45;
  const reposExo = parseInt(exoRestInput ? exoRestInput.value : 90, 10) || 90;

  if(!activeWorkout) return;
  activeWorkout.reposSerie = reposSerie;
  activeWorkout.reposExo = reposExo;

  const metrics = calculateWorkoutMetrics(activeWorkout.exos, reposSerie, reposExo);
  const timeEl = document.getElementById('detail-estimated-time');
  const calEl = document.getElementById('detail-calories');
  if(timeEl) timeEl.textContent = `${metrics.minutes} min`;
  if(calEl) calEl.textContent = metrics.calories;
}

function openDetailScreen(prog) {
  activeWorkout = JSON.parse(JSON.stringify(prog));
  showScreen('detail');

  const badge = document.getElementById('detail-badge');
  const title = document.getElementById('detail-title');
  const desc = document.getElementById('detail-desc');
  const totalExos = document.getElementById('detail-total-exos');
  const setRest = document.getElementById('set-rest-input');
  const exoRest = document.getElementById('exo-rest-input');

  if(badge) badge.textContent = (prog.lieu || 'STUDIO').toUpperCase();
  if(title) title.textContent = prog.titre;
  if(desc) desc.textContent = prog.desc;
  if(totalExos) totalExos.textContent = prog.exos.length;
  if(setRest) setRest.value = prog.reposSerie || 45;
  if(exoRest) exoRest.value = prog.reposExo || 90;

  const list = document.getElementById('detail-exercise-list');
  if(list) {
    list.innerHTML = '';
    prog.exos.forEach((e, idx) => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${idx + 1}. <b>${e.nom}</b></span> <span>${e.series} séries × ${e.reps}</span>`;
      list.appendChild(li);
    });
  }
  updateDetailMetrics();
}

// ==================== ENTRAÎNEUR GUIDÉ ====================
let currentExoIndex = 0;
let currentSetIndex = 1;
let restInterval = null;

function showWorkView() {
  stopCountdown();
  stopPongGame();
  stopBreathing();

  const workView = document.getElementById('work-view');
  const restView = document.getElementById('rest-view');
  const finishedView = document.getElementById('finished-view');

  if(restView) restView.classList.add('hidden');
  if(finishedView) finishedView.classList.add('hidden');
  if(workView) workView.classList.remove('hidden');

  if(!activeWorkout) return;
  const exo = activeWorkout.exos[currentExoIndex];
  const progressBadge = document.getElementById('live-progress-badge');
  const exoName = document.getElementById('live-exo-name');
  const setInfo = document.getElementById('live-set-info');
  const repsInfo = document.getElementById('live-reps-info');

  if(progressBadge) progressBadge.textContent = `Mouvement ${currentExoIndex + 1} sur ${activeWorkout.exos.length}`;
  if(exoName) exoName.textContent = exo.nom;
  if(setInfo) setInfo.textContent = `${currentSetIndex} / ${exo.series}`;
  if(repsInfo) repsInfo.textContent = exo.reps;
}

function startRestPeriod(seconds, message, nextPreviewText) {
  const workView = document.getElementById('work-view');
  const restView = document.getElementById('rest-view');
  if(workView) workView.classList.add('hidden');
  if(restView) restView.classList.remove('hidden');

  const msgEl = document.getElementById('rest-message');
  const prevEl = document.getElementById('next-preview');
  if(msgEl) msgEl.textContent = message;
  if(prevEl) prevEl.textContent = nextPreviewText;

  loadRandomRestQuiz();
  startBreathing();

  let remaining = seconds;
  updateCountdownDisplay(remaining);

  const timerDisplay = document.getElementById('countdown-display');
  if(timerDisplay) timerDisplay.classList.remove('urgent');

  restInterval = setInterval(() => {
    remaining--;
    updateCountdownDisplay(remaining);

    if (remaining <= 5 && remaining > 0) {
      if(timerDisplay) timerDisplay.classList.add('urgent');
      playCountdownBeep(remaining === 1 ? 880 : 587.33);
    }

    if (remaining <= 0) {
      stopCountdown();
      if(timerDisplay) timerDisplay.classList.remove('urgent');
      playRestEndChime();
      showWorkView();
    }
  }, 1000);
}

function updateCountdownDisplay(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const timerDisplay = document.getElementById('countdown-display');
  if(timerDisplay) {
    timerDisplay.textContent = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }
}

function stopCountdown() {
  if (restInterval) {
    clearInterval(restInterval);
    restInterval = null;
  }
}

function showFinishedView() {
  stopCountdown();
  stopPongGame();
  stopBreathing();
  
  const workView = document.getElementById('work-view');
  const restView = document.getElementById('rest-view');
  const finishedView = document.getElementById('finished-view');

  if(workView) workView.classList.add('hidden');
  if(restView) restView.classList.add('hidden');
  if(finishedView) finishedView.classList.remove('hidden');

  if(!activeWorkout) return;
  const metrics = calculateWorkoutMetrics(activeWorkout.exos, activeWorkout.reposSerie, activeWorkout.reposExo);
  userCaloriesBurned += metrics.calories;
  saveTrackerState();
  updateTrackerUI();
  generateShareCard(activeWorkout.titre, metrics.minutes, metrics.calories);

  const finText = document.getElementById('finished-cal-text');
  if(finText) finText.textContent = `Session de ~${metrics.minutes} min terminée • ~${metrics.calories} kcal ajoutées à ton solde du jour !`;
}

// ==================== DOM LOADED & EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(currentTheme);

  const btnOpenTracker = document.getElementById('btn-open-tracker');
  const btnOpenHistory = document.getElementById('btn-open-history');
  const btnOpenCatalog = document.getElementById('btn-open-catalog');
  const btnOpenQuiz = document.getElementById('btn-open-quiz');
  const btnOpenCustom = document.getElementById('btn-open-custom');
  const btnOpenNutrition = document.getElementById('btn-open-nutrition');
  const btnOpenWater = document.getElementById('btn-open-water');
  const btnOpenEvolution = document.getElementById('btn-open-evolution');
  const btnOpenChallenge = document.getElementById('btn-open-challenge');
  const btnOpenMusicHub = document.getElementById('btn-open-music-hub');
  const btnOpenSettings = document.getElementById('btn-open-settings');

  if(btnOpenTracker) btnOpenTracker.onclick = () => { updateTrackerUI(); showScreen('tracker'); };
  if(btnOpenHistory) btnOpenHistory.onclick = () => { renderHistory(); showScreen('history'); };
  if(btnOpenCatalog) btnOpenCatalog.onclick = () => { renderCatalog(); showScreen('catalog'); };
  if(btnOpenQuiz) btnOpenQuiz.onclick = () => { startQuiz(); showScreen('quiz'); };
  if(btnOpenCustom) btnOpenCustom.onclick = () => { resetCustomForm(); showScreen('custom'); };
  if(btnOpenNutrition) btnOpenNutrition.onclick = () => showScreen('nutrition');
  if(btnOpenWater) btnOpenWater.onclick = () => { updateWaterUI(); showScreen('water'); };
  if(btnOpenEvolution) btnOpenEvolution.onclick = () => { renderWeightHistory(); renderPRList(); showScreen('evolution'); };
  if(btnOpenChallenge) btnOpenChallenge.onclick = () => { renderChallengeUI(); showScreen('challenge'); };
  if(btnOpenSettings) btnOpenSettings.onclick = () => showScreen('settings');
  
  if(btnOpenMusicHub) {
    btnOpenMusicHub.onclick = () => {
      const panel = document.getElementById('music-expanded-panel');
      if(panel) panel.classList.toggle('hidden');
    };
  }

  const btnOpenMusicFromSettings = document.getElementById('btn-open-music-from-settings');
  if(btnOpenMusicFromSettings) {
    btnOpenMusicFromSettings.onclick = () => {
      showScreen('home');
      const panel = document.getElementById('music-expanded-panel');
      if(panel) panel.classList.remove('hidden');
    };
  }

  document.querySelectorAll('.back-home-btn, #logo').forEach(b => {
    b.onclick = () => {
      stopCountdown();
      stopPongGame();
      stopBreathing();
      showScreen('home');
      updateTrackerUI();
    };
  });

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.onclick = () => {
      applyTheme(btn.dataset.theme);
    };
  });

  const volMusic = document.getElementById('settings-vol-music');
  const volVfx = document.getElementById('settings-vol-vfx');
  if(volMusic) {
    volMusic.oninput = (e) => { audioPlayer.volume = parseFloat(e.target.value); };
  }
  if(volVfx) {
    volVfx.oninput = (e) => { vfxVolume = parseFloat(e.target.value); };
  }

  const searchInput = document.getElementById('food-search-input');
  const searchResults = document.getElementById('food-search-results');
  const portionPanel = document.getElementById('food-portion-panel');
  const portionQtyInput = document.getElementById('portion-qty-input');
  const portionUnitLabel = document.getElementById('portion-unit-label');

  if(searchInput && searchResults && portionPanel) {
    searchInput.oninput = (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (query.length < 2) {
        searchResults.classList.add('hidden');
        return;
      }

      const matches = FOOD_DATABASE.filter(f => f.nom.toLowerCase().includes(query));
      searchResults.innerHTML = '';

      if (matches.length === 0) {
        searchResults.innerHTML = `<div class="food-search-item" style="color:var(--text-tertiary);">Aucun aliment trouvé</div>`;
      } else {
        matches.slice(0, 8).forEach(item => {
          const div = document.createElement('div');
          div.className = 'food-search-item';
          div.innerHTML = `<span>${item.nom}</span><span style="font-size:11px; color:var(--text-secondary);">${item.cal} kcal / 100g</span>`;
          div.onclick = () => {
            selectedFoodForPortion = item;
            document.getElementById('portion-food-name').textContent = item.nom;
            if(item.unit === "piece") {
              if(portionUnitLabel) portionUnitLabel.textContent = "pièce(s)";
              if(portionQtyInput) { portionQtyInput.value = 1; portionQtyInput.min = 1; portionQtyInput.step = 1; }
              const singleCal = Math.round(item.cal * (item.standardWeight / 100));
              document.getElementById('portion-food-macros').textContent = `1 pièce (~${item.standardWeight}g) ≈ ${singleCal} kcal`;
            } else {
              if(portionUnitLabel) portionUnitLabel.textContent = "grammes";
              if(portionQtyInput) { portionQtyInput.value = 100; portionQtyInput.min = 5; portionQtyInput.step = 5; }
              document.getElementById('portion-food-macros').textContent = `100g = ${item.cal} kcal (P: ${item.prot}g • G: ${item.gluc}g • L: ${item.lip}g)`;
            }
            portionPanel.classList.remove('hidden');
            searchResults.classList.add('hidden');
            searchInput.value = '';
          };
          searchResults.appendChild(div);
        });
      }
      searchResults.classList.remove('hidden');
    };
  }

  const btnToggleFav = document.getElementById('btn-toggle-fav');
  if(btnToggleFav) {
    btnToggleFav.onclick = () => {
      if(!selectedFoodForPortion) return;
      const idx = favoriteFoods.indexOf(selectedFoodForPortion.id);
      if(idx === -1) favoriteFoods.push(selectedFoodForPortion.id);
      else favoriteFoods.splice(idx, 1);
      saveTrackerState();
      renderFavorites();
    };
  }

  const btnAddFood = document.getElementById('btn-add-food-log');
  if(btnAddFood) {
    btnAddFood.onclick = () => {
      if (!selectedFoodForPortion) return;
      const qty = parseFloat(portionQtyInput ? portionQtyInput.value : 100) || 1;
      let effectiveGrams = qty;
      let displayQty = `${qty}g`;

      if (selectedFoodForPortion.unit === "piece") {
        effectiveGrams = qty * selectedFoodForPortion.standardWeight;
        displayQty = `${qty} pièce(s) (~${effectiveGrams}g)`;
      }

      const ratio = effectiveGrams / 100;
      loggedFoods.push({
        nom: selectedFoodForPortion.nom,
        displayQty: displayQty,
        cal: Math.round(selectedFoodForPortion.cal * ratio),
        prot: (selectedFoodForPortion.prot * ratio).toFixed(1),
        gluc: (selectedFoodForPortion.gluc * ratio).toFixed(1),
        lip: (selectedFoodForPortion.lip * ratio).toFixed(1)
      });

      if(portionPanel) portionPanel.classList.add('hidden');
      selectedFoodForPortion = null;
      if(portionQtyInput) portionQtyInput.value = 100;
      saveTrackerState();
      updateTrackerUI();
    };
  }

  const btnClearFood = document.getElementById('btn-clear-food-log');
  if(btnClearFood) {
    btnClearFood.onclick = () => {
      if (confirm("Réinitialiser le journal des repas d'aujourd'hui ?")) {
        loggedFoods = [];
        userCaloriesBurned = 0;
        saveTrackerState();
        updateTrackerUI();
      }
    };
  }

  document.querySelectorAll('#filter-location .filter-pill').forEach(btn => {
    btn.onclick = (e) => {
      document.querySelectorAll('#filter-location .filter-pill').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentLocFilter = e.target.dataset.filter;
      renderCatalog();
    };
  });

  document.querySelectorAll('#filter-exo-count .filter-pill').forEach(btn => {
    btn.onclick = (e) => {
      document.querySelectorAll('#filter-exo-count .filter-pill').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentExoCountFilter = e.target.dataset.exoFilter;
      renderCatalog();
    };
  });

  const exoCountSlider = document.getElementById('exo-count-slider');
  const sliderValueDisplay = document.getElementById('slider-value-display');
  if(exoCountSlider && sliderValueDisplay) {
    exoCountSlider.oninput = (e) => { sliderValueDisplay.textContent = e.target.value; };
  }
  const btnSubmitSlider = document.getElementById('btn-submit-slider');
  if(btnSubmitSlider) {
    btnSubmitSlider.onclick = () => {
      qAnswers.nbExos = parseInt(exoCountSlider ? exoCountSlider.value : 5, 10);
      finishQuiz();
    };
  }

  const addExoBtn = document.getElementById('add-exo-btn');
  if(addExoBtn) {
    addExoBtn.onclick = () => {
      const nameEl = document.getElementById('custom-exo-name');
      const setsEl = document.getElementById('custom-exo-sets');
      const repsEl = document.getElementById('custom-exo-reps');
      const name = nameEl ? nameEl.value.trim() : '';
      const sets = parseInt(setsEl ? setsEl.value : 3, 10) || 3;
      const reps = repsEl ? repsEl.value.trim() : '10';

      if (!name) return;
      customExosList.push({ nom: name, series: sets, reps });

      const list = document.getElementById('custom-preview-list');
      const count = document.getElementById('custom-count');
      if(list) {
        const li = document.createElement('li');
        li.innerHTML = `<span><b>${name}</b></span> <span>${sets} séries × ${reps}</span>`;
        list.appendChild(li);
      }
      if(count) count.textContent = customExosList.length;

      if(nameEl) nameEl.value = '';
      if(setsEl) setsEl.value = '';
      if(repsEl) repsEl.value = '';
    };
  }

  const launchCustomBtn = document.getElementById('launch-custom-btn');
  if(launchCustomBtn) {
    launchCustomBtn.onclick = () => {
      if (customExosList.length === 0) {
        alert("Ajoute au moins un exercice à ta séance !");
        return;
      }
      const titleEl = document.getElementById('custom-title');
      const title = (titleEl && titleEl.value.trim()) ? titleEl.value.trim() : "Séance Personnalisée";
      openDetailScreen({
        titre: title,
        desc: "Entraînement composé sur mesure.",
        lieu: "custom",
        reposSerie: 45,
        reposExo: 90,
        exos: customExosList
      });
    };
  }

  const nutritionForm = document.getElementById('nutrition-form');
  if(nutritionForm) {
    nutritionForm.onsubmit = (e) => {
      e.preventDefault();
      const sexeEl = document.querySelector('input[name="sexe"]:checked');
      const ageEl = document.getElementById('user-age');
      const weightEl = document.getElementById('user-weight');
      const heightEl = document.getElementById('user-height');
      const stepsEl = document.getElementById('user-steps');

      const sexe = sexeEl ? sexeEl.value : 'homme';
      const age = parseFloat(ageEl ? ageEl.value : 24);
      const poids = parseFloat(weightEl ? weightEl.value : 75);
      const taille = parseFloat(heightEl ? heightEl.value : 180);
      const pas = parseFloat(stepsEl ? stepsEl.value : 8500);

      let bmr = (10 * poids) + (6.25 * taille) - (5 * age) + (sexe === 'homme' ? 5 : -161);
      let facteur = 1.2;
      if (pas >= 5000 && pas < 8000) facteur = 1.375;
      else if (pas >= 8000 && pas < 11000) facteur = 1.55;
      else if (pas >= 11000 && pas < 15000) facteur = 1.725;
      else if (pas >= 15000) facteur = 1.9;

      const maintien = Math.round(bmr * facteur);
      const maintienEl = document.getElementById('cal-maintien');
      const deficitEl = document.getElementById('cal-deficit');
      const surplusEl = document.getElementById('cal-surplus');
      const resultsCard = document.getElementById('nutrition-results');

      if(maintienEl) maintienEl.textContent = maintien;
      if(deficitEl) deficitEl.textContent = Math.round(maintien - 400);
      if(surplusEl) surplusEl.textContent = Math.round(maintien + 300);

      userDailyGoal = maintien;
      saveTrackerState();
      updateTrackerUI();

      if(resultsCard) resultsCard.classList.remove('hidden');
    };
  }

  const btnStartGuided = document.getElementById('btn-start-guided-workout');
  if(btnStartGuided) {
    btnStartGuided.onclick = () => {
      const setRestInput = document.getElementById('set-rest-input');
      const exoRestInput = document.getElementById('exo-rest-input');
      if(activeWorkout) {
        activeWorkout.reposSerie = parseInt(setRestInput ? setRestInput.value : 45, 10) || 45;
        activeWorkout.reposExo = parseInt(exoRestInput ? exoRestInput.value : 90, 10) || 90;
      }
      currentExoIndex = 0;
      currentSetIndex = 1;
      showScreen('guided');
      showWorkView();
    };
  }

  const btnFinishSet = document.getElementById('btn-finish-set');
  if(btnFinishSet) {
    btnFinishSet.onclick = () => {
      if(!activeWorkout) return;
      const exo = activeWorkout.exos[currentExoIndex];
      if (currentSetIndex < exo.series) {
        currentSetIndex++;
        startRestPeriod(activeWorkout.reposSerie, `Repos avant la série ${currentSetIndex}`, `${exo.nom} (${currentSetIndex}/${exo.series})`);
      } else if (currentExoIndex < activeWorkout.exos.length - 1) {
        currentExoIndex++;
        currentSetIndex = 1;
        const nextExo = activeWorkout.exos[currentExoIndex];
        startRestPeriod(activeWorkout.reposExo, `Changement d'exercice`, `${nextExo.nom} (Série 1/${nextExo.series})`);
      } else {
        const metrics = calculateWorkoutMetrics(activeWorkout.exos, activeWorkout.reposSerie, activeWorkout.reposExo);
        workoutHistory.unshift({
          titre: activeWorkout.titre,
          date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
          duree: metrics.minutes,
          calories: metrics.calories
        });
        saveTrackerState();
        showFinishedView();
      }
    };
  }

  const btnSkipRest = document.getElementById('btn-skip-rest');
  if(btnSkipRest) btnSkipRest.onclick = () => { stopCountdown(); showWorkView(); };

  const btnFinishHome = document.getElementById('btn-finish-home');
  if(btnFinishHome) btnFinishHome.onclick = () => showScreen('home');

  const btnQuitLive = document.getElementById('btn-quit-live');
  if(btnQuitLive) {
    btnQuitLive.onclick = () => {
      if (confirm("Abandonner l'entraînement en cours ?")) {
        stopCountdown();
        stopPongGame();
        stopBreathing();
        showScreen('home');
      }
    };
  }

  document.querySelectorAll('.rest-tab-btn').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.rest-tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const panels = {
        quiz: document.getElementById('rest-quiz-panel'),
        breath: document.getElementById('rest-breath-panel'),
        game: document.getElementById('rest-game-panel')
      };
      Object.values(panels).forEach(p => { if(p) p.classList.add('hidden'); });
      const target = tab.dataset.tab;
      if(panels[target]) panels[target].classList.remove('hidden');

      if (target === 'game') startPongGame();
      else stopPongGame();
    };
  });

  const btnPlay = document.getElementById('btn-play-pause');
  const btnNext = document.getElementById('btn-next-track');
  const expandPlayer = document.getElementById('btn-expand-player');
  const toggleSnippet = document.getElementById('btn-toggle-snippet');
  const closeMusic = document.getElementById('btn-close-music-panel');
  const musicExpandedPanel = document.getElementById('music-expanded-panel');

  if(btnPlay) btnPlay.onclick = (e) => { e.stopPropagation(); togglePlayPause(); };
  if(btnNext) btnNext.onclick = (e) => { e.stopPropagation(); nextTrack(); };
  if(expandPlayer) expandPlayer.onclick = () => { if(musicExpandedPanel) musicExpandedPanel.classList.toggle('hidden'); };
  if(toggleSnippet) toggleSnippet.onclick = () => { if(musicExpandedPanel) musicExpandedPanel.classList.toggle('hidden'); };
  if(closeMusic) closeMusic.onclick = () => { if(musicExpandedPanel) musicExpandedPanel.classList.add('hidden'); };

  document.querySelectorAll('.genre-pill').forEach(pill => {
    pill.onclick = (e) => {
      document.querySelectorAll('.genre-pill').forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      currentGenreFilter = e.target.dataset.genre;
      renderTrackList();
    };
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('button, .session-card, .quiz-option-btn, .hub-card, .track-item-row')) {
      playPopSound();
    }
  });

  const soundToggleBtn = document.getElementById('btn-toggle-sound');
  if(soundToggleBtn) {
    soundToggleBtn.onclick = () => {
      soundEnabled = !soundEnabled;
      soundToggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
      soundToggleBtn.classList.toggle('muted', !soundEnabled);
    };
  }

  updateTrackerUI();
  loadTrack(0, false);

  const totalWorkouts = typeof catalogue !== 'undefined' ? catalogue.length : 0;
  const homeCatalogCard = document.getElementById('home-catalog-count');
  if (homeCatalogCard) {
    homeCatalogCard.textContent = totalWorkouts;
  }

  const catalogCountEl = document.getElementById('catalog-count');
  if (catalogCountEl) {
    catalogCountEl.textContent = `${totalWorkouts} séances`;
  }
});