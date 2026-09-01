// ==================== MODULE IDÉE 3 & 4 : DÉFIS & RECORDS (PRs) ====================
let userPRs = JSON.parse(localStorage.getItem('pulsefit_prs')) || [];
let dailyChallengeDone = localStorage.getItem('pulsefit_daily_challenge') === new Date().toDateString();

let waterIntake = parseInt(localStorage.getItem('pulsefit_water'), 10) || 0;
let userWeightHistory = JSON.parse(localStorage.getItem('pulsefit_weight_history')) || [];

// --- IDÉES 3 : HYDRATATION ---
function addWater(amount) {
  waterIntake += amount;
  localStorage.setItem('pulsefit_water', waterIntake);
  updateWaterUI();
}

function resetWater() {
  waterIntake = 0;
  localStorage.setItem('pulsefit_water', waterIntake);
  updateWaterUI();
}

function updateWaterUI() {
  const waterDisplay = document.getElementById('water-intake-display');
  const waterFill = document.getElementById('water-progress-fill');
  if (waterDisplay) waterDisplay.textContent = waterIntake;
  if (waterFill) {
    const targetWater = 2500; // Objectif 2.5L (2500 ml)
    const pct = Math.min(100, (waterIntake / targetWater) * 100);
    waterFill.style.width = `${pct}%`;
  }
}

// --- IDÉE 1 : SUIVI DE POIDS ---
function logUserWeight(weightValue) {
  if (!weightValue) return;
  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  userWeightHistory.push({ date: today, weight: weightValue });
  localStorage.setItem('pulsefit_weight_history', JSON.stringify(userWeightHistory));
  renderWeightHistory();
}

function renderWeightHistory() {
  const container = document.getElementById('weight-history-list');
  if (!container) return;
  container.innerHTML = '';
  if (userWeightHistory.length === 0) {
    container.innerHTML = `<li style="color:var(--text-tertiary); justify-content:center;">Aucune pesée enregistrée.</li>`;
    return;
  }
  userWeightHistory.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>📅 ${item.date}</span> <b>${item.weight} kg</b>`;
    container.appendChild(li);
  });
}

// --- IDÉE 5 : CARTE DE PARTAGE DE SÉANCE ---
function generateShareCard(sessionTitle, duration, calories) {
  const cardHTML = `
    <div class="share-modal-overlay">
      <div class="modern-card share-card-popup">
        <span class="brand-badge">PULSEFIT STUDIO</span>
        <h2 style="margin: 10px 0 4px 0;">${sessionTitle}</h2>
        <p style="color: var(--brand-primary); font-weight: 700; margin-bottom: 16px;">⚡ Entraînement validé avec succès !</p>
        <div class="share-stats-grid" style="display: flex; justify-content: space-around; background: var(--bg-core); padding: 12px; border-radius: var(--radius-md); margin-bottom: 20px;">
          <span>⏱ ${duration} min</span>
          <span>🔥 ${calories} kcal</span>
        </div>
        <button onclick="closeShareCard()" class="btn-primary">Fermer & Continuer</button>
      </div>
    </div>
  `;
  let modalContainer = document.getElementById('share-modal-container');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'share-modal-container';
    document.body.appendChild(modalContainer);
  }
  modalContainer.innerHTML = cardHTML;
}

function closeShareCard() {
  const modalContainer = document.getElementById('share-modal-container');
  if (modalContainer) modalContainer.innerHTML = '';
}

// --- IDÉE 3 : LES 50 DÉFIS DU JOUR ---
const DAILY_CHALLENGES = [
  "Fais 50 pompes réparties dans toute la journée.",
  "Bois au moins 2,5 litres d'eau aujourd'hui.",
  "Maintiens une planche abdominale de 2 minutes au total.",
  "Prends 10 minutes pour t'étirer ce soir avant de dormir.",
  "Fais 100 squats répartis en plusieurs séries dans la journée.",
  "Marche pendant 30 minutes sans t'arrêter d'un bon pas.",
  "Ne bois aucun soda ni boisson sucrée de toute la journée.",
  "Fais 3 séries de 10 tractions ou, à défaut, des tractions inversées/suspensions à une barre.",
  "Prends une douche écossaise (termine par 30 secondes d'eau froide).",
  "Lis 15 pages d'un livre de ton choix.",
  "Fais une séance de méditation ou de cohérence cardiaque de 10 minutes.",
  "Cuisine un repas entièrement fait maison avec des légumes frais.",
  "Passe 1 heure complète sans regarder ton téléphone portable.",
  "Fais 30 fentes alternées (15 par jambe).",
  "Monte les escaliers de ton immeuble ou de ton école au lieu de prendre l'ascenseur.",
  "Note 3 choses positives qui te sont arrivées aujourd'hui.",
  "Fais une séance de corde à sauter pendant 5 minutes.",
  "Envoie un message gentil ou de remerciement à un ami ou un membre de ta famille.",
  "Maintiens une chaise contre un mur pendant 90 secondes en continu.",
  "Passe 20 minutes à ranger et nettoyer ton bureau ou ta chambre.",
  "Fais 20 burpees pour booster ton rythme cardiaque.",
  "Écoute un nouvel album de musique en entier sans faire autre en même temps.",
  "Fais des étirements spécifiques pour le dos pendant 10 minutes.",
  "Bois un grand verre d'eau glacée dès ton réveil.",
  "Exerce ton équilibre en tenant sur un seul pied les yeux fermés pendant 1 minute (30 secondes par jambe).",
  "Fais 50 abdos (type crunchs ou sit-ups) propres et contrôlés.",
  "Apprends un mot nouveau dans une langue étrangère et utilise-le dans une phrase.",
  "Fais une pause de 5 minutes les yeux fermés pour reposer ta vue des écrans.",
  "Prépare tes affaires de sport ou tes cours pour le lendemain dès ce soir.",
  "Fais 15 dips sur une chaise pour renforcer tes triceps.",
  "Bois une infusion relaxante (camomille, verveine) sans sucre le soir.",
  "Marche 10 000 pas dans la journée.",
  "Fais une séance de shadow boxing (boxe dans le vide) dynamique de 5 minutes.",
  "Mange au moins deux portions de fruits frais aujourd'hui.",
  "Passe 15 minutes dehors à respirer l'air frais et à observer la nature.",
  "Fais une pause active toutes les heures en te levant pour bouger un peu.",
  "Réalise un gainage latéral de 45 secondes de chaque côté.",
  "Écris tes objectifs de la semaine sur un carnet.",
  "Fais des battements de jambes ou du ciseau pour travailler tes abdos pendant 2 minutes.",
  "Prends le temps de savourer ton repas du midi en mâchant lentement, sans écran.",
  "Fais 20 extensions de mollets sur une marche d'escalier.",
  "Fais un compliment sincère à quelqu'un aujourd'hui.",
  "Pratique 5 minutes d'exercices de respiration profonde (inspiration par le nez, longue expiration par la bouche).",
  "Fais le tri dans les applications de ton téléphone pour supprimer celles que tu n'utilises plus.",
  "Fais 10 pompes inclinées (mains sur un meuble ou un mur) si tu débutes, ou surélevées si tu es avancé.",
  "Passe 10 minutes à écouter un podcast inspirant ou instructif.",
  "Fais une session d'assouplissement des ischio-jambiers.",
  "Bois un thé vert l'après-midi pour un boost d'énergie sain.",
  "Fais 30 secondes de saut en grand (jumping jacks) à trois reprises dans la journée.",
  "Couche-toi 30 minutes plus tôt que d'habitude pour faire le plein de sommeil."
];

function getTodayChallenge() {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
}

function completeDailyChallenge() {
  dailyChallengeDone = true;
  localStorage.setItem('pulsefit_daily_challenge', new Date().toDateString());
  renderChallengeUI();
}

function renderChallengeUI() {
  const textEl = document.getElementById('daily-challenge-text');
  const btnEl = document.getElementById('btn-complete-challenge');
  if (!textEl) return;

  textEl.textContent = getTodayChallenge();
  if (dailyChallengeDone) {
    if (btnEl) {
      btnEl.textContent = "Défi validé pour aujourd'hui ! ✓";
      btnEl.disabled = true;
      btnEl.style.opacity = "0.6";
    }
  }
}

// --- IDÉE 4 : RECORDS PERSONNELS (PRs) ---
function logPR(exerciseName, weightKg) {
  if (!exerciseName || !weightKg) return;
  const existing = userPRs.find(p => p.exo.toLowerCase() === exerciseName.toLowerCase());
  if (existing) {
    existing.weight = weightKg;
    existing.date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  } else {
    userPRs.push({
      exo: exerciseName,
      weight: weightKg,
      date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    });
  }
  localStorage.setItem('pulsefit_prs', JSON.stringify(userPRs));
  renderPRList();
}

function renderPRList() {
  const container = document.getElementById('pr-history-list');
  if (!container) return;
  container.innerHTML = '';
  if (userPRs.length === 0) {
    container.innerHTML = `<li style="color:var(--text-tertiary); justify-content:center;">Aucun record enregistré.</li>`;
    return;
  }
  userPRs.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<span>🏋️ <b>${item.exo}</b> (${item.date})</span> <b style="color:var(--brand-cyan);">${item.weight} kg</b>`;
    container.appendChild(li);
  });
}

function logUserPR() {
  const nameInput = document.getElementById('pr-exo-name');
  const weightInput = document.getElementById('pr-exo-weight');
  if (nameInput && weightInput) {
    logPR(nameInput.value.trim(), weightInput.value);
    nameInput.value = '';
    weightInput.value = '';
  }
}

// Initialisation globale au chargement
document.addEventListener('DOMContentLoaded', () => {
  updateWaterUI();
  renderWeightHistory();
  renderChallengeUI();
  renderPRList();
});