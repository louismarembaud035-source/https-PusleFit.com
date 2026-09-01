// ==================== MOTEUR AUDIO SFX & VFX ====================
let audioCtx = null;
let soundEnabled = true;
let vfxVolume = 0.5;

function initAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function playPopSound() {
  if (!soundEnabled || vfxVolume <= 0) return;
  try {
    initAudioContext();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);
    gain.gain.setValueAtTime(0.12 * vfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  } catch(e) {}
}

function playCountdownBeep(freq = 600) {
  if (!soundEnabled || vfxVolume <= 0) return;
  try {
    initAudioContext();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.15 * vfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } catch(e) {}
}

function playRestEndChime() {
  if (!soundEnabled || vfxVolume <= 0) return;
  try {
    initAudioContext();
    if (!audioCtx) return;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime + (idx * 0.07);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.18 * vfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    });
  } catch(e) {}
}

// ==================== LECTEUR DE MUSIQUE ====================
const PLAYLIST_TRACKS = [
  { id: "phonk_1", genre: "phonk", genreLabel: "Phonk Energy", title: "Phonk Tokyo Drift", meta: "142 BPM", url: "https://stream.nightride.fm/nightride.m4a" },
  { id: "phonk_2", genre: "phonk", genreLabel: "Phonk Energy", title: "Dark Underground Beat", meta: "140 BPM", url: "https://stream.nightride.fm/chillsynth.m4a" },
  { id: "house_1", genre: "house", genreLabel: "House / Pop", title: "Club Workout Dance Radio", meta: "128 BPM", url: "https://stream.zeno.fm/f3wvbbqmdg8uv" },
  { id: "house_2", genre: "house", genreLabel: "House / Pop", title: "Electronic Pop Flow", meta: "125 BPM", url: "https://icecast.skyrock.net/s/natio_mp3_128k" },
  { id: "ambiance_1", genre: "ambiance", genreLabel: "Ambiance & Chill", title: "Lo-Fi Focus Radio", meta: "85 BPM", url: "https://stream.zeno.fm/f3wvbbqmdg8uv" },
  { id: "ambiance_2", genre: "ambiance", genreLabel: "Ambiance & Chill", title: "Chillwave Breathing", meta: "78 BPM", url: "https://stream.nightride.fm/chillsynth.m4a" }
];

let currentTrackIndex = 0;
let isMusicPlaying = false;
let currentGenreFilter = 'phonk';
const audioPlayer = new Audio();
audioPlayer.volume = 0.7;

function setPlayerVisualState(playing) {
  isMusicPlaying = playing;
  const btn = document.getElementById('btn-play-pause');
  const disc = document.getElementById('music-disc-icon');
  if(btn) btn.textContent = playing ? '⏸' : '▶';
  if(disc) {
    if (playing) disc.classList.add('spinning');
    else disc.classList.remove('spinning');
  }
}

function loadTrack(index, autoPlay = true) {
  currentTrackIndex = index;
  const track = PLAYLIST_TRACKS[currentTrackIndex];
  audioPlayer.src = track.url;
  const titleEl = document.getElementById('player-current-title');
  const genreEl = document.getElementById('player-current-genre');
  if(titleEl) titleEl.textContent = track.title;
  if(genreEl) genreEl.textContent = `${track.genreLabel} • ${track.meta}`;
  renderTrackList();

  if (autoPlay) {
    initAudioContext();
    audioPlayer.play().then(() => setPlayerVisualState(true)).catch(() => setPlayerVisualState(false));
  }
}

function togglePlayPause() {
  initAudioContext();
  if (isMusicPlaying) {
    audioPlayer.pause();
    setPlayerVisualState(false);
  } else {
    if (!audioPlayer.src || audioPlayer.src === "") loadTrack(currentTrackIndex, true);
    else audioPlayer.play().then(() => setPlayerVisualState(true)).catch(() => setPlayerVisualState(false));
  }
}

function nextTrack() {
  const filtered = PLAYLIST_TRACKS.filter(t => t.genre === currentGenreFilter);
  const currentInFilter = filtered.findIndex(t => t.id === PLAYLIST_TRACKS[currentTrackIndex].id);
  const nextInFilter = (currentInFilter + 1) % filtered.length;
  const globalIdx = PLAYLIST_TRACKS.findIndex(t => t.id === filtered[nextInFilter].id);
  loadTrack(globalIdx, true);
}

audioPlayer.onended = () => nextTrack();

function renderTrackList() {
  const container = document.getElementById('track-list-container');
  if(!container) return;
  container.innerHTML = '';
  const filtered = PLAYLIST_TRACKS.filter(t => t.genre === currentGenreFilter);

  filtered.forEach(track => {
    const isPlayingThis = (PLAYLIST_TRACKS[currentTrackIndex].id === track.id && isMusicPlaying);
    const row = document.createElement('div');
    row.className = `track-item-row ${PLAYLIST_TRACKS[currentTrackIndex].id === track.id ? 'active' : ''}`;
    row.innerHTML = `<span>${isPlayingThis ? '🔊 ' : ''}${track.title}</span><span style="font-size:10px; color:var(--text-tertiary);">${track.meta}</span>`;
    row.onclick = () => {
      const idx = PLAYLIST_TRACKS.findIndex(t => t.id === track.id);
      loadTrack(idx, true);
    };
    container.appendChild(row);
  });
}

// ==================== MINI JEUX DE REPOS ====================
const REST_QUIZ_POOL = [
  { q: "Quel est le muscle le plus volumineux du corps humain ?", options: ["Grand fessier", "Quadriceps", "Grand dorsal", "Grand pectoral"], correct: 0, fact: "Le grand fessier est le muscle le plus puissant et volumineux !" },
  { q: "Combien de temps de repos optimal pour l'hypertrophie musculaire ?", options: ["10 à 20 sec", "45 à 90 sec", "5 à 8 min", "15 minutes"], correct: 1, fact: "45 à 90s permet un stress métabolique optimal pour le volume." },
  { q: "Quel macronutriment fournit 9 kcal par gramme ?", options: ["Les lipides", "Les protéines", "Les glucides", "L'eau"], correct: 0, fact: "Les lipides fournissent 9 kcal/g, contre 4 kcal/g pour protéines et glucides." }
];

function loadRandomRestQuiz() {
  const quiz = REST_QUIZ_POOL[Math.floor(Math.random() * REST_QUIZ_POOL.length)];
  const qEl = document.getElementById('mini-quiz-q');
  const optionsGrid = document.getElementById('mini-quiz-options');
  const feedback = document.getElementById('mini-quiz-feedback');

  if(!qEl || !optionsGrid) return;
  qEl.textContent = quiz.q;
  optionsGrid.innerHTML = '';
  if(feedback) { feedback.classList.add('hidden'); feedback.textContent = ''; }

  quiz.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'mini-quiz-opt';
    btn.textContent = opt;
    btn.onclick = () => {
      const allBtns = optionsGrid.querySelectorAll('.mini-quiz-opt');
      allBtns.forEach(b => b.disabled = true);
      if (idx === quiz.correct) {
        btn.classList.add('correct');
        if(feedback) feedback.textContent = `✓ Correct ! ${quiz.fact}`;
      } else {
        btn.classList.add('wrong');
        if(allBtns[quiz.correct]) allBtns[quiz.correct].classList.add('correct');
        if(feedback) feedback.textContent = `✗ Pas tout à fait... ${quiz.fact}`;
      }
      if(feedback) feedback.classList.remove('hidden');
    };
    optionsGrid.appendChild(btn);
  });
}

let breathCycleInterval = null;
function startBreathing() {
  const circle = document.getElementById('breath-circle');
  const text = document.getElementById('breath-text');
  if (!circle || !text) return;
  clearInterval(breathCycleInterval);
  let isInhaling = true;
  circle.className = 'breath-circle inhale';
  text.textContent = 'Inspirez...';
  breathCycleInterval = setInterval(() => {
    isInhaling = !isInhaling;
    if (isInhaling) {
      circle.className = 'breath-circle inhale';
      text.textContent = 'Inspirez...';
    } else {
      circle.className = 'breath-circle exhale';
      text.textContent = 'Expirez...';
    }
  }, 4000);
}

function stopBreathing() {
  if(breathCycleInterval) clearInterval(breathCycleInterval);
}

// PONG
let pongRunning = false;
let pongReq = null;
let playerY = 65, botY = 65, ballX = 150, ballY = 90, ballSpeedX = 2.5, ballSpeedY = 1.8, p1Score = 0, botScore = 0;
const paddleHeight = 45, paddleWidth = 6;

function startPongGame() {
  const canvas = document.getElementById('pong-canvas');
  if (!canvas || pongRunning) return;
  pongRunning = true;
  ballX = 150; ballY = 90; ballSpeedX = 2.5; ballSpeedY = 1.5; p1Score = 0; botScore = 0;
  const p1El = document.getElementById('pong-p1-score');
  const botEl = document.getElementById('pong-bot-score');
  if(p1El) p1El.textContent = '0';
  if(botEl) botEl.textContent = '0';
  pongLoop();
}

function stopPongGame() {
  pongRunning = false;
  if (pongReq) cancelAnimationFrame(pongReq);
}

function pongLoop() {
  if (!pongRunning) return;
  const canvas = document.getElementById('pong-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  ballX += ballSpeedX;
  ballY += ballSpeedY;

  if (ballY <= 4 || ballY >= canvas.height - 4) ballSpeedY = -ballSpeedY;

  const botTarget = ballY - paddleHeight / 2;
  botY += (botTarget - botY) * 0.08;
  botY = Math.max(0, Math.min(canvas.height - paddleHeight, botY));

  if (ballX <= 14) {
    if (ballY >= playerY && ballY <= playerY + paddleHeight) {
      ballSpeedX = -ballSpeedX * 1.05;
      ballSpeedY = (ballY - (playerY + paddleHeight / 2)) * 0.15;
    } else if (ballX <= 0) {
      botScore++;
      const botEl = document.getElementById('pong-bot-score');
      if(botEl) botEl.textContent = botScore;
      ballX = canvas.width / 2; ballY = canvas.height / 2; ballSpeedX = -2.5;
    }
  }

  if (ballX >= canvas.width - 14) {
    if (ballY >= botY && ballY <= botY + paddleHeight) {
      ballSpeedX = -ballSpeedX * 1.05;
      ballSpeedY = (ballY - (botY + paddleHeight / 2)) * 0.15;
    } else if (ballX >= canvas.width) {
      p1Score++;
      const p1El = document.getElementById('pong-p1-score');
      if(p1El) p1El.textContent = p1Score;
      ballX = canvas.width / 2; ballY = canvas.height / 2; ballSpeedX = 2.5;
    }
  }

  ctx.fillStyle = '#060911';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(8, playerY, paddleWidth, paddleHeight);
  ctx.fillStyle = '#8b5cf6';
  ctx.fillRect(canvas.width - 8 - paddleWidth, botY, paddleWidth, paddleHeight);
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(ballX, ballY, 4, 0, Math.PI * 2);
  ctx.fill();

  pongReq = requestAnimationFrame(pongLoop);
}