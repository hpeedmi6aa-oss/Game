// ==================== GAME ENGINE - SCRIPT.JS ====================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Setup canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ==================== GAME STATE ====================
const game = {
    player: {
        x: 0,
        y: 0,
        size: 30,
        speed: 3,
        hp: 100,
        maxHp: 100,
        level: 1,
        exp: 0,
        expNeeded: 10,
        atk: 10,
        vx: 0,
        vy: 0,
        direction: 0,
        kills: 0,
        isDashing: false,
        dashSpeed: 12,
        dashDuration: 150,
        dashCooldown: 1000,
        lastDashTime: 0,
        dashStartTime: 0,
        currentFruit: null,  // Key buah yang sedang dipakai
        coins: 50  // Currency untuk gacha (start dengan 50 koin)
    },
    enemies: [],
    attacks: [],
    damageNumbers: [],
    skillParticles: [],
    joystick: {
        active: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0
    },
    lastEnemySpawn: 0,
    enemySpawnInterval: 2000,
    screenShake: {
        active: false,
        intensity: 0,
        duration: 0,
        startTime: 0,
        offsetX: 0,
        offsetY: 0
    },
    // Skill Cooldown Tracking
    skillCooldowns: {
        z: { ready: true, lastUsed: 0 },
        x: { ready: true, lastUsed: 0 },
        c: { ready: true, lastUsed: 0 }
    },
    // NPC System
    npc: {
        x: 150,
        y: 150,
        size: 35,
        questAvailable: true,
        hasQuest: false
    },
    // Quest System
    quest: {
        active: false,
        goal: 15,
        progress: 0,
        completed: false
    },
    // Boss System
    boss: {
        active: false,
        spawned: false,
        entity: null,
        maxHp: 10000,
        currentHp: 10000,
        lastAttack: 0,
        attackCooldown: 3000
    }
};

// Initialize player position
game.player.x = canvas.width / 2;
game.player.y = canvas.height / 2;

// Spawn position (untuk respawn)
const SPAWN_X = canvas.width / 2;
const SPAWN_Y = canvas.height / 2;

// Game state flag
let isGameOver = false;
let gameLoopRunning = true;

// ==================== SKILL SYSTEM ====================

/**
 * Use skill based on slot (z, x, or c)
 * @param {string} slot - The skill slot ('z', 'x', or 'c')
 */
function useSkill(slot) {
    slot = slot.toLowerCase();
    
    // Check if player has a fruit
    if (!game.player.currentFruit) {
        console.log('❌ No fruit equipped! Use Gacha first.');
        return;
    }
    
    // Get skill data from current fruit
    const skill = getSkill(game.player.currentFruit, slot);
    if (!skill) {
        console.error(`Skill ${slot.toUpperCase()} not found for fruit!`);
        return;
    }
    
    // Check if skill is ready
    if (!game.skillCooldowns[slot].ready) {
        console.log(`Skill ${slot.toUpperCase()} is on cooldown!`);
        return;
    }
    
    // Execute skill from SKILL_EXECUTORS
    console.log(`\n🎯 Using ${skill.icon} ${skill.name}`);
    
    if (typeof SKILL_EXECUTORS !== 'undefined' && SKILL_EXECUTORS[game.player.currentFruit]) {
        const executor = SKILL_EXECUTORS[game.player.currentFruit][slot];
        if (executor) {
            executor(); // Execute the skill!
        }
    }
    
    // Set cooldown using skill's actual cooldown time
    startSkillCooldown(slot, skill.cooldown);
}

/**
 * Start cooldown for a skill
 * @param {string} slot - The skill slot
 * @param {number} cooldownDuration - Cooldown time in milliseconds
 */
function startSkillCooldown(slot, cooldownDuration) {
    // Mark as not ready
    game.skillCooldowns[slot].ready = false;
    game.skillCooldowns[slot].lastUsed = Date.now();
    
    // Update UI - add cooldown class
    const skillButton = document.getElementById(`skill${slot.toUpperCase()}`);
    const cooldownOverlay = skillButton.querySelector('.skill-cooldown');
    const cooldownText = skillButton.querySelector('.cooldown-text');
    
    skillButton.classList.add('on-cooldown');
    cooldownOverlay.classList.add('active');
    
    // Update cooldown timer
    const cooldownInterval = setInterval(() => {
        const elapsed = Date.now() - game.skillCooldowns[slot].lastUsed;
        const remaining = Math.ceil((cooldownDuration - elapsed) / 1000);
        
        if (remaining > 0) {
            cooldownText.textContent = remaining;
        } else {
            // Cooldown finished
            clearInterval(cooldownInterval);
            game.skillCooldowns[slot].ready = true;
            
            // Update UI - remove cooldown
            skillButton.classList.remove('on-cooldown');
            cooldownOverlay.classList.remove('active');
            cooldownText.textContent = '';
        }
    }, 100); // Update every 100ms for smooth countdown
}

/**
 * Check if skill is ready
 * @param {string} slot - The skill slot
 * @returns {boolean}
 */
function isSkillReady(slot) {
    return game.skillCooldowns[slot].ready;
}

// ==================== SKILL BUTTON EVENT HANDLERS ====================

// Skill Z Button
const skillZButton = document.getElementById('skillZ');
skillZButton.addEventListener('click', () => useSkill('z'));
skillZButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    useSkill('z');
});

// Skill X Button
const skillXButton = document.getElementById('skillX');
skillXButton.addEventListener('click', () => useSkill('x'));
skillXButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    useSkill('x');
});

// Skill C Button
const skillCButton = document.getElementById('skillC');
skillCButton.addEventListener('click', () => useSkill('c'));
skillCButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    useSkill('c');
});

// Keyboard shortcuts for skills (untuk testing di PC)
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'z' || key === 'x' || key === 'c') {
        useSkill(key);
    }
});

// ==================== GACHA SYSTEM ====================

const GACHA_COST = 10; // Koin yang dibutuhkan untuk gacha

/**
 * Perform gacha - get random fruit
 */
function performGacha() {
    // Check if player has enough coins
    if (game.player.coins < GACHA_COST) {
        showGachaError(`Koin tidak cukup! Butuh ${GACHA_COST} koin.`);
        console.log(`❌ Insufficient coins! Need ${GACHA_COST}, have ${game.player.coins}`);
        return;
    }
    
    // Deduct coins
    game.player.coins -= GACHA_COST;
    
    // Get random fruit
    const result = getRandomFruit();
    const fruitKey = result.key;
    const fruitData = result.data;
    
    // Set as current fruit
    game.player.currentFruit = fruitKey;
    
    // Update player stats with fruit bonuses
    const baseAtk = 10;
    const levelBonus = (game.player.level - 1) * 5;
    game.player.atk = baseAtk + levelBonus + fruitData.atkBonus;
    game.player.speed = 3 + fruitData.speedBonus;
    
    // Update UI
    updateFruitUI();
    updateSkillUI();
    updateUI();
    
    // Show notification
    showGachaNotification(fruitData);
    
    console.log(`\n🎲 GACHA SUCCESS!`);
    console.log(`   Got: ${fruitData.emoji} ${fruitData.name}`);
    console.log(`   ATK Bonus: +${fruitData.atkBonus}`);
    console.log(`   Speed Bonus: +${fruitData.speedBonus}`);
    console.log(`   Coins left: ${game.player.coins}\n`);
    
    saveGame(); // Auto-save after gacha
}

/**
 * Update fruit info in UI
 */
function updateFruitUI() {
    const fruitKey = game.player.currentFruit;
    
    if (!fruitKey) {
        document.getElementById('currentFruit').textContent = 'None';
        document.getElementById('fruitEffect').textContent = '';
        return;
    }
    
    const fruit = getFruit(fruitKey);
    document.getElementById('currentFruit').innerHTML = `${fruit.emoji} ${fruit.name}`;
    document.getElementById('fruitEffect').textContent = `ATK +${fruit.atkBonus} | SPD +${fruit.speedBonus}`;
    document.getElementById('currentFruit').style.color = fruit.color;
}

/**
 * Update skill button labels based on current fruit
 */
function updateSkillUI() {
    const fruitKey = game.player.currentFruit;
    
    if (!fruitKey) {
        // Reset to default labels
        document.querySelector('#skillZ .skill-key').textContent = 'Z';
        document.querySelector('#skillX .skill-key').textContent = 'X';
        document.querySelector('#skillC .skill-key').textContent = 'C';
        return;
    }
    
    const fruit = getFruit(fruitKey);
    
    // Update skill Z
    const skillZ = fruit.skills.z;
    const skillZBtn = document.getElementById('skillZ');
    skillZBtn.querySelector('.skill-key').innerHTML = `
        <div style="font-size: 14px;">${skillZ.icon}</div>
        <div style="font-size: 10px; margin-top: 2px;">${skillZ.name}</div>
    `;
    
    // Update skill X
    const skillX = fruit.skills.x;
    const skillXBtn = document.getElementById('skillX');
    skillXBtn.querySelector('.skill-key').innerHTML = `
        <div style="font-size: 14px;">${skillX.icon}</div>
        <div style="font-size: 10px; margin-top: 2px;">${skillX.name}</div>
    `;
    
    // Update skill C
    const skillC = fruit.skills.c;
    const skillCBtn = document.getElementById('skillC');
    skillCBtn.querySelector('.skill-key').innerHTML = `
        <div style="font-size: 14px;">${skillC.icon}</div>
        <div style="font-size: 10px; margin-top: 2px;">${skillC.name}</div>
    `;
}

/**
 * Show gacha success notification
 */
function showGachaNotification(fruit) {
    const notification = document.getElementById('gachaNotification');
    const nameEl = document.getElementById('fruitName');
    const descEl = document.getElementById('fruitDescription');
    
    // Set content
    nameEl.textContent = `${fruit.emoji} ${fruit.name}`;
    nameEl.style.color = fruit.color;
    nameEl.style.textShadow = `0 0 20px ${fruit.glowColor}`;
    descEl.textContent = fruit.description;
    
    // Show notification
    notification.classList.add('show');
    
    // Hide after 2.5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2500);
}

/**
 * Show gacha error message
 */
function showGachaError(message) {
    const notification = document.getElementById('gachaNotification');
    const nameEl = document.getElementById('fruitName');
    const descEl = document.getElementById('fruitDescription');
    
    // Set error content
    nameEl.textContent = '❌ Error';
    nameEl.style.color = '#ff4444';
    nameEl.style.textShadow = '0 0 20px #ff0000';
    descEl.textContent = message;
    
    // Show notification
    notification.classList.add('show');
    
    // Hide after 2 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Gacha button event listeners
const gachaButton = document.getElementById('gachaButton');
gachaButton.addEventListener('click', performGacha);
gachaButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    performGacha();
});

// Update gacha button text to show cost
gachaButton.textContent = `🎲 GACHA (${GACHA_COST} 🪙)`;

// ==================== PLACEHOLDER CLASSES ====================
// NOTE: Nanti akan diisi dengan class lengkap dari game sebelumnya

class DamageNumber {
    constructor(x, y, damage) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.life = 60;
        this.maxLife = 60;
        this.velocity = -1.5;
    }
    
    update() {
        this.y += this.velocity;
        this.life--;
        return this.life > 0;
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        const scale = 1 + (1 - alpha) * 0.3;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${16 * scale}px Arial`;
        ctx.fillStyle = '#ffff00';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText(this.damage, this.x, this.y);
        ctx.fillText(this.damage, this.x, this.y);
        ctx.restore();
    }
}

class Enemy {
    constructor() {
        const side = Math.floor(Math.random() * 4);
        if (side === 0) {
            this.x = Math.random() * canvas.width;
            this.y = -30;
        } else if (side === 1) {
            this.x = canvas.width + 30;
            this.y = Math.random() * canvas.height;
        } else if (side === 2) {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + 30;
        } else {
            this.x = -30;
            this.y = Math.random() * canvas.height;
        }
        this.size = 25;
        this.speed = 1.5;
        this.hp = 30;
        this.maxHp = 30;
        this.color = '#ff3333';
    }
    
    update() {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
        
        if (!game.player.isDashing && this.checkCollision(game.player)) {
            game.player.hp -= 0.5;
            updateUI();
            triggerScreenShake(2, 100);
        }
    }
    
    checkCollision(obj) {
        return Math.abs(this.x - obj.x) < (this.size + obj.size) / 2 &&
               Math.abs(this.y - obj.y) < (this.size + obj.size) / 2;
    }
    
    takeDamage(damage) {
        this.hp -= damage;
        game.damageNumbers.push(new DamageNumber(this.x, this.y - this.size/2, damage));
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        const barWidth = this.size;
        const barHeight = 4;
        const hpPercent = this.hp / this.maxHp;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barWidth/2, this.y - this.size/2 - 8, barWidth, barHeight);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - barWidth/2, this.y - this.size/2 - 8, barWidth * hpPercent, barHeight);
    }
}

class Attack {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.size = 40;
        this.range = 60;
        this.damage = game.player.atk;
        this.duration = 200;
        this.startTime = Date.now();
        this.hitEnemies = new Set();
        this.color = '#ffffff';
        this.glowColor = '#ffffff';
    }
    
    update() {
        return Date.now() - this.startTime < this.duration;
    }
    
    checkHit() {
        game.enemies.forEach((enemy, index) => {
            if (this.hitEnemies.has(enemy)) return;
            
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.range) {
                const angleToEnemy = Math.atan2(dy, dx);
                let angleDiff = Math.abs(angleToEnemy - this.angle);
                if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
                
                if (angleDiff < Math.PI / 3) {
                    enemy.takeDamage(this.damage);
                    this.hitEnemies.add(enemy);
                    
                    if (enemy.hp <= 0) {
                        game.enemies.splice(index, 1);
                        game.player.exp += 5;
                        game.player.coins += 2; // Reward 2 koin per kill
                        game.player.kills++;
                        
                        // New Quest System
                        if (typeof updateQuestProgress !== 'undefined') {
                            updateQuestProgress('enemy_kill', 1);
                        }
                        
                        // Old Quest System (fallback)
                        if (game.quest && game.quest.active && !game.boss.spawned) {
                            if (typeof checkQuestProgress !== 'undefined') {
                                checkQuestProgress();
                            }
                        }
                        
                        checkLevelUp();
                        updateUI();
                        saveGame(); // Auto-save on kill
                    }
                }
            }
        });
    }
    
    // Check if attack hits boss
    checkBossHit() {
        if (!game.boss.active || !game.boss.entity) return;
        if (this.hitBoss) return; // Already hit boss
        
        const boss = game.boss.entity;
        const dx = boss.x - this.x;
        const dy = boss.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.range + boss.size/2) {
            const angleToB = Math.atan2(dy, dx);
            let angleDiff = Math.abs(angleToB - this.angle);
            if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
            
            if (angleDiff < Math.PI / 3) {
                boss.takeDamage(this.damage);
                this.hitBoss = true;
            }
        }
    }
    
    draw() {
        const elapsed = Date.now() - this.startTime;
        const progress = elapsed / this.duration;
        const alpha = 1 - progress;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, this.range, -Math.PI / 6, Math.PI / 6);
        ctx.stroke();
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, this.range, -Math.PI / 6, Math.PI / 6);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

// ==================== SCREEN SHAKE ====================
function triggerScreenShake(intensity, duration) {
    game.screenShake.active = true;
    game.screenShake.intensity = intensity;
    game.screenShake.duration = duration;
    game.screenShake.startTime = Date.now();
}

function updateScreenShake() {
    if (!game.screenShake.active) {
        game.screenShake.offsetX = 0;
        game.screenShake.offsetY = 0;
        return;
    }
    
    const elapsed = Date.now() - game.screenShake.startTime;
    if (elapsed >= game.screenShake.duration) {
        game.screenShake.active = false;
        game.screenShake.offsetX = 0;
        game.screenShake.offsetY = 0;
        return;
    }
    
    const progress = elapsed / game.screenShake.duration;
    const currentIntensity = game.screenShake.intensity * (1 - progress);
    
    game.screenShake.offsetX = (Math.random() - 0.5) * currentIntensity * 2;
    game.screenShake.offsetY = (Math.random() - 0.5) * currentIntensity * 2;
}

// ==================== JOYSTICK ====================
const joystickContainer = document.getElementById('joystickContainer');
const joystickStick = document.getElementById('joystickStick');

function handleJoystickStart(e) {
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    const rect = joystickContainer.getBoundingClientRect();
    game.joystick.active = true;
    game.joystick.startX = rect.left + rect.width / 2;
    game.joystick.startY = rect.top + rect.height / 2;
}

function handleJoystickMove(e) {
    if (!game.joystick.active) return;
    e.preventDefault();
    
    const touch = e.touches ? e.touches[0] : e;
    const dx = touch.clientX - game.joystick.startX;
    const dy = touch.clientY - game.joystick.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 35;
    
    if (distance > maxDistance) {
        const angle = Math.atan2(dy, dx);
        game.joystick.currentX = Math.cos(angle) * maxDistance;
        game.joystick.currentY = Math.sin(angle) * maxDistance;
    } else {
        game.joystick.currentX = dx;
        game.joystick.currentY = dy;
    }
    
    joystickStick.style.left = (35 + game.joystick.currentX) + 'px';
    joystickStick.style.top = (35 + game.joystick.currentY) + 'px';
    
    game.player.vx = game.joystick.currentX / maxDistance;
    game.player.vy = game.joystick.currentY / maxDistance;
    
    if (Math.abs(game.player.vx) > 0.1 || Math.abs(game.player.vy) > 0.1) {
        game.player.direction = Math.atan2(game.player.vy, game.player.vx);
    }
}

function handleJoystickEnd(e) {
    e.preventDefault();
    game.joystick.active = false;
    game.joystick.currentX = 0;
    game.joystick.currentY = 0;
    game.player.vx = 0;
    game.player.vy = 0;
    joystickStick.style.left = '35px';
    joystickStick.style.top = '35px';
}

joystickContainer.addEventListener('touchstart', handleJoystickStart);
joystickContainer.addEventListener('touchmove', handleJoystickMove);
joystickContainer.addEventListener('touchend', handleJoystickEnd);
joystickContainer.addEventListener('mousedown', handleJoystickStart);
document.addEventListener('mousemove', handleJoystickMove);
document.addEventListener('mouseup', handleJoystickEnd);

// ==================== NPC INTERACTION (Canvas Events) ====================
// Event listeners untuk NPC interaction
canvas.addEventListener('click', (e) => {
    if (typeof checkNPCInteraction !== 'undefined') {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        checkNPCInteraction(clickX, clickY);
    }
});

canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1 && typeof checkNPCInteraction !== 'undefined') {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const clickX = touch.clientX - rect.left;
        const clickY = touch.clientY - rect.top;
        checkNPCInteraction(clickX, clickY);
    }
});

// ==================== ATTACK & DASH ====================
const attackButton = document.getElementById('attackButton');
attackButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    performAttack();
});
attackButton.addEventListener('click', (e) => {
    e.preventDefault();
    performAttack();
});

function performAttack() {
    const attack = new Attack(game.player.x, game.player.y, game.player.direction);
    game.attacks.push(attack);
    triggerScreenShake(3, 150);
}

const dashButton = document.getElementById('dashButton');
dashButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    performDash();
});
dashButton.addEventListener('click', (e) => {
    e.preventDefault();
    performDash();
});

function performDash() {
    const now = Date.now();
    const timeSinceLastDash = now - game.player.lastDashTime;
    
    if (timeSinceLastDash >= game.player.dashCooldown && !game.player.isDashing) {
        game.player.isDashing = true;
        game.player.dashStartTime = now;
        game.player.lastDashTime = now;
        dashButton.classList.add('cooldown');
        setTimeout(() => dashButton.classList.remove('cooldown'), game.player.dashCooldown);
    }
}

function updateDash() {
    if (!game.player.isDashing) return;
    
    const elapsed = Date.now() - game.player.dashStartTime;
    if (elapsed >= game.player.dashDuration) {
        game.player.isDashing = false;
        return;
    }
    
    const dashVx = Math.cos(game.player.direction) * game.player.dashSpeed;
    const dashVy = Math.sin(game.player.direction) * game.player.dashSpeed;
    
    game.player.x += dashVx;
    game.player.y += dashVy;
}

// ==================== GAME LOGIC ====================
function checkLevelUp() {
    if (game.player.exp >= game.player.expNeeded) {
        game.player.level++;
        game.player.exp = 0;
        game.player.expNeeded = Math.floor(game.player.expNeeded * 1.5);
        game.player.atk += 5;
        game.player.maxHp += 20;
        game.player.hp = game.player.maxHp;
        updateUI();
    }
}

function updateUI() {
    document.getElementById('level').textContent = game.player.level;
    document.getElementById('hp').textContent = Math.floor(game.player.hp);
    document.getElementById('maxHp').textContent = game.player.maxHp;
    document.getElementById('exp').textContent = game.player.exp;
    document.getElementById('expNeeded').textContent = game.player.expNeeded;
    document.getElementById('atk').textContent = game.player.atk;
    document.getElementById('kills').textContent = game.player.kills;
    
    // Update gacha button with current coins
    const gachaBtn = document.getElementById('gachaButton');
    gachaBtn.textContent = `🎲 GACHA (${GACHA_COST} 🪙) | ${game.player.coins} 🪙`;
}

function spawnEnemy() {
    const now = Date.now();
    if (now - game.lastEnemySpawn > game.enemySpawnInterval) {
        game.enemies.push(new Enemy());
        game.lastEnemySpawn = now;
        if (game.enemies.length > 15) game.enemies.shift();
    }
}

function drawBackground() {
    const gridSize = 40;
    ctx.fillStyle = '#4a9d4a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#3d8a3d';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// ==================== GAME LOOP ====================
function gameLoop() {
    updateScreenShake();
    
    // Apply camera zoom transformation
    if (typeof applyCameraTransform !== 'undefined') {
        applyCameraTransform(ctx);
    } else {
        ctx.save();
        ctx.translate(game.screenShake.offsetX, game.screenShake.offsetY);
    }
    
    updateDash();
    
    if (!game.player.isDashing) {
        game.player.x += game.player.vx * game.player.speed;
        game.player.y += game.player.vy * game.player.speed;
    }
    
    game.player.x = Math.max(game.player.size/2, Math.min(canvas.width - game.player.size/2, game.player.x));
    game.player.y = Math.max(game.player.size/2, Math.min(canvas.height - game.player.size/2, game.player.y));
    
    game.enemies.forEach(enemy => enemy.update());
    
    // Update boss if active
    if (game.boss.active && game.boss.entity) {
        game.boss.entity.update();
    }
    
    // Update boss AOE effects
    if (typeof bossAOEEffects !== 'undefined') {
        bossAOEEffects = bossAOEEffects.filter(effect => effect.update());
    }
    
    // Update skill effects
    if (typeof skillProjectiles !== 'undefined') {
        skillProjectiles = skillProjectiles.filter(proj => proj.update());
    }
    if (typeof skillAOEs !== 'undefined') {
        skillAOEs = skillAOEs.filter(aoe => aoe.update());
    }
    if (typeof skillParticles !== 'undefined') {
        skillParticles = skillParticles.filter(particle => particle.update());
    }
    if (typeof skillTextPopups !== 'undefined') {
        skillTextPopups = skillTextPopups.filter(text => text.update());
    }
    if (typeof blackHoles !== 'undefined') {
        blackHoles = blackHoles.filter(bh => bh.update());
    }
    
    // Update Part 2 effects
    if (typeof venomPools !== 'undefined') {
        venomPools = venomPools.filter(pool => pool.update());
    }
    if (typeof screenCracks !== 'undefined') {
        screenCracks = screenCracks.filter(crack => crack.update());
    }
    
    // Update boss
    if (typeof updateBoss !== 'undefined') {
        updateBoss();
    }
    
    // Update world particles
    if (typeof updateDustParticles !== 'undefined') {
        updateDustParticles();
    }
    
    // Update Buddha glow
    if (typeof updateBuddhaGlow !== 'undefined') {
        updateBuddhaGlow();
    }
    
    game.attacks = game.attacks.filter(attack => {
        const alive = attack.update();
        if (alive) {
            attack.checkHit();
            // Also check boss hit
            if (game.boss.active && game.boss.entity && attack.checkBossHit) {
                attack.checkBossHit();
            }
        }
        return alive;
    });
    game.damageNumbers = game.damageNumbers.filter(dmg => dmg.update());
    
    spawnEnemy();
    
    // Draw background
    drawBackground();
    
    // Draw world decorations (BEHIND everything)
    if (typeof drawPaths !== 'undefined') {
        drawPaths();
    }
    if (typeof drawMounds !== 'undefined') {
        drawMounds();
    }
    if (typeof drawGrass !== 'undefined') {
        drawGrass();
    }
    if (typeof drawAreaMarkers !== 'undefined') {
        drawAreaMarkers();
    }
    
    // Draw Boss Arena
    if (typeof drawBoss !== 'undefined') {
        drawBoss();
    }
    
    // Draw player
    ctx.save();
    ctx.translate(game.player.x, game.player.y);
    ctx.rotate(game.player.direction);
    
    // Buddha Form gold glow
    if (game.player.isBuddha) {
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#ffd700';
        ctx.fillStyle = '#ffd700';
    } else if (game.player.isDashing) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#66aaff';
        ctx.fillStyle = '#66aaff';
    } else {
        ctx.fillStyle = '#3366ff';
    }
    
    ctx.fillRect(-game.player.size/2, -game.player.size/2, game.player.size, game.player.size);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(game.player.size/2 - 5, -3, 8, 6);
    ctx.restore();
    
    game.enemies.forEach(enemy => enemy.draw());
    
    // Draw NPCs (New System)
    if (typeof drawAllNPCs !== 'undefined') {
        drawAllNPCs();
    }
    
    // Draw old NPC if exists (fallback untuk compatibility)
    if (typeof drawNPC !== 'undefined' && typeof drawAllNPCs === 'undefined') {
        drawNPC();
    }
    
    // Draw boss if active (old system - akan di-replace oleh boss_arena.js)
    if (game.boss && game.boss.active && game.boss.entity) {
        game.boss.entity.draw();
    }
    
    // Draw boss AOE effects
    if (typeof bossAOEEffects !== 'undefined') {
        bossAOEEffects.forEach(effect => effect.draw());
    }
    
    // Draw skill effects
    if (typeof skillAOEs !== 'undefined') {
        skillAOEs.forEach(aoe => aoe.draw());
    }
    if (typeof blackHoles !== 'undefined') {
        blackHoles.forEach(bh => bh.draw());
    }
    if (typeof skillProjectiles !== 'undefined') {
        skillProjectiles.forEach(proj => proj.draw());
    }
    if (typeof skillParticles !== 'undefined') {
        skillParticles.forEach(particle => particle.draw());
    }
    
    // Draw Part 2 effects
    if (typeof venomPools !== 'undefined') {
        venomPools.forEach(pool => pool.draw());
    }
    
    // Draw dust particles
    if (typeof drawDustParticles !== 'undefined') {
        drawDustParticles();
    }
    
    game.attacks.forEach(attack => attack.draw());
    game.damageNumbers.forEach(dmg => dmg.draw());
    
    // Draw screen cracks (on top layer)
    if (typeof screenCracks !== 'undefined') {
        screenCracks.forEach(crack => crack.draw());
    }
    
    // Draw skill text popups (on top of everything)
    if (typeof skillTextPopups !== 'undefined') {
        skillTextPopups.forEach(text => text.draw());
    }
    
    // Restore camera transform
    if (typeof restoreCameraTransform !== 'undefined') {
        restoreCameraTransform(ctx);
    } else {
        ctx.restore();
    }
    
    // Check if player died (HP 0) - Show RESPAWN screen
    if (game.player.hp <= 0 && !isGameOver) {
        isGameOver = true;
        showRespawnScreen();
        return; // Stop game loop
    }
    
    // Continue game loop only if game is running
    if (gameLoopRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// ==================== RESPAWN SYSTEM ====================
function showRespawnScreen() {
    document.getElementById('respawnScreen').style.display = 'flex';
    gameLoopRunning = false;
    
    // Save current state (koin, buah, quest tetap tersimpan)
    if (typeof saveGame !== 'undefined') {
        saveGame();
    }
    
    console.log('💀 Player Died - Respawn Available');
}

function respawnPlayer() {
    // Reset HP to full
    game.player.hp = game.player.maxHp;
    
    // Move player to spawn position
    game.player.x = SPAWN_X;
    game.player.y = SPAWN_Y;
    
    // Reset velocity
    game.player.vx = 0;
    game.player.vy = 0;
    
    // Clear nearby enemies for safety
    game.enemies = game.enemies.filter(enemy => {
        const dx = enemy.x - game.player.x;
        const dy = enemy.y - game.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance > 200; // Remove enemies within 200px
    });
    
    // Hide respawn screen
    document.getElementById('respawnScreen').style.display = 'none';
    
    // Reset game flags
    isGameOver = false;
    gameLoopRunning = true;
    
    // Update UI
    updateUI();
    
    // Save game after respawn
    if (typeof saveGame !== 'undefined') {
        saveGame();
    }
    
    // Resume game loop
    requestAnimationFrame(gameLoop);
    
    console.log('✅ Player Respawned!');
    console.log(`   HP: ${game.player.hp}/${game.player.maxHp}`);
    console.log(`   Coins: ${game.player.coins}`);
    console.log(`   Fruit: ${game.player.currentFruit || 'None'}`);
}

// Respawn button event listeners
document.getElementById('respawnButton').addEventListener('click', respawnPlayer);
document.getElementById('respawnButton').addEventListener('touchstart', (e) => {
    e.preventDefault();
    respawnPlayer();
});

// ==================== START GAME ====================
// Load saved game first
if (typeof loadGame !== 'undefined') {
    loadGame();
}

// Start auto-save
if (typeof startAutoSave !== 'undefined') {
    startAutoSave();
}

// Initialize world decorations
if (typeof initWorld !== 'undefined') {
    initWorld();
}

// Setup camera zoom UI
if (typeof setupZoomUI !== 'undefined') {
    setupZoomUI();
}

// Spawn initial boss
if (typeof spawnBoss !== 'undefined') {
    spawnBoss();
}

// Setup gacha button
const spinBtn = document.getElementById('spinGachaBtn');
if (spinBtn) {
    spinBtn.addEventListener('click', () => {
        if (game.player.coins >= 10) {
            performGacha();
            document.getElementById('gachaCoins').textContent = game.player.coins;
        } else {
            alert('Not enough coins! Need 10 coins.');
        }
    });
}

// Update active quests UI
if (typeof updateActiveQuestUI !== 'undefined') {
    updateActiveQuestUI();
}

updateUI();
updateFruitUI(); // Initialize fruit display
updateSkillUI(); // Initialize skill buttons
gameLoop();
