// ==================== SKILLS PART 2 - 6 DEVIL FRUITS ====================
// Wind, Magma, Quake, Buddha, Electric, Venom
// Total: 18 Skills (6 × 3)

// ==================== VENOM POOL SYSTEM (DOT) ====================
class VenomPool {
    constructor(x, y, duration, damagePerFrame) {
        this.x = x;
        this.y = y;
        this.radius = 80;
        this.duration = duration; // 3000ms = 180 frames
        this.damagePerFrame = damagePerFrame;
        this.life = 0;
        this.maxLife = duration / (1000/60); // Convert to frames
        this.hitEnemies = new Map(); // Track damage ticks per enemy
    }
    
    update() {
        this.life++;
        
        // Damage enemies standing in pool
        game.enemies.forEach((enemy, index) => {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < this.radius) {
                // Apply DOT damage every frame
                enemy.hp -= this.damagePerFrame;
                
                // Show damage number occasionally (every 30 frames)
                if (this.life % 30 === 0) {
                    const totalDamage = Math.floor(this.damagePerFrame * 30);
                    game.damageNumbers.push(new DamageNumber(
                        enemy.x, 
                        enemy.y - enemy.size/2, 
                        totalDamage
                    ));
                }
                
                // Venom visual effect on enemy
                if (this.life % 10 === 0) {
                    createParticles(enemy.x, enemy.y, 3, '#9400d3', 3);
                }
                
                // Check death
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
        
        // Damage boss if in pool
        if (game.boss.active && game.boss.entity) {
            const boss = game.boss.entity;
            const dx = boss.x - this.x;
            const dy = boss.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < this.radius) {
                boss.hp -= this.damagePerFrame;
                
                if (this.life % 30 === 0) {
                    const totalDamage = Math.floor(this.damagePerFrame * 30);
                    game.damageNumbers.push(new DamageNumber(
                        boss.x, 
                        boss.y - boss.size/2, 
                        totalDamage
                    ));
                }
                
                updateBossHPBar();
                
                if (boss.hp <= 0) {
                    bossDeath();
                }
            }
        }
        
        return this.life < this.maxLife;
    }
    
    draw() {
        const alpha = 1 - (this.life / this.maxLife);
        
        ctx.save();
        ctx.globalAlpha = alpha * 0.6;
        
        // Venom pool gradient
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, '#9400d3');
        gradient.addColorStop(0.5, '#8b008b');
        gradient.addColorStop(1, 'rgba(148, 0, 211, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Bubbles
        for (let i = 0; i < 5; i++) {
            const angle = (this.life * 0.05 + i * Math.PI * 2 / 5) % (Math.PI * 2);
            const bx = this.x + Math.cos(angle) * this.radius * 0.6;
            const by = this.y + Math.sin(angle) * this.radius * 0.6;
            
            ctx.fillStyle = '#8b008b';
            ctx.beginPath();
            ctx.arc(bx, by, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

let venomPools = [];

// ==================== SCREEN CRACK EFFECT (QUAKE) ====================
class ScreenCrack {
    constructor() {
        this.cracks = [];
        this.life = 60;
        this.maxLife = 60;
        
        // Generate random cracks
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i + (Math.random() - 0.5) * 0.5;
            const length = 100 + Math.random() * 200;
            
            this.cracks.push({
                x: centerX,
                y: centerY,
                angle: angle,
                length: length,
                branches: this.generateBranches(centerX, centerY, angle, length)
            });
        }
    }
    
    generateBranches(startX, startY, angle, length) {
        const branches = [];
        const numBranches = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numBranches; i++) {
            const branchAngle = angle + (Math.random() - 0.5) * Math.PI / 2;
            const branchLength = length * (0.3 + Math.random() * 0.4);
            const branchStart = 0.3 + Math.random() * 0.4; // Start point along main crack
            
            branches.push({
                startRatio: branchStart,
                angle: branchAngle,
                length: branchLength
            });
        }
        
        return branches;
    }
    
    update() {
        this.life--;
        return this.life > 0;
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        
        this.cracks.forEach(crack => {
            // Main crack
            const endX = crack.x + Math.cos(crack.angle) * crack.length;
            const endY = crack.y + Math.sin(crack.angle) * crack.length;
            
            ctx.beginPath();
            ctx.moveTo(crack.x, crack.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            // Branches
            crack.branches.forEach(branch => {
                const branchX = crack.x + Math.cos(crack.angle) * crack.length * branch.startRatio;
                const branchY = crack.y + Math.sin(crack.angle) * crack.length * branch.startRatio;
                const branchEndX = branchX + Math.cos(branch.angle) * branch.length;
                const branchEndY = branchY + Math.sin(branch.angle) * branch.length;
                
                ctx.beginPath();
                ctx.moveTo(branchX, branchY);
                ctx.lineTo(branchEndX, branchEndY);
                ctx.stroke();
            });
        });
        
        ctx.restore();
    }
}

let screenCracks = [];

// ==================== CHAIN LIGHTNING SYSTEM ====================
function chainLightning(startX, startY, damage, bounces, range) {
    let currentX = startX;
    let currentY = startY;
    let hitEnemies = new Set();
    let chainCount = 0;
    
    const executeChain = () => {
        if (chainCount >= bounces) return;
        
        // Find nearest enemy within range
        let nearestEnemy = null;
        let nearestDist = Infinity;
        
        game.enemies.forEach(enemy => {
            if (hitEnemies.has(enemy)) return; // Skip already hit
            
            const dx = enemy.x - currentX;
            const dy = enemy.y - currentY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < range && dist < nearestDist) {
                nearestDist = dist;
                nearestEnemy = enemy;
            }
        });
        
        // Check boss too
        if (game.boss.active && game.boss.entity && !hitEnemies.has(game.boss.entity)) {
            const boss = game.boss.entity;
            const dx = boss.x - currentX;
            const dy = boss.y - currentY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < range && dist < nearestDist) {
                nearestDist = dist;
                nearestEnemy = boss;
            }
        }
        
        if (!nearestEnemy) return; // No more targets
        
        // Hit the enemy
        hitEnemies.add(nearestEnemy);
        nearestEnemy.hp -= damage;
        game.damageNumbers.push(new DamageNumber(
            nearestEnemy.x, 
            nearestEnemy.y - nearestEnemy.size/2, 
            damage
        ));
        
        createSkillText(nearestEnemy.x, nearestEnemy.y - 40, 'ZAP!', '#ffff00');
        createParticles(nearestEnemy.x, nearestEnemy.y, 20, '#ffaa00', 6);
        
        // Draw lightning bolt
        ctx.save();
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(currentX, currentY);
        
        // Zigzag effect
        const segments = 5;
        for (let i = 1; i <= segments; i++) {
            const ratio = i / segments;
            const x = currentX + (nearestEnemy.x - currentX) * ratio;
            const y = currentY + (nearestEnemy.y - currentY) * ratio;
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;
            ctx.lineTo(x + offsetX, y + offsetY);
        }
        
        ctx.lineTo(nearestEnemy.x, nearestEnemy.y);
        ctx.stroke();
        ctx.restore();
        
        // Check if enemy died
        if (nearestEnemy.hp <= 0 && nearestEnemy !== game.boss.entity) {
            const index = game.enemies.indexOf(nearestEnemy);
            if (index > -1) {
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
        } else if (nearestEnemy === game.boss.entity && nearestEnemy.hp <= 0) {
            bossDeath();
        }
        
        // Update for next chain
        currentX = nearestEnemy.x;
        currentY = nearestEnemy.y;
        chainCount++;
        
        // Continue chain
        setTimeout(executeChain, 100);
    };
    
    executeChain();
}

// ==================== WIND FRUIT SKILLS ====================
function executeSkillWindZ() {
    const skill = FRUITS['wind'].skills.z;
    const damage = game.player.atk + skill.damage;
    
    // Wind slash with particles
    skillAOEs.push(new SkillAOE(
        game.player.x, game.player.y,
        90, damage, '#90ee90', 30, 'SLASH!'
    ));
    
    // Wind particles (lots of them!)
    for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 5;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        skillParticles.push(new SkillParticle(
            game.player.x, game.player.y,
            vx, vy, '#98fb98', 2 + Math.random() * 2, 40
        ));
    }
    
    // Knockback
    game.enemies.forEach(enemy => {
        const dx = enemy.x - game.player.x;
        const dy = enemy.y - game.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90 && dist > 0) {
            enemy.x += (dx / dist) * 40;
            enemy.y += (dy / dist) * 40;
        }
    });
    
    createSkillText(game.player.x, game.player.y - 50, 'WIND SLASH!', '#90ee90');
    triggerScreenShake(2, 150);
}

function executeSkillWindX() {
    const skill = FRUITS['wind'].skills.x;
    const damage = game.player.atk + skill.damage;
    
    skillAOEs.push(new SkillAOE(
        game.player.x, game.player.y,
        140, damage, '#90ee90', 40, 'TORNADO!'
    ));
    
    // Tornado spiral particles
    for (let i = 0; i < 60; i++) {
        setTimeout(() => {
            const angle = (i / 60) * Math.PI * 4; // 2 full rotations
            const radius = 70 + (i / 60) * 70;
            const x = game.player.x + Math.cos(angle) * radius;
            const y = game.player.y + Math.sin(angle) * radius;
            
            createParticles(x, y, 3, '#90ee90', 4);
        }, i * 10);
    }
    
    // Strong knockback
    game.enemies.forEach(enemy => {
        const dx = enemy.x - game.player.x;
        const dy = enemy.y - game.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140 && dist > 0) {
            enemy.x += (dx / dist) * 80;
            enemy.y += (dy / dist) * 80;
        }
    });
    
    createSkillText(game.player.x, game.player.y - 50, 'TORNADO SPIN!', '#90ee90');
    triggerScreenShake(5, 300);
}

function executeSkillWindC() {
    const skill = FRUITS['wind'].skills.c;
    const damage = game.player.atk + skill.damage;
    
    skillAOEs.push(new SkillAOE(
        game.player.x, game.player.y,
        200, damage, '#90ee90', 50, 'HURRICANE!!'
    ));
    
    // Hurricane particles everywhere!
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 200;
            const x = game.player.x + Math.cos(angle) * radius;
            const y = game.player.y + Math.sin(angle) * radius;
            
            createParticles(x, y, 5, '#98fb98', 6);
        }, i * 8);
    }
    
    // Massive knockback
    game.enemies.forEach(enemy => {
        const dx = enemy.x - game.player.x;
        const dy = enemy.y - game.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
            enemy.x += (dx / dist) * 120;
            enemy.y += (dy / dist) * 120;
        }
    });
    
    createSkillText(game.player.x, game.player.y - 50, 'HURRICANE FURY!', '#90ee90');
    triggerScreenShake(8, 500);
}

// ==================== MAGMA FRUIT SKILLS ====================
function executeSkillMagmaZ() {
    const skill = FRUITS['magma'].skills.z;
    const damage = game.player.atk + skill.damage;
    
    let target = game.enemies[0] || game.boss.entity;
    if (!target) return;
    
    // Lava projectile
    skillProjectiles.push(new SkillProjectile(
        game.player.x, game.player.y,
        target.x, target.y,
        damage, '#8b0000', 'lava'
    ));
    
    // Lava particles trail
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            createParticles(game.player.x, game.player.y, 3, '#ff4500', 4);
        }, i * 20);
    }
    
    createSkillText(game.player.x, game.player.y - 50, 'LAVA FIST!', '#8b0000');
    triggerScreenShake(4, 200);
}

function executeSkillMagmaX() {
    const skill = FRUITS['magma'].skills.x;
    const damage = game.player.atk + skill.damage;
    
    // Meteor shower - 6 meteors raining down
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const randomX = game.player.x + (Math.random() - 0.5) * 250;
            const randomY = game.player.y + (Math.random() - 0.5) * 250;
            
            // Meteor visual falling
            for (let j = 0; j < 10; j++) {
                setTimeout(() => {
                    createParticles(randomX, randomY - 100 + j * 10, 5, '#ff4500', 3);
                }, j * 20);
            }
            
            setTimeout(() => {
                skillAOEs.push(new SkillAOE(
                    randomX, randomY, 
                    50, damage * 0.7, '#ff4500', 25, 'METEOR!'
                ));
                createParticles(randomX, randomY, 30, '#8b0000', 10);
            }, 200);
        }, i * 250);
    }
    
    createSkillText(game.player.x, game.player.y - 50, 'METEOR SHOWER!', '#ff4500');
    triggerScreenShake(6, 400);
}

function executeSkillMagmaC() {
    const skill = FRUITS['magma'].skills.c;
    const damage = game.player.atk + skill.damage;
    
    skillAOEs.push(new SkillAOE(
        game.player.x, game.player.y,
        190, damage, '#8b0000', 55, 'ERUPTION!!'
    ));
    
    // Eruption particles shooting upward
    for (let i = 0; i < 80; i++) {
        const angle = (Math.random() - 0.5) * Math.PI;
        const speed = 5 + Math.random() * 10;
        const vx = Math.cos(angle) * speed;
        const vy = -Math.abs(Math.sin(angle) * speed); // Upward
        
        skillParticles.push(new SkillParticle(
            game.player.x, game.player.y,
            vx, vy, '#ff4500', 3 + Math.random() * 3, 50
        ));
    }
    
    createSkillText(game.player.x, game.player.y - 50, 'VOLCANIC ERUPTION!', '#8b0000');
    triggerScreenShake(10, 600);
}

// ==================== QUAKE FRUIT SKILLS ====================
function executeSkillQuakeZ() {
    const skill = FRUITS['quake'].skills.z;
    const damage = game.player.atk + skill.damage;
    
    skillAOEs.push(new SkillAOE(
        game.player.x, game.player.y,
        110, damage, '#ffffff', 35, 'QUAKE!'
    ));
    
    createParticles(game.player.x, game.player.y, 30, '#add8e6', 8);
    createSkillText(game.player.x, game.player.y - 50, 'TREMOR PUNCH!', '#ffffff');
    triggerScreenShake(6, 300);
}

function executeSkillQuakeX() {
    const skill = FRUITS['quake'].skills.x;
    const damage = game.player.atk + skill.damage;
    
    skillAOEs.push(new SkillAOE(
        game.player.x, game.player.y,
        170, damage, '#add8e6', 45, 'EARTHQUAKE!!'
    ));
    
    createParticles(game.player.x, game.player.y, 50, '#ffffff', 15);
    createSkillText(game.player.x, game.player.y - 50, 'EARTHQUAKE!', '#add8e6');
    triggerScreenShake(12, 600);
}

function executeSkillQuakeC() {
    const skill = FRUITS['quake'].skills.c;
    const damage = game.player.atk + skill.damage;
    
    skillAOEs.push(new SkillAOE(
        game.player.x, game.player.y,
        250, damage, '#ffffff', 60, 'CATACLYSM!!'
    ));
    
    // Screen crack visual effect
    screenCracks.push(new ScreenCrack());
    
    createParticles(game.player.x, game.player.y, 90, '#add8e6', 25);
    createSkillText(game.player.x, game.player.y - 50, 'CATACLYSM!!', '#ffffff');
    triggerScreenShake(20, 1000); // MASSIVE SHAKE!
}

// ==================== BUDDHA FRUIT SKILLS ====================
function executeSkillBuddhaZ() {
    const skill = FRUITS['buddha'].skills.z;
    const damage = game.player.atk + skill.damage;
    
    skillAOEs.push(new SkillAOE(
        game.player.x, game.player.y,
        100, damage, '#ffd700', 35, 'PALM!'
    ));
    
    createParticles(game.player.x, game.player.y, 25, '#ffff00', 8);
    createSkillText(game.player.x, game.player.y - 50, 'PALM STRIKE!', '#ffd700');
    triggerScreenShake(4, 250);
}

function executeSkillBuddhaX() {
    // BUDDHA TRANSFORMATION - 2X SIZE + STATS BUFF!
    if (typeof game.player.isBuddha === 'undefined') {
        game.player.isBuddha = false;
    }
    
    if (!game.player.isBuddha) {
        // Activate Buddha Form
        game.player.isBuddha = true;
        game.player.originalSize = game.player.size;
        game.player.originalDefense = game.player.defense || 0;
        
        // BUFF STATS
        game.player.size = game.player.originalSize * 2; // 2X SIZE!
        game.player.attackRange = (game.player.attackRange || 60) * 2; // 2X RANGE
        game.player.defense = game.player.originalDefense * 2; // 2X DEFENSE
        
        // Store revert time
        game.player.buddhaEndTime = Date.now() + 15000; // 15 seconds
        
        createSkillText(game.player.x, game.player.y - 80, '✨ BUDDHA FORM ✨', '#ffd700');
        createSkillText(game.player.x, game.player.y - 100, '15 SECONDS!', '#ffff00');
        
        // Gold particles burst
        for (let i = 0; i < 60; i++) {
            const angle = (Math.PI * 2 / 60) * i;
            const vx = Math.cos(angle) * 6;
            const vy = Math.sin(angle) * 6;
            skillParticles.push(new SkillParticle(
                game.player.x, game.player.y,
                vx, vy, '#ffd700', 4, 40
            ));
        }
        
        triggerScreenShake(5, 500);
        
        console.log('🙏 BUDDHA ACTIVATED:');
        console.log(`   Size: ${game.player.originalSize} → ${game.player.size}`);
        console.log(`   Attack Range: × 2`);
        console.log(`   Defense: × 2`);
        console.log(`   Duration: 15 seconds`);
        
        // Auto-revert after 15 seconds
        setTimeout(() => {
            if (game.player.isBuddha) {
                // Revert Buddha Form
                game.player.isBuddha = false;
                game.player.size = game.player.originalSize;
                game.player.attackRange = (game.player.attackRange || 120) / 2;
                game.player.defense = game.player.originalDefense;
                
                createSkillText(game.player.x, game.player.y - 80, 'BUDDHA FORM END', '#ffd700');
                createParticles(game.player.x, game.player.y, 30, '#ffd700', 8);
                
                console.log('🙏 Buddha Form Ended - Stats Restored');
            }
        }, 15000);
        
    } else {
        // Already in Buddha Form
        const timeLeft = Math.ceil((game.player.buddhaEndTime - Date.now()) / 1000);
        createSkillText(game.player.x, game.player.y - 80, `ACTIVE: ${timeLeft}s`, '#ffd700');
    }
}

function executeSkillBuddhaC() {
    const skill = FRUITS['buddha'].skills.c;
    let damage = game.player.atk + skill.damage;
    
    // Bonus damage if in Buddha Form
    if (game.player.isBuddha) {
        damage *= 1.5;
    }
    
    skillAOEs.push(new SkillAOE(
        game.player.x, game.player.y,
        180, damage, '#ffd700', 50, 'DIVINE!!'
    ));
    
    createParticles(game.player.x, game.player.y, 70, '#ffff00', 18);
    createSkillText(game.player.x, game.player.y - 50, 'DIVINE IMPACT!', '#ffd700');
    triggerScreenShake(9, 500);
}

// ==================== ELECTRIC FRUIT SKILLS ====================
function executeSkillElectricZ() {
    const skill = FRUITS['electric'].skills.z;
    const damage = game.player.atk + skill.damage;
    
    let target = game.enemies[0] || game.boss.entity;
    if (!target) return;
    
    // Instant thunder strike
    target.hp -= damage;
    game.damageNumbers.push(new DamageNumber(
        target.x, target.y - target.size/2, damage
    ));
    
    createSkillText(target.x, target.y - 40, 'ZAP!!', '#ffff00');
    createParticles(target.x, target.y, 25, '#ffaa00', 8);
    
    // Lightning bolt visual
    ctx.save();
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffff00';
    ctx.beginPath();
    ctx.moveTo(game.player.x, game.player.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    ctx.restore();
    
    triggerScreenShake(3, 150);
}

function executeSkillElectricX() {
    const skill = FRUITS['electric'].skills.x;
    const damage = game.player.atk + skill.damage;
    
    // CHAIN LIGHTNING - bounces 5 times within 200px range
    chainLightning(game.player.x, game.player.y, damage, 5, 200);
    
    createSkillText(game.player.x, game.player.y - 50, 'CHAIN LIGHTNING!', '#ffff00');
    triggerScreenShake(5, 350);
}

function executeSkillElectricC() {
    const skill = FRUITS['electric'].skills.c;
    const damage = game.player.atk + skill.damage;
    
    skillAOEs.push(new SkillAOE(
        game.player.x, game.player.y,
        210, damage, '#ffff00', 55, 'THUNDER!!'
    ));
    
    // Thunder storm particles
    for (let i = 0; i < 80; i++) {
        setTimeout(() => {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 210;
            const x = game.player.x + Math.cos(angle) * radius;
            const y = game.player.y + Math.sin(angle) * radius;
            
            createParticles(x, y, 5, '#ffaa00', 6);
        }, i * 10);
    }
    
    createSkillText(game.player.x, game.player.y - 50, 'THUNDER GOD!', '#ffff00');
    triggerScreenShake(11, 600);
}

// ==================== VENOM FRUIT SKILLS ====================
function executeSkillVenomZ() {
    const skill = FRUITS['venom'].skills.z;
    const damage = game.player.atk + skill.damage;
    
    let target = game.enemies[0] || game.boss.entity;
    if (!target) return;
    
    skillProjectiles.push(new SkillProjectile(
        game.player.x, game.player.y,
        target.x, target.y,
        damage, '#9400d3', 'venom'
    ));
    
    createSkillText(game.player.x, game.player.y - 50, 'POISON!', '#9400d3');
    triggerScreenShake(2, 150);
}

function executeSkillVenomX() {
    const skill = FRUITS['venom'].skills.z;
    const damage = game.player.atk + skill.damage;
    
    // VENOM POOL - stays for 3 seconds with DOT
    const damagePerFrame = damage / 180; // 180 frames = 3 seconds
    venomPools.push(new VenomPool(
        game.player.x, game.player.y,
        3000, // 3 seconds
        damagePerFrame
    ));
    
    createParticles(game.player.x, game.player.y, 40, '#8b008b', 10);
    createSkillText(game.player.x, game.player.y - 50, 'VENOM POOL!', '#9400d3');
    triggerScreenShake(5, 300);
}

function executeSkillVenomC() {
    const skill = FRUITS['venom'].skills.c;
    const damage = game.player.atk + skill.damage;
    
    skillAOEs.push(new SkillAOE(
        game.player.x, game.player.y,
        195, damage, '#9400d3', 52, 'HYDRA!!'
    ));
    
    createParticles(game.player.x, game.player.y, 65, '#8b008b', 16);
    createSkillText(game.player.x, game.player.y - 50, 'HYDRA!!', '#9400d3');
    triggerScreenShake(8, 450);
}

// ==================== INJECT INTO MAIN SYSTEM ====================
// This merges Part 2 skills into existing SKILL_EXECUTORS
if (typeof SKILL_EXECUTORS !== 'undefined') {
    Object.assign(SKILL_EXECUTORS, {
        wind: { z: executeSkillWindZ, x: executeSkillWindX, c: executeSkillWindC },
        magma: { z: executeSkillMagmaZ, x: executeSkillMagmaX, c: executeSkillMagmaC },
        quake: { z: executeSkillQuakeZ, x: executeSkillQuakeX, c: executeSkillQuakeC },
        buddha: { z: executeSkillBuddhaZ, x: executeSkillBuddhaX, c: executeSkillBuddhaC },
        electric: { z: executeSkillElectricZ, x: executeSkillElectricX, c: executeSkillElectricC },
        venom: { z: executeSkillVenomZ, x: executeSkillVenomX, c: executeSkillVenomC }
    });
    
    console.log('✅ Part 2 Skills Loaded: Wind, Magma, Quake, Buddha, Electric, Venom');
} else {
    console.error('❌ SKILL_EXECUTORS not found! Load skills.js first.');
}
