/* GALAXY STRIKE - Pure JS Space Shooter Engine */

// SVG Asset Generators (Converts SVG string to HTML Image Object)
function createSvgDataUri(svgString) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
}

const SVGS = {
    player: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,4 42,24 58,40 44,52 32,44 20,52 6,40 22,24" fill="#00f0ff" stroke="#ffffff" stroke-width="2"/><polygon points="32,12 38,28 32,36 26,28" fill="#ff0077"/><circle cx="32" cy="48" r="4" fill="#ffaa00"/></svg>`,
    asteroid_small: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><polygon points="16,2 28,8 30,22 18,30 4,24 2,10" fill="#667788" stroke="#445566" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#445566"/><circle cx="20" cy="20" r="2" fill="#445566"/></svg>`,
    asteroid_large: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,4 56,16 60,44 38,60 12,54 4,28 16,8" fill="#556677" stroke="#334455" stroke-width="3"/><circle cx="24" cy="20" r="6" fill="#334455"/><circle cx="42" cy="38" r="8" fill="#334455"/><circle cx="20" cy="42" r="4" fill="#334455"/></svg>`,
    asteroid_fast: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><polygon points="16,0 30,12 24,32 8,32 2,12" fill="#aa5533" stroke="#ff5500" stroke-width="2"/><circle cx="16" cy="16" r="4" fill="#ff5500"/></svg>`,
    enemy_ship: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><polygon points="24,44 4,16 14,4 24,12 34,4 44,16" fill="#ff0055" stroke="#ffffff" stroke-width="2"/><circle cx="24" cy="24" r="6" fill="#ffff00"/></svg>`,
    enemy_tough: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56"><path d="M28,52 L4,28 L12,8 L28,20 L44,8 L52,28 Z" fill="#aa00ff" stroke="#00ffff" stroke-width="2"/><rect x="20" y="24" width="16" height="12" fill="#00ffff"/></svg>`,
    boss: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><polygon points="64,120 10,70 24,20 64,40 104,20 118,70" fill="#ff0000" stroke="#ffaa00" stroke-width="4"/><circle cx="64" cy="64" r="20" fill="#000000" stroke="#ff0000" stroke-width="3"/><circle cx="64" cy="64" r="10" fill="#ffaa00"/><polygon points="30,40 10,10 40,25" fill="#ff5500"/><polygon points="98,40 118,10 88,25" fill="#ff5500"/></svg>`,
    laser: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 24"><rect x="1" y="0" width="6" height="24" rx="3" fill="#00f0ff"/></svg>`,
    laser_big: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 32"><rect x="1" y="0" width="14" height="32" rx="7" fill="#b700ff" stroke="#ffffff" stroke-width="1"/></svg>`,
    powerup_fastfire: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#ffe600"/><text x="16" y="21" font-size="14" font-weight="bold" text-anchor="middle" fill="#000">F</text></svg>`,
    powerup_doublefire: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#00a2ff"/><text x="16" y="21" font-size="14" font-weight="bold" text-anchor="middle" fill="#000">D</text></svg>`,
    powerup_bigfire: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#b700ff"/><text x="16" y="21" font-size="14" font-weight="bold" text-anchor="middle" fill="#fff">B</text></svg>`,
    powerup_rapidfire: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#ff2200"/><text x="16" y="21" font-size="14" font-weight="bold" text-anchor="middle" fill="#fff">R</text></svg>`,
    powerup_shield: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#00ffff"/><text x="16" y="21" font-size="14" font-weight="bold" text-anchor="middle" fill="#000">S</text></svg>`,
    powerup_extralife: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#00ff66"/><text x="16" y="21" font-size="14" font-weight="bold" text-anchor="middle" fill="#000">+1</text></svg>`,
    powerup_scoreboost: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#ffaa00"/><text x="16" y="21" font-size="14" font-weight="bold" text-anchor="middle" fill="#000">2X</text></svg>`
};

const images = {};
let loadedImagesCount = 0;
const totalImages = Object.keys(SVGS).length;

function loadAssets(callback) {
    for (let key in SVGS) {
        images[key] = new Image();
        images[key].onload = () => {
            loadedImagesCount++;
            if (loadedImagesCount === totalImages) callback();
        };
        images[key].src = createSvgDataUri(SVGS[key]);
    }
}

// Web Audio API Synthesizer
class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.musicEnabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
    }

    playLaser() {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playExplosion() {
        if (!this.enabled || !this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.3);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
    }

    playPowerup() {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }
}

const sounds = new SoundManager();

// Game State Engine
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameState = 'MENU'; // MENU, PLAYING, PAUSED, GAMEOVER
let settings = {
    sound: true,
    music: true,
    shake: true,
    difficulty: 'NORMAL' // EASY, NORMAL, HARD
};

let lastTime = 0;
let score = 0;
let highScore = localStorage.getItem('gs_highscore') || 0;
let level = 1;
let lives = 3;
let health = 100;
let screenShakeTimer = 0;

// Entities
let player;
let bullets = [];
let enemyBullets = [];
let enemies = [];
let powerups = [];
let particles = [];
let stars = [];
let boss = null;

// Controls
const keys = {};
let mouseX = 0;
let isMouseDown = false;
let touchX = null;

// Difficulty Multipliers
const diffMultipliers = {
    EASY: { speed: 0.8, hp: 0.8, spawn: 1.2 },
    NORMAL: { speed: 1.0, hp: 1.0, spawn: 1.0 },
    HARD: { speed: 1.3, hp: 1.4, spawn: 0.8 }
};

class Player {
    constructor() {
        this.width = 50;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 100;
        this.speed = 400;
        this.lastShot = 0;
        this.activePowerups = {}; // type -> expireTime
    }

    update(dt) {
        let moveDir = 0;
        if (keys['KeyA'] || keys['ArrowLeft']) moveDir -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) moveDir += 1;

        if (moveDir !== 0) {
            this.x += moveDir * this.speed * dt;
        } else if (touchX !== null) {
            this.x += (touchX - (this.x + this.width / 2)) * 0.15;
        }

        // Clamp to screen
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));

        // Auto Fire
        const now = performance.now();
        let fireRate = 250; // ms
        if (this.activePowerups['FAST']) fireRate = 120;
        if (this.activePowerups['RAPID']) fireRate = 70;

        if ((keys['Space'] || isMouseDown) && now - this.lastShot > fireRate) {
            this.shoot();
            this.lastShot = now;
        }

        // Clean expired powerups
        for (let p in this.activePowerups) {
            if (now > this.activePowerups[p]) {
                delete this.activePowerups[p];
            }
        }
    }

    shoot() {
        sounds.playLaser();
        const px = this.x + this.width / 2;

        if (this.activePowerups['DOUBLE']) {
            bullets.push(new Bullet(px - 15, this.y, 0, -600, 'laser'));
            bullets.push(new Bullet(px + 15, this.y, 0, -600, 'laser'));
        } else if (this.activePowerups['BIG']) {
            bullets.push(new Bullet(px - 8, this.y, 0, -500, 'laser_big', 30));
        } else {
            bullets.push(new Bullet(px - 4, this.y, 0, -600, 'laser'));
        }
    }

    draw() {
        ctx.drawImage(images.player, this.x, this.y, this.width, this.height);

        // Shield render
        if (this.activePowerups['SHIELD']) {
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width * 0.7, 0, Math.PI * 2);
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ffff';
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }
}

class Bullet {
    constructor(x, y, vx, vy, type = 'laser', damage = 10) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type;
        this.width = type === 'laser_big' ? 16 : 8;
        this.height = type === 'laser_big' ? 32 : 24;
        this.damage = damage;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    draw() {
        ctx.drawImage(images[this.type], this.x, this.y, this.width, this.height);
    }
}

class Enemy {
    constructor(type) {
        this.type = type;
        const diff = diffMultipliers[settings.difficulty];

        if (type === 'asteroid_small') {
            this.width = 30; this.height = 30; this.hp = 10; this.score = 50; this.speed = 180 * diff.speed;
        } else if (type === 'asteroid_large') {
            this.width = 60; this.height = 60; this.hp = 30; this.score = 150; this.speed = 100 * diff.speed;
        } else if (type === 'asteroid_fast') {
            this.width = 28; this.height = 28; this.hp = 10; this.score = 100; this.speed = 280 * diff.speed;
        } else if (type === 'enemy_ship') {
            this.width = 45; this.height = 45; this.hp = 25; this.score = 200; this.speed = 140 * diff.speed;
            this.lastShot = 0;
        } else if (type === 'enemy_tough') {
            this.width = 55; this.height = 55; this.hp = 60; this.score = 400; this.speed = 80 * diff.speed;
            this.lastShot = 0;
        }

        this.hp *= diff.hp;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
    }

    update(dt) {
        this.y += this.speed * dt;

        // Enemy firing
        if (this.type === 'enemy_ship' || this.type === 'enemy_tough') {
            const now = performance.now();
            if (now - this.lastShot > 2000) {
                enemyBullets.push(new Bullet(this.x + this.width / 2 - 4, this.y + this.height, 0, 300, 'laser', 10));
                this.lastShot = now;
            }
        }
    }

    draw() {
        ctx.drawImage(images[this.type], this.x, this.y, this.width, this.height);
    }
}

class Boss {
    constructor(lvl) {
        this.width = 120;
        this.height = 120;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = -this.height;
        this.maxHp = 300 + lvl * 150;
        this.hp = this.maxHp;
        this.score = 2500;
        this.vx = 120;
        this.lastShot = 0;
    }

    update(dt) {
        if (this.y < 60) {
            this.y += 50 * dt;
        } else {
            this.x += this.vx * dt;
            if (this.x < 10 || this.x + this.width > canvas.width - 10) {
                this.vx *= -1;
            }
        }

        const now = performance.now();
        if (now - this.lastShot > 1000) {
            enemyBullets.push(new Bullet(this.x + 20, this.y + this.height, -50, 350, 'laser', 15));
            enemyBullets.push(new Bullet(this.x + this.width / 2 - 4, this.y + this.height, 0, 380, 'laser', 15));
            enemyBullets.push(new Bullet(this.x + this.width - 20, this.y + this.height, 50, 350, 'laser', 15));
            this.lastShot = now;
        }
    }

    draw() {
        ctx.drawImage(images.boss, this.x, this.y, this.width, this.height);
    }
}

class Powerup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 28;
        this.height = 28;
        this.speed = 120;

        const types = ['fastfire', 'doublefire', 'bigfire', 'rapidfire', 'shield', 'extralife', 'scoreboost'];
        this.type = types[Math.floor(Math.random() * types.length)];
    }

    update(dt) {
        this.y += this.speed * dt;
    }

    draw() {
        ctx.drawImage(images['powerup_' + this.type], this.x, this.y, this.width, this.height);
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 200;
        this.vy = (Math.random() - 0.5) * 200;
        this.life = 0.4;
        this.maxLife = 0.4;
        this.color = color || '#ffaa00';
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.fillRect(this.x, this.y, 4, 4);
        ctx.globalAlpha = 1.0;
    }
}

// Initialization & Resize
function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Init Parallax Stars
    stars = [];
    for (let i = 0; i < 120; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 80 + 20
        });
    }
}

window.addEventListener('resize', initCanvas);

// Controls Setup
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
});

window.addEventListener('keyup', e => {
    keys[e.code] = false;
});

canvas.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    if (player && gameState === 'PLAYING') {
        player.x = mouseX - player.width / 2;
    }
});

canvas.addEventListener('mousedown', () => isMouseDown = true);
canvas.addEventListener('mouseup', () => isMouseDown = false);

// Touch Events
canvas.addEventListener('touchstart', e => {
    sounds.init();
    if (e.touches.length > 0) {
        touchX = e.touches[0].clientX;
        isMouseDown = true;
    }
}, { passive: true });

canvas.addEventListener('touchmove', e => {
    if (e.touches.length > 0) touchX = e.touches[0].clientX;
}, { passive: true });

canvas.addEventListener('touchend', () => {
    touchX = null;
    isMouseDown = false;
});

// UI Event Handlers
document.getElementById('btnPlay').onclick = startGame;
document.getElementById('btnHowTo').onclick = () => showOverlay('menuHowTo');
document.getElementById('btnSettings').onclick = () => showOverlay('menuSettings');
document.getElementById('btnCredits').onclick = () => showOverlay('menuCredits');
document.getElementById('btnBackFromHowTo').onclick = () => showOverlay('menuMain');
document.getElementById('btnBackFromSettings').onclick = () => showOverlay('menuMain');
document.getElementById('btnBackFromCredits').onclick = () => showOverlay('menuMain');
document.getElementById('btnPauseGame').onclick = togglePause;
document.getElementById('btnResume').onclick = togglePause;
document.getElementById('btnRestartPause').onclick = startGame;
document.getElementById('btnMainMenuPause').onclick = showMainMenu;
document.getElementById('btnPlayAgain').onclick = startGame;
document.getElementById('btnMainMenuGO').onclick = showMainMenu;

// Settings Toggles
document.getElementById('toggleSound').onclick = function() {
    settings.sound = !settings.sound;
    sounds.enabled = settings.sound;
    this.innerText = settings.sound ? 'ON' : 'OFF';
};

document.getElementById('toggleShake').onclick = function() {
    settings.shake = !settings.shake;
    this.innerText = settings.shake ? 'ON' : 'OFF';
};

document.getElementById('toggleDiff').onclick = function() {
    const diffs = ['EASY', 'NORMAL', 'HARD'];
    let idx = (diffs.indexOf(settings.difficulty) + 1) % diffs.length;
    settings.difficulty = diffs[idx];
    this.innerText = settings.difficulty;
};

// Touch buttons
setupTouchButton('btnMobileLeft', 'ArrowLeft');
setupTouchButton('btnMobileRight', 'ArrowRight');
setupTouchButton('btnMobileFire', 'Space');

function setupTouchButton(id, keyCode) {
    const btn = document.getElementById(id);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[keyCode] = true; });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[keyCode] = false; });
}

function showOverlay(id) {
    document.querySelectorAll('.overlay').forEach(el => el.classList.add('hidden'));
    if (id) document.getElementById(id).classList.remove('hidden');
}

function togglePause() {
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        showOverlay('menuPause');
    } else if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
        showOverlay(null);
    }
}

function showMainMenu() {
    gameState = 'MENU';
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('mobileControls').classList.add('hidden');
    showOverlay('menuMain');
}

let enemySpawnTimer = 0;

function startGame() {
    sounds.init();
    score = 0;
    level = 1;
    lives = 3;
    health = 100;
    bullets = [];
    enemyBullets = [];
    enemies = [];
    powerups = [];
    particles = [];
    boss = null;

    player = new Player();
    gameState = 'PLAYING';

    showOverlay(null);
    document.getElementById('hud').classList.remove('hidden');

    if ('ontouchstart' in window) {
        document.getElementById('mobileControls').classList.remove('hidden');
    }

    updateHUD();
}

function updateHUD() {
    document.getElementById('scoreVal').innerText = String(score).padStart(6, '0');
    document.getElementById('highScoreVal').innerText = String(highScore).padStart(6, '0');
    document.getElementById('levelVal').innerText = level;
    document.getElementById('livesContainer').innerText = '♥'.repeat(Math.max(0, lives));
    document.getElementById('healthBar').style.width = Math.max(0, health) + '%';

    // Boss HUD
    const bossHud = document.getElementById('bossContainer');
    if (boss) {
        bossHud.classList.remove('hidden');
        const pct = Math.max(0, Math.floor((boss.hp / boss.maxHp) * 100));
        document.getElementById('bossHealthBar').style.width = pct + '%';
        document.getElementById('bossHealthText').innerText = pct + '%';
    } else {
        bossHud.classList.add('hidden');
    }

    // Active Powerups Display
    const puBox = document.getElementById('powerupContainer');
    puBox.innerHTML = '';
    const now = performance.now();
    for (let p in player.activePowerups) {
        const rem = Math.ceil((player.activePowerups[p] - now) / 1000);
        if (rem > 0) {
            const pill = document.createElement('div');
            pill.className = 'powerup-pill';
            pill.innerText = `${p} ${rem}s`;
            puBox.appendChild(pill);
        }
    }
}

function spawnParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function triggerShake() {
    if (settings.shake) screenShakeTimer = 0.2;
}

// Main Game Loop
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render Starfield Background
    ctx.fillStyle = '#ffffff';
    stars.forEach(star => {
        if (gameState === 'PLAYING') {
            star.y += star.speed * dt;
            if (star.y > canvas.height) star.y = 0;
        }
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    if (gameState === 'PLAYING') {
        // Screen Shake Effect
        if (screenShakeTimer > 0) {
            screenShakeTimer -= dt;
            ctx.save();
            ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
        }

        player.update(dt);
        player.draw();

        // Level / Boss Spawner
        if (!boss && level % 5 === 0) {
            boss = new Boss(level);
        }

        // Normal Enemy Spawner
        enemySpawnTimer += dt;
        const spawnInterval = 1.5 / diffMultipliers[settings.difficulty].spawn;
        if (!boss && enemySpawnTimer > spawnInterval) {
            enemySpawnTimer = 0;
            const pool = ['asteroid_small', 'asteroid_large', 'asteroid_fast', 'enemy_ship', 'enemy_tough'];
            const eType = pool[Math.floor(Math.random() * pool.length)];
            enemies.push(new Enemy(eType));
        }

        // Update Boss
        if (boss) {
            boss.update(dt);
            boss.draw();
        }

        // Update Bullets
        bullets.forEach((b, bi) => {
            b.update(dt);
            b.draw();

            // Offscreen
            if (b.y < -50) bullets.splice(bi, 1);

            // Hit Boss
            if (boss && b.x > boss.x && b.x < boss.x + boss.width && b.y > boss.y && b.y < boss.y + boss.height) {
                boss.hp -= b.damage;
                spawnParticles(b.x, b.y, '#ffaa00', 4);
                bullets.splice(bi, 1);
                if (boss.hp <= 0) {
                    score += boss.score;
                    sounds.playExplosion();
                    spawnParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, '#ff0055', 40);
                    boss = null;
                    level++;
                }
            }

            // Hit Enemies
            enemies.forEach((e, ei) => {
                if (b.x > e.x && b.x < e.x + e.width && b.y > e.y && b.y < e.y + e.height) {
                    e.hp -= b.damage;
                    spawnParticles(b.x, b.y, '#ff0055', 4);
                    bullets.splice(bi, 1);

                    if (e.hp <= 0) {
                        let gain = e.score;
                        if (player.activePowerups['SCORE']) gain *= 2;
                        score += gain;
                        sounds.playExplosion();
                        spawnParticles(e.x + e.width / 2, e.y + e.height / 2, '#ffaa00', 15);

                        // Chance to drop powerup
                        if (Math.random() < 0.25) {
                            powerups.push(new Powerup(e.x, e.y));
                        }

                        enemies.splice(ei, 1);

                        // Progression
                        if (score > level * 1000 && level % 5 !== 0) level++;
                    }
                }
            });
        });

        // Update Enemy Bullets
        enemyBullets.forEach((eb, ebi) => {
            eb.update(dt);
            eb.draw();

            // Hit Player
            if (eb.x > player.x && eb.x < player.x + player.width && eb.y > player.y && eb.y < player.y + player.height) {
                enemyBullets.splice(ebi, 1);
                handlePlayerHit(15);
            }

            if (eb.y > canvas.height + 50) enemyBullets.splice(ebi, 1);
        });

        // Update Enemies
        enemies.forEach((e, ei) => {
            e.update(dt);
            e.draw();

            // Collision with Player
            if (e.x < player.x + player.width && e.x + e.width > player.x &&
                e.y < player.y + player.height && e.y + e.height > player.y) {
                enemies.splice(ei, 1);
                handlePlayerHit(30);
            }

            if (e.y > canvas.height + 50) enemies.splice(ei, 1);
        });

        // Update Powerups
        powerups.forEach((pu, pui) => {
            pu.update(dt);
            pu.draw();

            if (pu.x < player.x + player.width && pu.x + pu.width > player.x &&
                pu.y < player.y + player.height && pu.y + pu.height > player.y) {
                sounds.playPowerup();
                applyPowerup(pu.type);
                powerups.splice(pui, 1);
            }

            if (pu.y > canvas.height + 50) powerups.splice(pui, 1);
        });

        // Particles
        particles.forEach((p, pi) => {
            p.update(dt);
            p.draw();
            if (p.life <= 0) particles.splice(pi, 1);
        });

        if (screenShakeTimer > 0) ctx.restore();

        updateHUD();
    }

    requestAnimationFrame(gameLoop);
}

function applyPowerup(type) {
    const now = performance.now();
    if (type === 'fastfire') player.activePowerups['FAST'] = now + 8000;
    if (type === 'doublefire') player.activePowerups['DOUBLE'] = now + 10000;
    if (type === 'bigfire') player.activePowerups['BIG'] = now + 8000;
    if (type === 'rapidfire') player.activePowerups['RAPID'] = now + 6000;
    if (type === 'shield') player.activePowerups['SHIELD'] = now + 12000;
    if (type === 'extralife') lives = Math.min(5, lives + 1);
    if (type === 'scoreboost') player.activePowerups['SCORE'] = now + 10000;
}

function handlePlayerHit(dmg) {
    if (player.activePowerups['SHIELD']) {
        delete player.activePowerups['SHIELD'];
        triggerShake();
        return;
    }

    health -= dmg;
    triggerShake();
    sounds.playExplosion();

    if (health <= 0) {
        lives--;
        if (lives > 0) {
            health = 100;
        } else {
            gameOver();
        }
    }
}

function gameOver() {
    gameState = 'GAMEOVER';
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('gs_highscore', highScore);
    }

    document.getElementById('finalScoreVal').innerText = score;
    document.getElementById('finalHighScoreVal').innerText = highScore;
    document.getElementById('finalLevelVal').innerText = level;

    document.getElementById('hud').classList.add('hidden');
    document.getElementById('mobileControls').classList.add('hidden');
    showOverlay('menuGameOver');
}

// Start
loadAssets(() => {
    initCanvas();
    showMainMenu();
    requestAnimationFrame(gameLoop);
});
