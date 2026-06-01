const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const side = document.getElementById('sidePanel');
const sctx = side.getContext('2d');
const W = canvas.width;   // 1080
const H = canvas.height;  // 800
const SW = side.width;    // 260

// ── Audio ─────────────────────────────────────────────────────
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let soundEnabled = true;
function playSound(type) {
  if (!soundEnabled) return;
  try {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    const t = audioCtx.currentTime;
    if (type === 'shoot') {
      o.type = 'square'; o.frequency.setValueAtTime(880, t);
      o.frequency.exponentialRampToValueAtTime(440, t + 0.08);
      g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      o.start(t); o.stop(t + 0.08);
    } else if (type === 'explosion') {
      o.type = 'sawtooth'; o.frequency.setValueAtTime(220, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.25);
      g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.start(t); o.stop(t + 0.25);
    } else if (type === 'gold') {
      o.type = 'sine'; o.frequency.setValueAtTime(660, t);
      o.frequency.exponentialRampToValueAtTime(1320, t + 0.12);
      g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      o.start(t); o.stop(t + 0.15);
    } else if (type === 'hit') {
      o.type = 'sawtooth'; o.frequency.setValueAtTime(120, t);
      o.frequency.exponentialRampToValueAtTime(60, t + 0.35);
      g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.start(t); o.stop(t + 0.35);
    } else if (type === 'pause') {
      o.type = 'sine'; o.frequency.setValueAtTime(440, t);
      g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      o.start(t); o.stop(t + 0.1);
    } else if (type === 'combo') {
      o.type = 'sine'; o.frequency.setValueAtTime(880, t);
      o.frequency.exponentialRampToValueAtTime(1760, t + 0.15);
      g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.start(t); o.stop(t + 0.2);
    }
  } catch(e) {}
}

// ── Configuratie nivele ───────────────────────────────────────
const LEVEL_CONFIG = [
  { enemySpeed: 0.4,  shootInterval: 220, dropY: 10, rows: 2, cols: 6,  shotsPerVolley: 1 }, // nivel 1
  { enemySpeed: 0.7,  shootInterval: 140, dropY: 12, rows: 3, cols: 8,  shotsPerVolley: 1 }, // nivel 2
  { enemySpeed: 1.7,  shootInterval: 70,  dropY: 18, rows: 4, cols: 10, shotsPerVolley: 2 }, // nivel 3
  { enemySpeed: 2.3,  shootInterval: 55,  dropY: 20, rows: 5, cols: 10, shotsPerVolley: 3 }, // nivel 4
  { enemySpeed: 3.0,  shootInterval: 40,  dropY: 22, rows: 5, cols: 11, shotsPerVolley: 3 }, // nivel 5
];

const SHIELD_SHOP = [
  { name: 'Scut Bronz',  cost: 150, hp: 1, color: '#cd7f32', desc: 'Absoarbe 1 impact' },
  { name: 'Scut Argint', cost: 300, hp: 2, color: '#c0c0c0', desc: 'Absoarbe 2 impacturi' },
  { name: 'Scut Aur',    cost: 500, hp: 3, color: '#ffd700', desc: 'Absoarbe 3 impacturi' },
];

const BAG_TYPES = [
  { type: 'bronze', color: '#cd7f32', label: '🥉', w: 28, h: 28, sinusoidal: false },
  { type: 'silver', color: '#c0c0c0', label: '🥈', w: 32, h: 32, sinusoidal: false },
  { type: 'gold',   color: '#ffd700', label: '🥇', w: 38, h: 38, sinusoidal: true  },
];

// ── Stare globala ─────────────────────────────────────────────
let state = 'name'; // name | start | playing | shop | paused | gameover | win
let playerName = '';
let nameError = '';
let playerPassword = '';
let nameStep = 'name';
let score = 0;
let lives = 3;
let gold = 0;
let bronzeBags = 0;  // saci bronz colectati
let silverBags = 0;  // saci argint colectati
let goldBags   = 0;  // saci aur colectati
let level = 1;
// Scuturi separate: bronz=1hp, argint=2hp, aur=3hp, folosite in ordine bronz→argint→aur
let shieldBronze = 0;
let shieldSilver = 0;
let shieldGold   = 0;
let shieldHp = 0; // hp-ul scutului activ curent
let keys = {};
let leaderboard = JSON.parse(localStorage.getItem('ss_leaderboard') || '[]');

// ── Combo ─────────────────────────────────────────────────────
let comboCount = 0;
let comboTimer = 0;
const COMBO_WINDOW = 60; // frames
let comboTexts = []; // { x, y, text, life, maxLife }

// ── Flash la hit ──────────────────────────────────────────────
let flashTimer = 0;

// ── Animatie start screen ─────────────────────────────────────
let startAnim = 0; // creste de la 0 la 1

// ── Tun ───────────────────────────────────────────────────────
const cannon = { x: W / 2, y: H - 55, w: 64, h: 32, speed: 6, vx: 0 };

// ── Colectii obiecte ──────────────────────────────────────────
let bullets = [], enemies = [], enemyBullets = [], bags = [], particles = [];
let bulletCooldown = 0, enemyDir = 1, enemyShootTimer = 0;
let bagSpawnTimer = 0, bagSpawnInterval = 280;
let shopCursor = 0;

// ── Fundal ────────────────────────────────────────────────────
const stars = Array.from({ length: 160 }, () => ({
  x: Math.random() * W, y: Math.random() * H,
  r: Math.random() * 1.8 + 0.3,
  speed: Math.random() * 0.7 + 0.2,
  alpha: Math.random() * 0.5 + 0.4
}));
const nebulae = Array.from({ length: 5 }, () => ({
  x: Math.random() * W, y: Math.random() * H,
  r: Math.random() * 180 + 80,
  color: ['#1a0033','#001a33','#001a00','#330011','#0d0d33'][Math.floor(Math.random()*5)]
}));

// ══════════════════════════════════════════════════════════════
// INPUT
// ══════════════════════════════════════════════════════════════
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.code === 'F5') {
    e.preventDefault();
    localStorage.removeItem('ss_leaderboard');
    leaderboard = [];
    state = 'name'; playerName = ''; playerPassword = ''; nameStep = 'name'; nameError = '';
    return;
  }

  keys[e.code] = true;

  // Toggle sunet
  if (e.code === 'KeyS' && state !== 'name') {
    soundEnabled = !soundEnabled;
    return;
  }

  if (state === 'name') {
    if (e.code === 'Enter') {
      if (nameStep === 'name') {
        const trimmed = playerName.trim();
        if (trimmed.length === 0) return;
        playerName = trimmed; nameError = ''; nameStep = 'password'; playerPassword = '';
        return;
      }
      if (nameStep === 'password') {
        if (playerPassword.length === 0) return;
        const existing = leaderboard.find(en => en.name.toLowerCase() === playerName.toLowerCase());
        if (existing) {
          if (existing.password === playerPassword) { nameError = ''; state = 'start'; startAnim = 0; }
          else { nameError = 'Parolă incorectă! Încearcă alt nume.'; nameStep = 'name'; playerName = ''; playerPassword = ''; }
        } else { nameError = ''; state = 'start'; startAnim = 0; }
        return;
      }
    }
    if (e.code === 'Backspace') {
      if (nameStep === 'name') { playerName = playerName.slice(0, -1); nameError = ''; }
      else { playerPassword = playerPassword.slice(0, -1); nameError = ''; }
      return;
    }
    if (e.key.length === 1) {
      if (nameStep === 'name' && playerName.length < 16) { playerName += e.key; nameError = ''; }
      else if (nameStep === 'password' && playerPassword.length < 6) { playerPassword += e.key; nameError = ''; }
    }
    return;
  }

  if (state === 'start' && e.code === 'Space') { state = 'playing'; initGame(1); }
  if (state === 'gameover' && e.code === 'Space') { state = 'name'; playerName = ''; playerPassword = ''; nameStep = 'name'; nameError = ''; }
  if (state === 'win'      && e.code === 'Space') { state = 'name'; playerName = ''; playerPassword = ''; nameStep = 'name'; nameError = ''; }

  // Pauza
  if (state === 'playing' && e.code === 'KeyP') { state = 'paused'; playSound('pause'); }
  else if (state === 'paused' && e.code === 'KeyP') { state = 'playing'; playSound('pause'); }

  if (state === 'playing' && e.code === 'KeyC' && level >= 3) { state = 'shop'; shopCursor = 0; }
  else if (state === 'shop') {
    if (e.code === 'KeyC') state = 'playing';
  }
});
document.addEventListener('keyup', e => { keys[e.code] = false; });

function saveScore() {
  const existing = leaderboard.find(e => e.name === playerName);
  if (existing) {
    if (score > existing.score) existing.score = score;
    if (level > (existing.maxLevel || 1)) existing.maxLevel = level;
  } else {
    leaderboard.push({ name: playerName, score, password: playerPassword, maxLevel: level });
  }
  leaderboard.sort((a, b) => b.score - a.score);
  if (leaderboard.length > 10) leaderboard.length = 10;
  localStorage.setItem('ss_leaderboard', JSON.stringify(leaderboard));
}

// ══════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════
function initGame(lvl) {
  level = lvl || 1; score = 0; lives = 3;
  gold = 0; bronzeBags = 0; silverBags = 0; goldBags = 0;
  shieldBronze = 0; shieldSilver = 0; shieldGold = 0; shieldHp = 0;
  comboCount = 0; comboTimer = 0; comboTexts = []; flashTimer = 0;
  resetLevel();
}

function resetLevel() {
  bullets = []; enemyBullets = []; bags = []; particles = []; comboTexts = [];
  bulletCooldown = 0; enemyDir = 1; enemyShootTimer = 0;
  bagSpawnTimer = 0; shopCursor = 0; cannon.vx = 0;
  cannon.x = W / 2;
  spawnEnemies();
}

function spawnEnemies() {
  enemies = [];
  const cfg = LEVEL_CONFIG[level - 1];
  const startX = (W - cfg.cols * 60) / 2;
  for (let r = 0; r < cfg.rows; r++)
    for (let c = 0; c < cfg.cols; c++)
      enemies.push({ x: startX + c * 60, y: 70 + r * 46, w: 44, h: 30, row: r, alive: true });
}

// ══════════════════════════════════════════════════════════════
// UPDATE
// ══════════════════════════════════════════════════════════════
function update() {
  if (state !== 'playing') return;
  updateStars();
  moveCannon(); shootBullet(); moveBullets();
  moveEnemies(); enemyShoot(); moveEnemyBullets();
  spawnBags(); moveBags();
  checkCollisions(); updateParticles(); updateCombo(); updateFlash();

  if (enemies.every(e => !e.alive)) {
    if (level >= 5) { saveScore(); state = 'win'; return; }
    level++; resetLevel();
  }
}

function updateStars() {
  stars.forEach(s => { s.y += s.speed; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } });
}

function moveCannon() {
  const accel = 0.7, friction = 0.82, maxSpd = cannon.speed;
  if (keys['ArrowLeft'])  cannon.vx = Math.max(cannon.vx - accel, -maxSpd);
  else if (keys['ArrowRight']) cannon.vx = Math.min(cannon.vx + accel, maxSpd);
  else cannon.vx *= friction;
  cannon.x = Math.max(cannon.w / 2, Math.min(W - cannon.w / 2, cannon.x + cannon.vx));
  if (bulletCooldown > 0) bulletCooldown--;
}

function shootBullet() {
  if (keys['Space'] && bulletCooldown === 0) {
    bullets.push({ x: cannon.x, y: cannon.y - cannon.h / 2, w: 4, h: 16 });
    bulletCooldown = 18;
    playSound('shoot');
  }
}

function moveBullets() {
  bullets = bullets.filter(b => b.y + b.h > 0);
  bullets.forEach(b => b.y -= 11);
}

function moveEnemies() {
  const alive = enemies.filter(e => e.alive);
  if (!alive.length) return;
  const cfg = LEVEL_CONFIG[level - 1];
  let hitWall = false;
  alive.forEach(e => { e.x += cfg.enemySpeed * enemyDir; if (e.x + e.w > W - 20 || e.x < 20) hitWall = true; });
  if (hitWall) { enemyDir *= -1; alive.forEach(e => e.y += cfg.dropY); }
}

function enemyShoot() {
  const cfg = LEVEL_CONFIG[level - 1];
  if (++enemyShootTimer < cfg.shootInterval) return;
  enemyShootTimer = 0;
  const alive = enemies.filter(e => e.alive);
  if (!alive.length) return;

  // Construieste lista de coloane (cel mai de jos inamic din fiecare coloana)
  const cols = {};
  alive.forEach(e => { const k = Math.round(e.x); if (!cols[k] || cols[k].y < e.y) cols[k] = e; });
  const colList = Object.values(cols);

  // Trage shotsPerVolley gloanțe din coloane diferite
  const shots = Math.min(cfg.shotsPerVolley, colList.length);
  const shuffled = colList.sort(() => Math.random() - 0.5).slice(0, shots);
  shuffled.forEach(s => {
    enemyBullets.push({ x: s.x + s.w / 2, y: s.y + s.h, w: 4, h: 14 });
  });
}

function moveEnemyBullets() {
  enemyBullets = enemyBullets.filter(b => b.y < H);
  enemyBullets.forEach(b => b.y += 4 + level * 0.4);
}

function spawnBags() {
  if (++bagSpawnTimer < bagSpawnInterval) return;
  bagSpawnTimer = 0; bagSpawnInterval = 200 + Math.random() * 200;
  const t = BAG_TYPES[Math.floor(Math.random() * BAG_TYPES.length)];
  bags.push({
    x: 40 + Math.random() * (W - 80), y: -40,
    w: t.w, h: t.h, type: t.type, color: t.color, label: t.label,
    speed: 2 + Math.random() * 1.5,
    sinusoidal: t.sinusoidal,
    sinOffset: Math.random() * Math.PI * 2,
    sinAmp: 40 + Math.random() * 30,
    sinFreq: 0.03 + Math.random() * 0.02,
    baseX: 40 + Math.random() * (W - 80),
    age: 0
  });
}

function moveBags() {
  bags = bags.filter(b => b.y < H + 50);
  bags.forEach(b => {
    b.y += b.speed;
    b.age++;
    if (b.sinusoidal) {
      b.x = Math.max(b.w, Math.min(W - b.w, b.baseX + Math.sin(b.age * b.sinFreq + b.sinOffset) * b.sinAmp));
    }
  });
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function checkCollisions() {
  for (const b of bullets)
    for (const e of enemies) {
      if (!e.alive) continue;
      if (rectsOverlap(b.x - 2, b.y - b.h, 4, b.h, e.x, e.y, e.w, e.h)) {
        e.alive = false; b.y = -9999;
        const pts = 10 + e.row * 5 + (level - 1) * 8;
        score += pts;
        playSound('explosion');
        // Combo
        comboTimer = COMBO_WINDOW;
        comboCount++;
        if (comboCount >= 2) {
          const mult = comboCount;
          const bonus = Math.floor(pts * (mult - 1));
          score += bonus;
          comboTexts.push({ x: e.x + e.w/2, y: e.y, text: `COMBO x${mult} +${bonus}`, life: 60, maxLife: 60 });
          playSound('combo');
        }
        spawnParticles(e.x + e.w / 2, e.y + e.h / 2, enemyColor(e.row), 14);
      }
    }

  const cx = cannon.x - cannon.w / 2, cy = cannon.y - cannon.h / 2;
  for (const b of enemyBullets)
    if (rectsOverlap(b.x - 2, b.y, 4, b.h, cx, cy, cannon.w, cannon.h)) {
      b.y = H + 999;
      if (shieldHp > 0) {
        shieldHp--;
        spawnParticles(cannon.x, cannon.y, activeShieldColor(), 10);
        // Daca scutul curent s-a terminat, activeaza urmatorul disponibil
        if (shieldHp === 0) activateNextShield();
      } else {
        lives--;
        flashTimer = 20;
        playSound('hit');
        spawnParticles(cannon.x, cannon.y, '#00e5ff', 16);
        if (lives <= 0) { saveScore(); state = 'gameover'; }
      }
    }

  for (const e of enemies)
    if (e.alive && e.y + e.h >= cy) {
      e.alive = false; score = Math.max(0, score - 20);
      spawnParticles(e.x + e.w / 2, e.y + e.h / 2, '#ff2222', 10);
    }

  for (const bag of bags)
    if (rectsOverlap(bag.x - bag.w / 2, bag.y, bag.w, bag.h, cx, cy, cannon.w, cannon.h)) {
      // Contorizeaza sacul colectat si adauga scutul corespunzator
      if (bag.type === 'bronze') { bronzeBags++; shieldBronze++; }
      else if (bag.type === 'silver') { silverBags++; shieldSilver++; }
      else if (bag.type === 'gold')   { goldBags++;   shieldGold++;   }
      activateNextShield();
      playSound('gold');
      spawnParticles(bag.x, bag.y + bag.h / 2, bag.color, 12);
      bag.y = H + 999;
    }
}

// Activeaza primul scut disponibil in ordine bronz→argint→aur
function activateNextShield() {
  if (shieldHp > 0) return; // deja un scut activ
  if (shieldBronze > 0) { shieldBronze--; shieldHp = 1; return; }
  if (shieldSilver > 0) { shieldSilver--; shieldHp = 2; return; }
  if (shieldGold   > 0) { shieldGold--;   shieldHp = 3; return; }
}

// Culoarea scutului activ in functie de hp ramas
function activeShieldColor() {
  if (shieldHp === 3) return '#ffd700';
  if (shieldHp === 2) return '#c0c0c0';
  if (shieldHp === 1) return '#cd7f32';
  return '#ffffff';
}

function updateCombo() {
  if (comboTimer > 0) { comboTimer--; if (comboTimer === 0) comboCount = 0; }
  comboTexts = comboTexts.filter(t => t.life > 0);
  comboTexts.forEach(t => { t.y -= 1.2; t.life--; });
}

function updateFlash() {
  if (flashTimer > 0) flashTimer--;
}

function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2, sp = Math.random() * 3.5 + 0.8;
    particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 28, maxLife: 28, color });
  }
}

function updateParticles() {
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life--; });
}

// ══════════════════════════════════════════════════════════════
// DRAW - canvas principal
// ══════════════════════════════════════════════════════════════
function draw() {
  ctx.fillStyle = '#04040f';
  ctx.fillRect(0, 0, W, H);
  drawNebulae(); drawStars();

  // Flash rosu la pierderea vietii
  if (flashTimer > 0) {
    ctx.fillStyle = `rgba(255,0,0,${(flashTimer / 20) * 0.45})`;
    ctx.fillRect(0, 0, W, H);
  }

  if (state === 'name')    { drawNameScreen(); return; }
  if (state === 'start')   { drawStartScreen(); return; }
  if (state === 'gameover'){ drawGameOver(); return; }
  if (state === 'win')     { drawWin(); return; }

  drawBags(); drawEnemies(); drawEnemyBullets(); drawBullets(); drawCannon(); drawParticles();
  drawComboTexts();
  drawCooldownBar();
  drawSoundIndicator();
  if (state === 'shop')   drawShop();
  if (state === 'paused') drawPause();
}

function drawNebulae() {
  nebulae.forEach(n => {
    const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
    g.addColorStop(0, n.color + 'cc'); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
  });
}

function drawStars() {
  stars.forEach(s => {
    ctx.globalAlpha = s.alpha; ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;
}

// ── Culori si forme inamici ───────────────────────────────────
// row 0: 10+0=10 pts  → forma simpla (disc)
// row 1: 10+5=15 pts  → forma triunghi
// row 2: 10+10=20 pts → forma hexagon
// row 3: 10+15=25 pts → forma cruce/stea
// row 4: 10+20=30 pts → forma diamant cu aripi
function enemyColor(row) {
  return ['#ff4455','#ff8800','#ffdd00','#44ff88','#aa44ff'][row % 5];
}

function drawEnemyShape(ctx, row, hw, hh, col) {
  ctx.fillStyle = col;
  ctx.shadowColor = col;
  ctx.shadowBlur = 14;
  if (row === 0) {
    // Disc simplu cu inel
    ctx.beginPath(); ctx.ellipse(0, 0, hw - 2, hh - 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.ellipse(0, 0, hw + 4, hh + 2, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  } else if (row === 1) {
    // Triunghi futurist cu aripioare
    ctx.beginPath();
    ctx.moveTo(0, -hh); ctx.lineTo(hw, hh); ctx.lineTo(-hw, hh); ctx.closePath(); ctx.fill();
    ctx.fillStyle = col + '88';
    ctx.beginPath(); ctx.moveTo(-hw, hh); ctx.lineTo(-hw - 8, 0); ctx.lineTo(-hw + 4, 0); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hw, hh); ctx.lineTo(hw + 8, 0); ctx.lineTo(hw - 4, 0); ctx.closePath(); ctx.fill();
  } else if (row === 2) {
    // Hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      i === 0 ? ctx.moveTo(Math.cos(a)*hw, Math.sin(a)*hh) : ctx.lineTo(Math.cos(a)*hw, Math.sin(a)*hh);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ffffff44'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      i === 0 ? ctx.moveTo(Math.cos(a)*(hw-6), Math.sin(a)*(hh-4)) : ctx.lineTo(Math.cos(a)*(hw-6), Math.sin(a)*(hh-4));
    }
    ctx.closePath(); ctx.stroke();
  } else if (row === 3) {
    // Stea cu 4 brate
    const pts = [[0,-hh],[hw*0.35,-hh*0.35],[hw,0],[hw*0.35,hh*0.35],[0,hh],[-hw*0.35,hh*0.35],[-hw,0],[-hw*0.35,-hh*0.35]];
    ctx.beginPath(); pts.forEach((p,i) => i===0?ctx.moveTo(p[0],p[1]):ctx.lineTo(p[0],p[1])); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff33';
    ctx.beginPath(); ctx.ellipse(0, 0, hw*0.3, hh*0.3, 0, 0, Math.PI*2); ctx.fill();
  } else {
    // Diamant cu aripi duble
    ctx.beginPath();
    ctx.moveTo(0, -hh); ctx.lineTo(hw, 0); ctx.lineTo(0, hh); ctx.lineTo(-hw, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = col + 'aa';
    ctx.beginPath(); ctx.moveTo(hw, 0); ctx.lineTo(hw+12, -hh*0.5); ctx.lineTo(hw+12, hh*0.5); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-hw, 0); ctx.lineTo(-hw-12, -hh*0.5); ctx.lineTo(-hw-12, hh*0.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff55';
    ctx.beginPath(); ctx.ellipse(0, 0, hw*0.25, hh*0.25, 0, 0, Math.PI*2); ctx.fill();
  }
  ctx.shadowBlur = 0;
}

function drawEnemies() {
  enemies.forEach(e => {
    if (!e.alive) return;
    const col = enemyColor(e.row);
    ctx.save();
    ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
    drawEnemyShape(ctx, e.row, e.w / 2, e.h / 2, col);
    ctx.restore();
  });
}

// ── Tun realist futurist ──────────────────────────────────────
function drawCannon() {
  const x = cannon.x, y = cannon.y;
  ctx.save();

  // Corp principal — forma de nava
  ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 22;

  // Baza trapezoidala
  ctx.fillStyle = '#0d2a45';
  ctx.beginPath();
  ctx.moveTo(x - cannon.w/2, y + cannon.h/2);
  ctx.lineTo(x + cannon.w/2, y + cannon.h/2);
  ctx.lineTo(x + cannon.w/2 - 8, y - cannon.h/2);
  ctx.lineTo(x - cannon.w/2 + 8, y - cannon.h/2);
  ctx.closePath(); ctx.fill();

  // Detalii laterale (panouri)
  ctx.fillStyle = '#00e5ff33';
  ctx.fillRect(x - cannon.w/2, y - cannon.h/2, 5, cannon.h);
  ctx.fillRect(x + cannon.w/2 - 5, y - cannon.h/2, 5, cannon.h);

  // Linie centrala luminoasa
  ctx.fillStyle = '#00e5ff';
  ctx.fillRect(x - 1, y - cannon.h/2, 2, cannon.h);

  // Teava tunului — dubla
  ctx.fillStyle = '#00aacc';
  ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 16;
  // Teava stanga
  ctx.beginPath();
  ctx.moveTo(x - 10, y - cannon.h/2);
  ctx.lineTo(x - 5,  y - cannon.h/2 - 26);
  ctx.lineTo(x - 1,  y - cannon.h/2 - 26);
  ctx.lineTo(x - 1,  y - cannon.h/2);
  ctx.closePath(); ctx.fill();
  // Teava dreapta
  ctx.beginPath();
  ctx.moveTo(x + 10, y - cannon.h/2);
  ctx.lineTo(x + 5,  y - cannon.h/2 - 26);
  ctx.lineTo(x + 1,  y - cannon.h/2 - 26);
  ctx.lineTo(x + 1,  y - cannon.h/2);
  ctx.closePath(); ctx.fill();

  // Varf teava — accent luminos
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 10, y - cannon.h/2 - 28, 5, 4);
  ctx.fillRect(x + 5,  y - cannon.h/2 - 28, 5, 4);

  // Aripioare laterale
  ctx.fillStyle = '#0a3a5a';
  ctx.beginPath();
  ctx.moveTo(x - cannon.w/2, y + cannon.h/2);
  ctx.lineTo(x - cannon.w/2 - 14, y + cannon.h/2 + 6);
  ctx.lineTo(x - cannon.w/2 - 14, y);
  ctx.lineTo(x - cannon.w/2, y - cannon.h/4);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + cannon.w/2, y + cannon.h/2);
  ctx.lineTo(x + cannon.w/2 + 14, y + cannon.h/2 + 6);
  ctx.lineTo(x + cannon.w/2 + 14, y);
  ctx.lineTo(x + cannon.w/2, y - cannon.h/4);
  ctx.closePath(); ctx.fill();

  // Scut activ
  if (shieldHp > 0) {
    const sc = activeShieldColor();
    ctx.strokeStyle = sc;
    ctx.lineWidth = 3; ctx.globalAlpha = 0.7;
    ctx.shadowColor = sc; ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.arc(x, y, cannon.w/2 + 18, 0, Math.PI*2); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ── Bara cooldown tragere ─────────────────────────────────────
function drawCooldownBar() {
  const bw = cannon.w + 28;
  const bx = cannon.x - bw / 2;
  const by = cannon.y + cannon.h / 2 + 8;
  const fill = 1 - bulletCooldown / 18;
  ctx.fillStyle = '#0a1a2a';
  ctx.fillRect(bx, by, bw, 5);
  const grad = ctx.createLinearGradient(bx, by, bx + bw, by);
  grad.addColorStop(0, '#00e5ff');
  grad.addColorStop(1, '#ffffff');
  ctx.fillStyle = fill >= 1 ? '#44ff88' : grad;
  ctx.fillRect(bx, by, bw * fill, 5);
  ctx.strokeStyle = '#00e5ff44'; ctx.lineWidth = 1;
  ctx.strokeRect(bx, by, bw, 5);
}

function drawBullets() {
  bullets.forEach(b => {
    ctx.save(); ctx.shadowColor = '#ffff88'; ctx.shadowBlur = 10;
    const g = ctx.createLinearGradient(b.x, b.y - b.h, b.x, b.y);
    g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#ffcc00');
    ctx.fillStyle = g; ctx.fillRect(b.x - 2, b.y - b.h, 4, b.h);
    ctx.restore();
  });
}

function drawEnemyBullets() {
  enemyBullets.forEach(b => {
    ctx.save(); ctx.shadowColor = '#ff4444'; ctx.shadowBlur = 8;
    ctx.fillStyle = '#ff6666'; ctx.fillRect(b.x - 2, b.y, 4, b.h);
    ctx.restore();
  });
}

function drawBags() {
  bags.forEach(bag => {
    ctx.save(); ctx.shadowColor = bag.color; ctx.shadowBlur = 14;
    ctx.fillStyle = bag.color;
    ctx.beginPath(); ctx.arc(bag.x, bag.y + bag.h * 0.55, bag.w * 0.42, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(bag.x - bag.w * 0.15, bag.y + bag.h * 0.1, bag.w * 0.3, bag.h * 0.25);
    ctx.fillStyle = '#000000aa';
    ctx.beginPath(); ctx.arc(bag.x, bag.y + bag.h * 0.55, bag.w * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = `bold ${bag.w < 32 ? 9 : 11}px monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(bag.label, bag.x, bag.y + bag.h * 0.55);
    // Indicator sinusoidal pentru sacul de aur
    if (bag.sinusoidal) {
      ctx.strokeStyle = '#ffd70088'; ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(bag.x, bag.y - 10); ctx.lineTo(bag.x, bag.y - 20); ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  });
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}

function drawParticles() {
  particles.forEach(p => {
    ctx.globalAlpha = p.life / p.maxLife; ctx.fillStyle = p.color;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  });
  ctx.globalAlpha = 1;
}

function drawComboTexts() {
  comboTexts.forEach(t => {
    ctx.globalAlpha = t.life / t.maxLife;
    ctx.fillStyle = '#ffdd00';
    ctx.shadowColor = '#ffdd00'; ctx.shadowBlur = 12;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(t.text, t.x, t.y);
    ctx.shadowBlur = 0;
  });
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}

function drawSoundIndicator() {
  const icon = soundEnabled ? '🔊' : '🔇';
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = soundEnabled ? '#44ff88' : '#ff4444';
  ctx.shadowColor = soundEnabled ? '#44ff88' : '#ff4444';
  ctx.shadowBlur = 8;
  ctx.fillText(`${icon} S`, W - 12, 22);
  ctx.shadowBlur = 0;
  ctx.restore();
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y); c.arcTo(x + w, y, x + w, y + r, r);
  c.lineTo(x + w, y + h - r); c.arcTo(x + w, y + h, x + w - r, y + h, r);
  c.lineTo(x + r, y + h); c.arcTo(x, y + h, x, y + h - r, r);
  c.lineTo(x, y + r); c.arcTo(x, y, x + r, y, r);
  c.closePath();
}

function drawShop() {
  ctx.fillStyle = 'rgba(0,0,0,0.82)'; ctx.fillRect(0, 0, W, H);
  const bx = W/2-240, by = H/2-170, bw = 480, bh = 340;
  ctx.fillStyle = '#050f20'; roundRect(ctx, bx, by, bw, bh, 16); ctx.fill();
  ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 2; roundRect(ctx, bx, by, bw, bh, 16); ctx.stroke();
  ctx.textAlign = 'center'; ctx.fillStyle = '#00e5ff'; ctx.font = 'bold 22px monospace';
  ctx.fillText('⚔  STOC SCUTURI', W/2, by+36);

  // Stoc saci colectati
  ctx.font = '13px monospace'; ctx.fillStyle = '#888888';
  ctx.fillText('Saci colectați:', W/2, by+62);
  const bagInfo = [
    { label: '🥉 Bronz', count: bronzeBags, color: '#cd7f32' },
    { label: '🥈 Argint', count: silverBags, color: '#c0c0c0' },
    { label: '🥇 Aur',   count: goldBags,   color: '#ffd700' },
  ];
  bagInfo.forEach((b, i) => {
    ctx.fillStyle = b.color; ctx.font = 'bold 14px monospace';
    ctx.fillText(`${b.label}: ${b.count}`, W/2 - 140 + i * 140, by + 82);
  });

  // Scuturi disponibile
  const shieldData = [
    { name: 'Scut Bronz',  hp: 1, color: '#cd7f32', stock: shieldBronze, desc: 'Absoarbe 1 impact',   bagType: '🥉 1 sac bronz' },
    { name: 'Scut Argint', hp: 2, color: '#c0c0c0', stock: shieldSilver, desc: 'Absoarbe 2 impacturi', bagType: '🥈 1 sac argint' },
    { name: 'Scut Aur',    hp: 3, color: '#ffd700', stock: shieldGold,   desc: 'Absoarbe 3 impacturi', bagType: '🥇 1 sac aur' },
  ];
  shieldData.forEach((item, i) => {
    const iy = by + 100 + i * 72, sel = i === shopCursor;
    ctx.fillStyle = sel ? '#0a2a4a' : '#050f20'; roundRect(ctx, bx+20, iy, bw-40, 60, 10); ctx.fill();
    if (sel) { ctx.strokeStyle = item.color; ctx.lineWidth = 2; roundRect(ctx, bx+20, iy, bw-40, 60, 10); ctx.stroke(); }
    ctx.fillStyle = item.color; ctx.shadowColor = item.color; ctx.shadowBlur = sel ? 14 : 0;
    ctx.beginPath(); ctx.arc(bx+56, iy+30, 18, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = sel ? '#ffffff' : '#aaaaaa'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'left';
    ctx.fillText(item.name, bx+84, iy+20);
    ctx.fillStyle = '#888888'; ctx.font = '12px monospace';
    ctx.fillText(`${item.desc}  |  Cost: ${item.bagType}`, bx+84, iy+38);
    ctx.fillStyle = item.stock > 0 ? '#44ff88' : '#ff4444'; ctx.font = 'bold 13px monospace';
    ctx.fillText(`Stoc: ${item.stock}`, bx+84, iy+54);
    ctx.textAlign = 'right';
    ctx.fillStyle = item.stock > 0 ? '#ffd700' : '#555555';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(item.stock > 0 ? 'DISPONIBIL' : 'INDISPONIBIL', bx+bw-30, iy+34);
  });
  ctx.textAlign = 'center'; ctx.fillStyle = '#44ff88'; ctx.font = '13px monospace';
  ctx.fillText('Scuturile se activează automat în ordine: Bronz → Argint → Aur', W/2, by+bh-30);
  ctx.fillText('C  Închide', W/2, by+bh-12);
  ctx.textAlign = 'left';
}

function drawPause() {
  ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00e5ff'; ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 30;
  ctx.font = 'bold 64px monospace'; ctx.fillText('PAUZĂ', W/2, H/2 - 30);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#aaaaaa'; ctx.font = '20px monospace';
  ctx.fillText('Apasă P pentru a continua', W/2, H/2 + 30);
  ctx.textAlign = 'left';
}

// ── Ecrane ────────────────────────────────────────────────────
function drawNameScreen() {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00e5ff'; ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 24;
  ctx.font = 'bold 52px monospace'; ctx.fillText('SPACE SHOOTER', W/2, 80);
  ctx.shadowBlur = 0;

  const rules = [
    '📋  REGULI DE JOC', '',
    '← →   Mișcă tunul stânga / dreapta',
    'SPACE  Trage proiectile   P  Pauză   S  Sunet on/off',
    '',
    '🛸  Navele coboară în grupuri — distruge-le înainte',
    '     să ajungă la linia tunului (-20 puncte fiecare)',
    '',
    '💰  Saci cu resurse cad din cer — prinde-i cu tunul',
    '     🥉 Bronz → scut 1hp  |  🥈 Argint → scut 2hp  |  🥇 Aur → scut 3hp',
    '     Sacii de aur se mișcă sinusoidal — mai greu de prins!',
    '',
    '🛡  Scuturile se activează automat în ordine: Bronz → Argint → Aur',
    '     De la nivelul 3 apasă [C] pentru a vedea stocul de scuturi',
    '',
    '❤  Ai 3 vieți — jocul se termină când le pierzi pe toate',
    '',
    '🏆  5 nivele cu dificultate crescătoare',
    '     Nivel 1: Ușor  →  Nivel 5: Extrem',
  ];

  ctx.font = '14px monospace'; ctx.textAlign = 'left';
  const rx = W/2 - 320, ry = 110;
  ctx.fillStyle = 'rgba(0,10,30,0.7)';
  roundRect(ctx, rx, ry, 640, rules.length * 20 + 16, 10); ctx.fill();
  ctx.strokeStyle = '#00e5ff22'; ctx.lineWidth = 1;
  roundRect(ctx, rx, ry, 640, rules.length * 20 + 16, 10); ctx.stroke();

  rules.forEach((line, i) => {
    if (line === '📋  REGULI DE JOC') { ctx.fillStyle = '#00e5ff'; ctx.font = 'bold 14px monospace'; }
    else if (line === '') { return; }
    else { ctx.fillStyle = '#aaaaaa'; ctx.font = '13px monospace'; }
    ctx.fillText(line, rx + 16, ry + 20 + i * 20);
  });

  const iy = ry + rules.length * 20 + 36;
  ctx.textAlign = 'center';
  const nameActive = nameStep === 'name';
  ctx.fillStyle = nameActive ? '#ffffff' : '#666666'; ctx.font = '16px monospace';
  ctx.fillText('Nume jucător:', W/2, iy);
  roundRect(ctx, W/2 - 180, iy + 8, 360, 44, 10);
  ctx.fillStyle = '#0a1a2a'; ctx.fill();
  ctx.strokeStyle = nameActive ? (nameError ? '#ff4444' : '#00e5ff') : '#334455';
  ctx.lineWidth = 2; roundRect(ctx, W/2 - 180, iy + 8, 360, 44, 10); ctx.stroke();
  ctx.fillStyle = nameActive ? '#ffffff' : '#556677'; ctx.font = 'bold 22px monospace';
  ctx.fillText(playerName + (nameActive && Math.floor(Date.now()/500)%2 ? '|' : ''), W/2, iy + 36);

  const passActive = nameStep === 'password';
  ctx.fillStyle = passActive ? '#ffffff' : '#666666'; ctx.font = '16px monospace';
  ctx.fillText('Parolă (max 6 caractere):', W/2, iy + 66);
  roundRect(ctx, W/2 - 180, iy + 74, 360, 44, 10);
  ctx.fillStyle = '#0a1a2a'; ctx.fill();
  ctx.strokeStyle = passActive ? (nameError ? '#ff4444' : '#00e5ff') : '#334455';
  ctx.lineWidth = 2; roundRect(ctx, W/2 - 180, iy + 74, 360, 44, 10); ctx.stroke();
  ctx.fillStyle = passActive ? '#ffffff' : '#556677'; ctx.font = 'bold 22px monospace';
  const maskedPass = '●'.repeat(playerPassword.length) + (passActive && Math.floor(Date.now()/500)%2 ? '|' : '');
  ctx.fillText(maskedPass, W/2, iy + 102);

  if (nameError) { ctx.fillStyle = '#ff4444'; ctx.font = '13px monospace'; ctx.fillText(nameError, W/2, iy + 130); }
  else {
    ctx.fillStyle = '#44ff88'; ctx.font = '14px monospace';
    const hint = nameStep === 'name' ? 'Apasă ENTER pentru a continua la parolă' : 'Apasă ENTER pentru a intra în joc';
    ctx.fillText(hint, W/2, iy + 130);
  }
  ctx.textAlign = 'left';
}

function drawStartScreen() {
  startAnim = Math.min(1, startAnim + 0.025);
  const ease = startAnim < 1 ? 1 - Math.pow(1 - startAnim, 3) : 1;
  const scale = 0.4 + ease * 0.6;
  const alpha = ease;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(W/2, H/2 - 110);
  ctx.scale(scale, scale);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00e5ff'; ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 30;
  ctx.font = 'bold 68px monospace'; ctx.fillText('SPACE SHOOTER', 0, 0);
  ctx.shadowBlur = 0;
  ctx.restore();

  ctx.globalAlpha = Math.max(0, (startAnim - 0.4) / 0.6);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700'; ctx.font = 'bold 20px monospace';
  ctx.fillText(`Bun venit, ${playerName}!`, W/2, H/2 - 50);
  ctx.fillStyle = '#ffffff'; ctx.font = '22px monospace';
  ctx.fillText('Apasă SPACE pentru a începe', W/2, H/2);
  ctx.fillStyle = '#aaaaaa'; ctx.font = '15px monospace';
  const lines = ['← → Mișcare tun   SPACE Trage   P Pauză   S Sunet on/off','🥉🥈🥇 Prinde saci — fiecare sac = un scut automat','De la nivelul 3 apasă [C] pentru stocul de scuturi','Navele care trec linia scad 20 puncte','5 nivele cu dificultate crescătoare'];
  lines.forEach((l, i) => ctx.fillText(l, W/2, H/2 + 40 + i * 24));
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}

function drawGameOver() {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff4444'; ctx.shadowColor = '#ff4444'; ctx.shadowBlur = 30;
  ctx.font = 'bold 72px monospace'; ctx.fillText('GAME OVER', W/2, H/2 - 90);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff'; ctx.font = '26px monospace';
  ctx.fillText(`${playerName} — Nivel ${level}`, W/2, H/2 - 20);
  ctx.fillText(`Punctaj: ${score}`, W/2, H/2 + 20);
  ctx.fillStyle = '#ffd700'; ctx.fillText(`Gold: ${gold}`, W/2, H/2 + 60);
  ctx.fillStyle = '#00e5ff'; ctx.font = '20px monospace';
  ctx.fillText('Apasă SPACE pentru a reîncerca', W/2, H/2 + 110);
  ctx.textAlign = 'left';
}

function drawWin() {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700'; ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 40;
  ctx.font = 'bold 58px monospace'; ctx.fillText('FELICITĂRI!', W/2, H/2 - 90);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff'; ctx.font = '24px monospace';
  ctx.fillText(`${playerName} — toate 5 nivele completate!`, W/2, H/2 - 20);
  ctx.fillText(`Punctaj: ${score}`, W/2, H/2 + 24);
  ctx.fillStyle = '#ffd700'; ctx.fillText(`Gold: ${gold}`, W/2, H/2 + 64);
  ctx.fillStyle = '#00e5ff'; ctx.font = '20px monospace';
  ctx.fillText('Apasă SPACE pentru a juca din nou', W/2, H/2 + 114);
  ctx.textAlign = 'left';
}

// ══════════════════════════════════════════════════════════════
// DRAW - panou lateral
// ══════════════════════════════════════════════════════════════
function drawSidePanel() {
  const s = sctx;
  s.fillStyle = '#04040f'; s.fillRect(0, 0, SW, H);
  s.strokeStyle = '#00e5ff33'; s.lineWidth = 1;
  s.beginPath(); s.moveTo(0, 0); s.lineTo(0, H); s.stroke();

  const pad = 14; let y = 20;

  s.fillStyle = '#00e5ff'; s.font = 'bold 16px monospace'; s.textAlign = 'center';
  s.shadowColor = '#00e5ff'; s.shadowBlur = 10;
  s.fillText('◈ PANOU DE JOC ◈', SW / 2, y); s.shadowBlur = 0; y += 6;

  s.strokeStyle = '#00e5ff44'; s.lineWidth = 1;
  s.beginPath(); s.moveTo(pad, y); s.lineTo(SW - pad, y); s.stroke(); y += 18;

  s.textAlign = 'left';
  s.fillStyle = '#888888'; s.font = '12px monospace'; s.fillText('JUCĂTOR', pad, y); y += 18;
  s.fillStyle = '#ffd700'; s.font = 'bold 15px monospace';
  s.fillText(playerName || '—', pad, y); y += 22;

  s.strokeStyle = '#ffffff11'; s.beginPath(); s.moveTo(pad, y); s.lineTo(SW-pad, y); s.stroke(); y += 14;

  s.fillStyle = '#888888'; s.font = '12px monospace'; s.fillText('NIVEL', pad, y); y += 18;
  const diffs = ['Ușor','Normal','Mediu','Greu','Extrem'];
  s.fillStyle = '#ffdd44'; s.font = 'bold 15px monospace';
  s.fillText(`${level} / 5  —  ${diffs[Math.min(level-1,4)]}`, pad, y); y += 22;

  s.strokeStyle = '#ffffff11'; s.beginPath(); s.moveTo(pad, y); s.lineTo(SW-pad, y); s.stroke(); y += 14;

  s.fillStyle = '#888888'; s.font = '12px monospace'; s.fillText('PUNCTE', pad, y); y += 18;
  s.fillStyle = '#ffffff'; s.font = 'bold 18px monospace'; s.fillText(String(score), pad, y); y += 24;

  s.strokeStyle = '#ffffff11'; s.beginPath(); s.moveTo(pad, y); s.lineTo(SW-pad, y); s.stroke(); y += 14;

  s.fillStyle = '#888888'; s.font = '12px monospace'; s.fillText('VIEȚI', pad, y); y += 18;
  for (let i = 0; i < 3; i++) {
    s.fillStyle = i < lives ? '#ff4455' : '#2a1a1a';
    s.beginPath(); s.arc(pad + 12 + i * 30, y, 10, 0, Math.PI * 2); s.fill();
    if (i < lives) { s.fillStyle = '#ff8899'; s.beginPath(); s.arc(pad + 9 + i * 30, y - 3, 3, 0, Math.PI * 2); s.fill(); }
  }
  y += 26;

  s.strokeStyle = '#ffffff11'; s.beginPath(); s.moveTo(pad, y); s.lineTo(SW-pad, y); s.stroke(); y += 14;

  s.fillStyle = '#888888'; s.font = '12px monospace'; s.fillText('GOLD', pad, y); y += 18;
  s.fillStyle = '#ffd700'; s.font = 'bold 16px monospace';
  s.shadowColor = '#ffd700'; s.shadowBlur = 6;
  s.fillText(`⬡ ${gold}`, pad, y); s.shadowBlur = 0; y += 24;

  s.strokeStyle = '#ffffff11'; s.beginPath(); s.moveTo(pad, y); s.lineTo(SW-pad, y); s.stroke(); y += 14;

  // Saci colectati
  s.fillStyle = '#888888'; s.font = '12px monospace'; s.fillText('SACI COLECTAȚI', pad, y); y += 16;
  const bagRow = [
    { label: '🥉', count: bronzeBags, color: '#cd7f32' },
    { label: '🥈', count: silverBags, color: '#c0c0c0' },
    { label: '🥇', count: goldBags,   color: '#ffd700' },
  ];
  bagRow.forEach((b, i) => {
    s.fillStyle = b.color; s.font = 'bold 12px monospace';
    s.fillText(`${b.label}×${b.count}`, pad + i * 74, y);
  });
  y += 20;

  s.strokeStyle = '#ffffff11'; s.beginPath(); s.moveTo(pad, y); s.lineTo(SW-pad, y); s.stroke(); y += 14;

  // Scut activ
  s.fillStyle = '#888888'; s.font = '12px monospace'; s.fillText('SCUT ACTIV', pad, y); y += 16;
  if (shieldHp > 0) {
    const sc = activeShieldColor();
    const scName = shieldHp === 3 ? 'Aur' : shieldHp === 2 ? 'Argint' : 'Bronz';
    s.fillStyle = sc; s.font = 'bold 13px monospace';
    s.shadowColor = sc; s.shadowBlur = 8;
    s.fillText(`◉ Scut ${scName}  (${shieldHp} hp)`, pad, y); s.shadowBlur = 0;
  } else {
    s.fillStyle = '#444444'; s.font = '13px monospace'; s.fillText('— fără scut —', pad, y);
  }
  y += 18;

  // Stoc scuturi in asteptare
  s.fillStyle = '#888888'; s.font = '11px monospace'; s.fillText('În așteptare:', pad, y); y += 14;
  const shieldStock = [
    { label: '🥉', count: shieldBronze, color: '#cd7f32' },
    { label: '🥈', count: shieldSilver, color: '#c0c0c0' },
    { label: '🥇', count: shieldGold,   color: '#ffd700' },
  ];
  shieldStock.forEach((sh, i) => {
    s.fillStyle = sh.count > 0 ? sh.color : '#333333';
    s.font = sh.count > 0 ? 'bold 12px monospace' : '12px monospace';
    s.fillText(`${sh.label}×${sh.count}`, pad + i * 74, y);
  });
  y += 20;

  if (level >= 3) {
    s.strokeStyle = '#ffffff11'; s.beginPath(); s.moveTo(pad, y); s.lineTo(SW-pad, y); s.stroke(); y += 14;
    s.fillStyle = '#44ff88'; s.font = '12px monospace';
    s.fillText('[C] Deschide magazin', pad, y); y += 20;
  }

  // Legenda forme inamici
  s.strokeStyle = '#ffffff11'; s.beginPath(); s.moveTo(pad, y); s.lineTo(SW-pad, y); s.stroke(); y += 14;
  s.textAlign = 'center'; s.fillStyle = '#00e5ff'; s.font = 'bold 12px monospace';
  s.fillText('TIPURI INAMICI', SW/2, y); y += 16;
  const shapes = ['Disc — 10 pts','Triunghi — 15 pts','Hexagon — 20 pts','Stea — 25 pts','Diamant — 30 pts'];
  const shapeColors = ['#ff4455','#ff8800','#ffdd00','#44ff88','#aa44ff'];
  s.textAlign = 'left';
  shapes.forEach((sh, i) => {
    s.fillStyle = shapeColors[i]; s.font = '11px monospace';
    s.fillText(`● ${sh}`, pad, y); y += 16;
  });

  // Clasament
  y += 6;
  s.strokeStyle = '#00e5ff44'; s.lineWidth = 1;
  s.beginPath(); s.moveTo(pad, y); s.lineTo(SW-pad, y); s.stroke(); y += 16;
  s.textAlign = 'center'; s.fillStyle = '#00e5ff'; s.font = 'bold 14px monospace';
  s.fillText('🏆 CLASAMENT', SW/2, y); y += 20;

  if (leaderboard.length === 0) {
    s.fillStyle = '#555555'; s.font = '12px monospace'; s.fillText('— nicio partidă —', SW/2, y);
  } else {
    s.textAlign = 'left';
    leaderboard.slice(0, 10).forEach((entry, i) => {
      const isPlayer = entry.name === playerName;
      const medal = ['🥇','🥈','🥉'][i] || '';
      const rank = `${i + 1}.`;
      s.fillStyle = isPlayer ? '#ffd700' : (i === 0 ? '#ffffff' : i < 3 ? '#cccccc' : '#888888');
      s.font = isPlayer ? 'bold 11px monospace' : '11px monospace';
      // Numar + medalie
      s.fillText(`${rank}${medal}`, pad, y);
      // Nume (trunchiat)
      const nameShort = entry.name.length > 7 ? entry.name.slice(0, 7) + '…' : entry.name;
      s.fillText(nameShort, pad + 34, y);
      // Scor + nivel
      s.textAlign = 'right';
      s.fillText(`${entry.score}(N${entry.maxLevel || 1})`, SW - pad, y);
      s.textAlign = 'left';
      y += 17;
    });
  }
  s.textAlign = 'left';
}

// ══════════════════════════════════════════════════════════════
// LOOP
// ══════════════════════════════════════════════════════════════
function loop() {
  update();
  draw();
  drawSidePanel();
  requestAnimationFrame(loop);
}

loop();
