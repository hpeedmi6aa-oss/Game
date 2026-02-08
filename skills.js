// ==================== SKILLS EXECUTION - 30 UNIQUE SKILLS ====================
// Visual effects, particle system, dan damage calculation untuk 10 buah

// ==================== SKILL TEXT POPUP SYSTEM ====================
class SkillTextPopup {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 60;
        this.maxLife = 60;
        this.velocity = -2;
        this.scale = 1;
    }
    
    update() {
        this.y += this.velocity;
        this.life--;
        this.scale = 1 + (1 - this.life / this.maxLife) * 0.5;
        return this.life > 0;
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${20 * this.scale}px Arial`;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// Array untuk skill text popups
let skillTextPopups = [];

function createSkillText(x, y, text, color) {
    skillTextPopups.push(new SkillTextPopup(x, y, text, color));
}

// ==================== PARTICLE SYSTEM ====================
class SkillParticle {
    constructor(x, y, vx, vy, color, size, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life--;
        return this.life > 0;
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let skillParticles = [];

function createParticles(x, y, count, color, spread = 5) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * spread;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const size = Math.random() * 3 + 2;
        const life = Math.random() * 30 + 30;
        
        skillParticles.push(new SkillParticle(x, y, vx, vy, color, size, life));
    }
}

// ==================== SKILL PROJECTILE ====================
class SkillProjectile {
    constructor(x, y, targetX, targetY, damage, color, type) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.color = color;
        this.type = type;
        this.speed = 8;
        this.size = 10;
        this.life = 120;
        this.hit = false;
        
        // Calculate direction
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
    }
    
    update() {
        if (this.hit) return false;
        
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        
        // Check collision with enemies
        game.enemies.forEach((enemy, index) => {
            if (this.hit) return;
            
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < enemy.size) {
                this.hit = true;
                enemy.hp -= this.damage;
                game.damageNumbers.push(new DamageNumber(enemy.x, enemy.y - enemy.size/2, this.damage));
                
                // Particle explosion
                createParticles(this.x, this.y, 15, this.color, 6);
                
                // Check enemy death
                if (enemy.hp <= 0) {
                    game.enemies.splice(index, 1);
                    game.player.exp += 5;
                    game.player.coins += 2;
                    game.player.kills++;
                    
                    // Quest progress
                    if (game.quest.active && !game.boss.spawned) {
                        checkQuestProgress();
                    }
                    
                    checkLevelUp();
                    updateUI();
                    saveGame();
                }
            }
        });
        
        // Check collision with boss
        if (game.boss.active && game.boss.entity && !this.hit) {
            const boss = game.boss.entity;
            const dx = boss.x - this.x;
            const dy = boss.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < boss.size) {
                this.hit = true;
                boss.takeDamage(this.damage);
                createParticles(this.x, this.y, 15, this.color, 6);
            }
        }
        
        return this.life > 0 && !this.hit;
    }
    
    draw() {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let skillProjectiles = [];

// ==================== SKILL AOE CIRCLE ====================
class SkillAOE {
    constructor(x, y, maxRadius, damage, color, duration, text) {
        this.x = x;
        this.y = y;
        this.maxRadius = maxRadius;
        this.radius = 0;
        this.damage = damage;
        this.color = color;
        this.duration = duration;
        this.life = 0;
        this.text = text;
        this.hitEnemies = new Set();
    }
    
    update() {
        this.life++;
        
        // Expand radius
        const progress = this.life / this.duration;
        this.radius = progress * this.maxRadius;
        
        // Check hits
        game.enemies.forEach((enemy, index) => {
            if (this.hitEnemies.has(enemy)) return;
            
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < this.radius) {
                this.hitEnemies.add(enemy);
                enemy.hp -= this.damage;
                game.damageNumbers.push(new DamageNumber(enemy.x, enemy.y - enemy.size/2, this.damage));
                createSkillText(enemy.x, enemy.y - 40, this.text, this.color);
                
                if (enemy.hp <= 0) {
                    game.enemies.splice(index, 1);
                    game.player.exp += 5;
                    game.player.coins += 2;
                    game.player.kills++;
                    
                    if (game.quest.active && !game.boss.spawned) {
                        checkQuestProgress();
                    }
                    
                    checkLevelUp();
                    updateUI();
                    saveGame();
                }
            }
        });
        
        // Check boss hit
        if (game.boss.active && game.boss.entity && !this.hitEnemies.has(game.boss.entity)) {
            const boss = game.boss.entity;
            const dx = boss.x - this.x;
            const dy = boss.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < this.radius) {
                this.hitEnemies.add(boss);
                boss.takeDamage(this.damage);
                createSkillText(boss.x, boss.y - 60, this.text, this.color);
            }
        }
        
        return this.life < this.duration;
    }
    
    draw() {
        const alpha = 1 - (this.life / this.duration);
        
        ctx.save();
        ctx.globalAlpha = alpha * 0.6;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha * 0.2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let skillAOEs = [];

// ==================== FREEZE EFFECT ====================
function applyFreezeEffect(enemy, duration) {
    if (!enemy.frozen) {
        enemy.frozen = true;
        enemy.originalSpeed = enemy.speed;
        enemy.speed = 0; // Complete freeze
        enemy.frozenTicks = duration;
        
        setTimeout(() => {
            enemy.frozen = false;
            enemy.speed = enemy.originalSpeed;
        }, duration);
    }
}

// ==================== BLACK HOLE EFFECT ====================
class BlackHole {
    constructor(x, y, duration, damage) {
        this.x = x;
        this.y = y;
        this.duration = duration;
        this.damage = damage;
        this.life = 0;
        this.radius = 100;
        this.pullStrength = 5;
        this.hitEnemies = new Set();
    }
    
    update() {
        this.life++;
        
        // Pull enemies
        game.enemies.forEach((enemy, index) => {
            const dx = this.x - enemy.x;
            const dy = this.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < this.radius) {
                // Pull towards center
                enemy.x += (dx / dist) * this.pullStrength;
                enemy.y += (dy / dist) * this.pullStrength;
                
                // Damage at center
                if (dist < 20 && !this.hitEnemies.has(enemy)) {
                    this.hitEnemies.add(enemy);
                    enemy.hp -= this.damage;
                    game.damageNumbers.push(new DamageNumber(enemy.x, enemy.y - enemy.size/2, this.damage));
                    createSkillText(enemy.x, enemy.y - 40, 'IMPLODE!', '#4b0082');
                    
                    if (enemy.hp <= 0) {
                        game.enemies.splice(index, 1);
                        game.player.exp += 5;
                        game.player.coins += 2;
                        game.player.kills++;
                        
                        if (game.quest.active && !game.boss.spawned) {
                            checkQuestProgress();
                        }
                        
                        checkLevelUp();
                        updateUI();
                        saveGame();
                    }
                }
            }
        });
        
        return this.life < this.duration;
    }
    
    draw() {
        const alpha = 1 - (this.life / this.duration);
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Swirl effect
        const swirl = (this.life * 0.1) % (Math.PI * 2);
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i + swirl;
            const x = this.x + Math.cos(angle) * this.radius * 0.5;
            const y = this.y + Math.sin(angle) * this.radius * 0.5;
            
            ctx.fillStyle = '#8b00ff';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Center
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 30);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, '#4b0082');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 30, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

let blackHoles = [];

// ==================== BUDDHA TRANSFORM ====================
let buddhaFormActive = false;
let buddhaFormEnd = 0;
let originalPlayerSize = 30;

function activateBuddhaForm(duration) {
    if (buddhaFormActive) return;
    
    buddhaFormActive = true;
    originalPlayerSize = game.player.size;
    game.player.size = originalPlayerSize * 2; // 2x bigger
    buddhaFormEnd = Date.now() + duration;
    
    createSkillText(game.player.x, game.player.y - 80, 'BUDDHA FORM!', '#ffd700');
    triggerScreenShake(5, 500);
    
    setTimeout(() => {
        buddhaFormActive = false;
        game.player.size = originalPlayerSize;
        createSkillText(game.player.x, game.player.y - 80, 'FORM END', '#ffd700');
    }, duration);
}

// ==================== 30 SKILL EXECUTION FUNCTIONS ====================

// FLAME FRUIT
function executeSkillFlameZ() {
    const fruit = FRUITS['flame'];
    const skill = fruit.skills.z;
    const damage = game.player.atk + skill.damage;
    
    // Find nearest enemy
    let target = game.enemies[0] || game.boss.entity;
    if (!target) return;
    
    skillProjectiles.push(new SkillProjectile(
        game.player.x, game.player.y,
        target.x, target.y,
        damage, '#ff4500', 'fire'
    ));
    
    createSkillText(game.player.x, game.player.y - 50, 'FIRE FIST!', '#ff4500');
    triggerScreenShake(3, 150);
}

function executeSkillFlameX() {
    const fruit = FRUITS['flame'];
    const skill = fruit.skills.x;
    const damage = game.player.atk + skill.damage;
    
    skillAOEs.push(new SkillAOE(
        game.player.x, game.player.y,
        120, damage, '#ff4500', 40, 'BURN!'
    ));
    
    createParticles(game.player.x, game.player.y, 30, '#ff8c00', 8);
    createSkillText(game.player.x, game.player.y - 50, 'FLAME WAVE!', '#ff4500');
    triggerScreenShake(5, 250);
}

function executeSkillFlameC() {
    const fruit = FRUITS['flame'];
    const skill = fruit.skills.c;
    const damage = game.player.atk + skill.damage;
    
    skillAOEs.push(new SkillAOE(
        game.player.x, game.player.y,
        180, damage, '#ff0000', 50, 'INFERNO!!'
    ));
    
    createParticles(game.player.x, game.player.y, 50, '#ff4500', 12);
    createSkillText(game.player.x, game.player.y - 50, 'INFERNO BLAST!', '#ff0000');
    triggerScreenShake(8, 400);
}

// ICE FRUIT
function executeSkillIceZ() {
    const fruit = FRUITS['ice'];
    const skill = fruit.skills.z;
    const damage = game.player.atk + skill.damage;
    
    // Shoot 3 ice shards
    for (let i = 0; i < 3; i++) {
        let target = game.enemies[i] || game.boss.entity;
        if (target) {
            setTimeout(() => {
                skillProjectiles.push(new SkillProjectile(
                    game.player.x, game.player.y,
                    target.x, target.y,
                    damage, '#00bfff', 'ice'
                ));
            }, i * 100);
        }
    }
    
    createSkillText(game.player.x, game.player.y - 50, 'ICE SHARD!', '#00bfff');
    triggerScreenShake(2, 150);
}

function executeSkillIceX() {
    const fruit = FRUITS['ice'];
    const skill = fruit.skills.x;
    const damage = game.player.atk + skill.damage;
    
    skillAOEs.push(new SkillAOE(
        game.player.x, game.player.y,
        150, damage, '#00bfff', 45, 'FREEZE!'
    ));
    
    // Apply freeze to nearby enemies
    game.enemies.forEach(enemy => {
        const dx = enemy.x - game.player.x;
        const dy = enemy.y - game.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
            applyFreezeEffect(enemy, 3000);
        }
    });
    
    createParticles(game.player.x, game.player.y, 40, '#87ceeb', 10);
    createSkillText(game.player.x, game.player.y - 50, 'GLACIAL BURST!', '#00bfff');
    triggerScreenShake(6, 300);
}

function executeSkillIceC() {
    const fruit = FRUITS['ice'];
    const skill = fruit.skills.c;
    const damage = game.player.atk + skill.damage;
    
    skillAOEs.push(new SkillAOE(
        game.player.x, game.player.y,
        200, damage, '#00ffff', 60, 'FROZEN!!'
    ));
    
    // Freeze all enemies in range
    game.enemies.forEach(enemy => {
        const dx = enemy.x - game.player.x;
        const dy = enemy.y - game.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
            applyFreezeEffect(enemy, 5000);
        }
    });
    
    createParticles(game.player.x, game.player.y, 60, '#00bfff', 15);
    createSkillText(game.player.x, game.player.y - 50, 'FROZEN DOMAIN!', '#00ffff');
    triggerScreenShake(7, 400);
}

// LIGHT FRUIT
function executeSkillLightZ() {
    const fruit = FRUITS['light'];
    const skill = fruit.skills.z;
    const damage = game.player.atk + skill.damage;
    
    let target = game.enemies[0] || game.boss.entity;
    if (!target) return;
    
    // Instant laser
    target.hp -= damage;
    game.damageNumbers.push(new DamageNumber(target.x, target.y - target.size/2, damage));
    createSkillText(target.x, target.y - 40, 'ZAP!', '#ffff00');
    
    // Laser visual
    ctx.save();
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 5;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffff00';
    ctx.beginPath();
    ctx.moveTo(game.player.x, game.player.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    ctx.restore();
    
    createParticles(target.x, target.y, 20, '#ffd700', 6);
    triggerScreenShake(2, 100);
}

function executeSkillLightX() {
    const fruit = FRUITS['light'];
    const skill = fruit.skills.x;
    const damage = game.player.atk + skill.damage;
    
    // Sacred rain - 8 light beams
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const randomX = game.player.x + (Math.random() - 0.5) * 200;
            const randomY = game.player.y + (Math.random() - 0.5) * 200;
            
            skillAOEs.push(new SkillAOE(randomX, randomY, 40, damage * 0.6, '#ffff00', 20, 'DIVINE!'));
            createParticles(randomX, randomY, 15, '#ffd700', 5);
        }, i * 150);
    }
    
    createSkillText(game.player.x, game.player.y - 50, 'SACRED RAIN!', '#ffff00');
    triggerScreenShake(4, 300);
}

function executeSkillLightC() {
    const fruit = FRUITS['light'];
    const skill = fruit.skills.c;
    const damage = game.player.atk + skill.damage;
    
    skillAOEs.push(new SkillAOE(
        game.player.x, game.player.y,
        250, damage, '#ffff00', 45, 'JUDGMENT!!'
    ));
    
    createParticles(game.player.x, game.player.y, 70, '#ffd700', 18);
    createSkillText(game.player.x, game.player.y - 50, 'DIVINE JUDGMENT!', '#ffff00');
    triggerScreenShake(10, 500);
}

// DARK FRUIT
function executeSkillDarkZ() {
    const fruit = FRUITS['dark'];
    const skill = fruit.skills.z;
    const damage = game.player.atk + skill.damage;
    
    skillAOEs.push(new SkillAOE(
        game.player.x, game.player.y,
        100, damage, '#4b0082', 35, 'DARK!'
    ));
    
    createParticles(game.player.x, game.player.y, 25, '#8b00ff', 7);
    createSkillText(game.player.x, game.player.y - 50, 'SHADOW PULSE!', '#8b00ff');
    triggerScreenShake(3, 200);
}

function executeSkillDarkX() {
    const fruit = FRUITS['dark'];
    const skill = fruit.skills.x;
    const damage = game.player.atk + skill.damage;
    
    blackHoles.push(new BlackHole(game.player.x, game.player.y, 120, damage));
    
    createSkillText(game.player.x, game.player.y - 50, 'BLACK HOLE!', '#4b0082');
    triggerScreenShake(7, 400);
}

function executeSkillDarkC() {
    const fruit = FRUITS['dark'];
    const skill = fruit.skills.c;
    const damage = game.player.atk + skill.damage;
    
    skillAOEs.push(new SkillAOE(
        game.player.x, game.player.y,
        220, damage, '#000000', 55, 'VOID!!'
    ));
    
    createParticles(game.player.x, game.player.y, 60, '#4b0082', 15);
    createSkillText(game.player.x, game.player.y - 50, 'VOID COLLAPSE!', '#8b00ff');
    triggerScreenShake(9, 500);
}

// Sisanya akan dilanjutkan di comment berikutnya...
// WIND, MAGMA, QUAKE, BUDDHA, ELECTRIC, VENOM

// Export skills mapping
const SKILL_EXECUTORS = {
    flame: { z: executeSkillFlameZ, x: executeSkillFlameX, c: executeSkillFlameC },
    ice: { z: executeSkillIceZ, x: executeSkillIceX, c: executeSkillIceC },
    light: { z: executeSkillLightZ, x: executeSkillLightX, c: executeSkillLightC },
    dark: { z: executeSkillDarkZ, x: executeSkillDarkX, c: executeSkillDarkC }
    // Will add: wind, magma, quake, buddha, electric, venom
};
