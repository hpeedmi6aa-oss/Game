// ==================== BOSS ARENA SYSTEM ====================
// Boss hanya spawn di Boss Arena dengan respawn delay

// Boss Arena Configuration
const BOSS_ARENA = {
    x: 700,
    y: 700,
    radius: 150,
    color: '#8b0000',
    name: 'Boss Arena'
};

// Boss State
const bossState = {
    active: false,
    entity: null,
    isDead: false,
    respawnTime: 0,
    respawnDelay: 60000, // 60 seconds
    playerInArena: false,
    healthBarVisible: false
};

// Boss Entity Class
class RaidBoss {
    constructor() {
        this.x = BOSS_ARENA.x;
        this.y = BOSS_ARENA.y;
        this.size = 60;
        this.maxHp = 10000;
        this.hp = this.maxHp;
        this.speed = 1.5;
        this.damage = 25;
        this.color = '#8b0000';
        this.vx = 0;
        this.vy = 0;
        
        // Attack system
        this.lastAttackTime = 0;
        this.attackCooldown = 3000; // 3 seconds
        this.attackRange = 300;
        
        console.log('👹 RAID BOSS SPAWNED at Boss Arena');
    }
    
    update() {
        // AI: Chase player if in arena
        if (bossState.playerInArena) {
            const dx = game.player.x - this.x;
            const dy = game.player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 50) {
                this.vx = (dx / dist) * this.speed;
                this.vy = (dy / dist) * this.speed;
            } else {
                this.vx = 0;
                this.vy = 0;
            }
            
            this.x += this.vx;
            this.y += this.vy;
            
            // Keep boss in arena
            const arenaDistFromCenter = Math.sqrt(
                Math.pow(this.x - BOSS_ARENA.x, 2) + 
                Math.pow(this.y - BOSS_ARENA.y, 2)
            );
            
            if (arenaDistFromCenter > BOSS_ARENA.radius - this.size) {
                const angle = Math.atan2(this.y - BOSS_ARENA.y, this.x - BOSS_ARENA.x);
                this.x = BOSS_ARENA.x + Math.cos(angle) * (BOSS_ARENA.radius - this.size);
                this.y = BOSS_ARENA.y + Math.sin(angle) * (BOSS_ARENA.radius - this.size);
            }
            
            // Attack player
            const now = Date.now();
            if (now - this.lastAttackTime >= this.attackCooldown) {
                this.performAttack();
                this.lastAttackTime = now;
            }
        }
    }
    
    performAttack() {
        // AOE attack around boss
        const attackRadius = 100;
        
        // Check if player is in range
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < attackRadius) {
            game.player.hp -= this.damage;
            game.damageNumbers.push(new DamageNumber(
                game.player.x, 
                game.player.y - 30, 
                this.damage
            ));
            
            createSkillText(game.player.x, game.player.y - 50, 'BOSS ATTACK!', '#ff0000');
            triggerScreenShake(5, 300);
        }
        
        // Visual effect
        if (typeof skillAOEs !== 'undefined') {
            skillAOEs.push(new SkillAOE(
                this.x, this.y,
                attackRadius, 0, '#8b0000', 30, ''
            ));
        }
        
        updateUI();
    }
    
    takeDamage(damage) {
        this.hp -= damage;
        
        if (this.hp <= 0 && !bossState.isDead) {
            this.die();
        }
        
        updateBossHealthBar();
    }
    
    die() {
        bossState.isDead = true;
        bossState.active = false;
        bossState.entity = null;
        
        console.log('💀 RAID BOSS DEFEATED!');
        
        // Rewards
        game.player.coins += 500;
        game.player.exp += 200;
        
        // Quest progress
        if (typeof updateQuestProgress !== 'undefined') {
            updateQuestProgress('boss_kill', 1);
        }
        
        // Victory screen
        showBossDefeatedScreen();
        
        // Set respawn timer
        bossState.respawnTime = Date.now() + bossState.respawnDelay;
        
        createSkillText(this.x, this.y - 80, 'BOSS DEFEATED!', '#ffd700');
        createSkillText(this.x, this.y - 110, '+500 GOLD +200 EXP', '#00ff00');
        
        triggerScreenShake(15, 1000);
        
        // Explosion particles
        for (let i = 0; i < 100; i++) {
            const angle = (Math.PI * 2 / 100) * i;
            const speed = 3 + Math.random() * 5;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            if (typeof skillParticles !== 'undefined') {
                skillParticles.push(new SkillParticle(
                    this.x, this.y,
                    vx, vy, '#ff4500', 4, 60
                ));
            }
        }
        
        updateUI();
        saveGame();
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Boss shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, this.size / 2, this.size * 0.7, this.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Boss body (pulsing effect)
        const pulse = Math.sin(Date.now() / 200) * 0.1 + 1;
        ctx.scale(pulse, pulse);
        
        // Glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        
        // Body gradient
        const gradient = ctx.createRadialGradient(0, -10, 0, 0, 0, this.size / 2);
        gradient.addColorStop(0, '#ff4500');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, '#4b0000');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.shadowBlur = 5;
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(-15, -5, 8, 0, Math.PI * 2);
        ctx.arc(15, -5, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Name tag
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#000000';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💀 RAID BOSS 💀', 0, -this.size - 10);
        
        ctx.restore();
    }
}

// ==================== BOSS ARENA DRAWING ====================
function drawBossArena() {
    ctx.save();
    
    // Arena boundary
    ctx.strokeStyle = bossState.active ? '#ff0000' : '#8b0000';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.arc(BOSS_ARENA.x, BOSS_ARENA.y, BOSS_ARENA.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Arena ground
    const gradient = ctx.createRadialGradient(
        BOSS_ARENA.x, BOSS_ARENA.y, 0,
        BOSS_ARENA.x, BOSS_ARENA.y, BOSS_ARENA.radius
    );
    gradient.addColorStop(0, 'rgba(139, 0, 0, 0.2)');
    gradient.addColorStop(1, 'rgba(139, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(BOSS_ARENA.x, BOSS_ARENA.y, BOSS_ARENA.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Warning text if boss is alive
    if (bossState.active) {
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#000000';
        const pulse = Math.sin(Date.now() / 500) * 0.2 + 1;
        ctx.save();
        ctx.translate(BOSS_ARENA.x, BOSS_ARENA.y - BOSS_ARENA.radius - 20);
        ctx.scale(pulse, pulse);
        ctx.fillText('⚠️ DANGER ZONE ⚠️', 0, 0);
        ctx.restore();
    }
    
    // Respawn timer
    if (bossState.isDead && bossState.respawnTime > Date.now()) {
        const timeLeft = Math.ceil((bossState.respawnTime - Date.now()) / 1000);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#000000';
        ctx.fillText(`Boss Respawn: ${timeLeft}s`, BOSS_ARENA.x, BOSS_ARENA.y);
    }
    
    ctx.restore();
}

// ==================== CHECK PLAYER IN ARENA ====================
function checkPlayerInArena() {
    const dx = game.player.x - BOSS_ARENA.x;
    const dy = game.player.y - BOSS_ARENA.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    const wasInArena = bossState.playerInArena;
    bossState.playerInArena = dist < BOSS_ARENA.radius;
    
    // Show health bar when entering arena
    if (bossState.playerInArena && !wasInArena && bossState.active) {
        bossState.healthBarVisible = true;
        showBossHealthBar();
    }
    
    // Hide health bar when leaving arena
    if (!bossState.playerInArena && wasInArena) {
        bossState.healthBarVisible = false;
        hideBossHealthBar();
    }
}

// ==================== BOSS HEALTH BAR ====================
function showBossHealthBar() {
    const hpBar = document.getElementById('bossHpBar');
    if (hpBar) {
        hpBar.style.display = 'block';
    }
}

function hideBossHealthBar() {
    const hpBar = document.getElementById('bossHpBar');
    if (hpBar) {
        hpBar.style.display = 'none';
    }
}

function updateBossHealthBar() {
    if (!bossState.entity) return;
    
    const boss = bossState.entity;
    const hpPercentage = (boss.hp / boss.maxHp) * 100;
    
    const hpFill = document.getElementById('bossHpFill');
    const hpText = document.getElementById('bossHpText');
    const bossName = document.getElementById('bossName');
    
    if (hpFill) hpFill.style.width = hpPercentage + '%';
    if (hpText) hpText.textContent = `${Math.max(0, Math.floor(boss.hp))} / ${boss.maxHp}`;
    if (bossName) bossName.textContent = '💀 RAID BOSS 💀';
}

// ==================== BOSS SPAWN/RESPAWN ====================
function spawnBoss() {
    if (!bossState.active && !bossState.isDead) {
        bossState.entity = new RaidBoss();
        bossState.active = true;
        bossState.isDead = false;
        
        // Show cinematic entrance
        showBossEntrance();
    }
}

function checkBossRespawn() {
    if (bossState.isDead && Date.now() >= bossState.respawnTime) {
        console.log('🔄 Boss Respawning...');
        bossState.isDead = false;
        spawnBoss();
    }
}

// ==================== BOSS ENTRANCE CINEMATIC ====================
function showBossEntrance() {
    // Cinematic bars
    const topBar = document.getElementById('cinematicTopBar');
    const bottomBar = document.getElementById('cinematicBottomBar');
    const splash = document.getElementById('bossSplash');
    
    if (topBar) topBar.style.height = '80px';
    if (bottomBar) bottomBar.style.height = '80px';
    if (splash) {
        splash.style.display = 'block';
        splash.textContent = '💀 RAID BOSS APPEARS! 💀';
    }
    
    triggerScreenShake(10, 800);
    
    setTimeout(() => {
        if (topBar) topBar.style.height = '0';
        if (bottomBar) bottomBar.style.height = '0';
        if (splash) splash.style.display = 'none';
    }, 3000);
}

// ==================== BOSS DEFEATED SCREEN ====================
function showBossDefeatedScreen() {
    const screen = document.getElementById('bossDefeatedScreen');
    if (screen) {
        screen.style.display = 'flex';
        
        setTimeout(() => {
            screen.style.display = 'none';
        }, 3000);
    }
}

// ==================== UPDATE BOSS ====================
function updateBoss() {
    checkPlayerInArena();
    checkBossRespawn();
    
    if (bossState.active && bossState.entity) {
        bossState.entity.update();
    }
}

function drawBoss() {
    drawBossArena();
    
    if (bossState.active && bossState.entity) {
        bossState.entity.draw();
    }
}
