// ==================== BOSS & NPC SYSTEM ====================

// ==================== BOSS CLASS ====================
class Boss {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 60;
        this.speed = 1;
        this.hp = 10000;
        this.maxHp = 10000;
        this.color = '#ff0000';
        this.lastAttack = 0;
        this.attackCooldown = 3000; // 3 seconds
    }
    
    update() {
        // Chase player slowly
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
        
        // AOE Attack every 3 seconds
        const now = Date.now();
        if (now - this.lastAttack >= this.attackCooldown) {
            this.performAOE();
            this.lastAttack = now;
        }
        
        // Contact damage
        if (!game.player.isDashing && this.checkCollision(game.player)) {
            game.player.hp -= 2;
            updateUI();
            triggerScreenShake(3, 150);
        }
        
        // Update boss HP bar
        updateBossHPBar();
    }
    
    performAOE() {
        // AOE attack visual and damage
        const aoeRange = 150;
        
        // Check if player is in range
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < aoeRange) {
            game.player.hp -= 15;
            updateUI();
            triggerScreenShake(6, 300);
        }
        
        // Visual effect (red circle expanding)
        createBossAOEEffect(this.x, this.y, aoeRange);
    }
    
    checkCollision(obj) {
        return Math.abs(this.x - obj.x) < (this.size + obj.size) / 2 &&
               Math.abs(this.y - obj.y) < (this.size + obj.size) / 2;
    }
    
    takeDamage(damage) {
        this.hp -= damage;
        game.damageNumbers.push(new DamageNumber(this.x, this.y - this.size/2, damage));
        updateBossHPBar();
        
        if (this.hp <= 0) {
            bossDeath();
        }
    }
    
    draw() {
        // Boss body (larger square)
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Pulsating glow effect
        const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
        ctx.shadowBlur = 20 * pulse;
        ctx.shadowColor = this.color;
        
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
        // Boss crown/marker
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-this.size/2, -this.size/2 - 15, this.size, 10);
        
        ctx.restore();
    }
}

// ==================== BOSS AOE EFFECT ====================
class BossAOEEffect {
    constructor(x, y, maxRadius) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = maxRadius;
        this.life = 30; // frames
        this.maxLife = 30;
    }
    
    update() {
        this.radius = (this.life / this.maxLife) * this.maxRadius;
        this.life--;
        return this.life > 0;
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        
        ctx.save();
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let bossAOEEffects = [];

function createBossAOEEffect(x, y, range) {
    bossAOEEffects.push(new BossAOEEffect(x, y, range));
}

// ==================== BOSS FUNCTIONS ====================
function spawnBoss() {
    if (game.boss.spawned) return;
    
    // Spawn boss at center of screen
    const bossX = canvas.width / 2;
    const bossY = canvas.height / 2;
    
    game.boss.entity = new Boss(bossX, bossY);
    game.boss.spawned = true;
    game.boss.active = true;
    game.boss.currentHp = game.boss.maxHp;
    
    // Play cinematic
    playCinematic();
    
    // Show boss HP bar
    document.getElementById('bossHpBar').style.display = 'block';
    updateBossHPBar();
    
    console.log('🐉 BOSS SPAWNED!');
}

function playCinematic() {
    // Show cinematic bars
    const bars = document.getElementById('cinematicBars');
    const splash = document.getElementById('cinematicSplash');
    
    bars.style.display = 'block';
    splash.style.display = 'block';
    
    // Strong screen shake
    triggerScreenShake(10, 2000);
    
    // Hide after 3 seconds
    setTimeout(() => {
        bars.style.display = 'none';
        splash.style.display = 'none';
    }, 3000);
}

function updateBossHPBar() {
    if (!game.boss.entity) return;
    
    const hpPercent = (game.boss.entity.hp / game.boss.maxHp) * 100;
    document.getElementById('bossHpBarFill').style.width = hpPercent + '%';
    document.getElementById('bossHpText').textContent = 
        `${Math.max(0, Math.floor(game.boss.entity.hp))} / ${game.boss.maxHp}`;
}

function bossDeath() {
    console.log('🎉 BOSS DEFEATED!');
    
    // Remove boss
    game.boss.entity = null;
    game.boss.active = false;
    game.boss.spawned = false;
    
    // Hide boss HP bar
    document.getElementById('bossHpBar').style.display = 'none';
    
    // Give reward (500 coins)
    game.player.coins += 500;
    
    // Mark quest as completed (but allow repeat)
    game.quest.completed = true;
    game.quest.active = false;
    game.quest.progress = 0; // Reset to 0/15
    
    // Make NPC available for repeat quest
    game.npc.questAvailable = true;
    game.npc.hasQuest = false;
    
    // Hide quest tracker temporarily
    document.getElementById('questTracker').style.display = 'none';
    
    // Show victory splash
    showBossDefeatedSplash();
    
    updateUI();
    saveGame();
    
    console.log('✅ Quest Completed! Talk to NPC again for repeat quest.');
}

function showBossDefeatedSplash() {
    const splash = document.getElementById('bossDefeatedSplash');
    splash.classList.add('show');
    splash.style.display = 'block';
    
    setTimeout(() => {
        splash.classList.remove('show');
        splash.style.display = 'none';
    }, 3000);
}

// ==================== NPC SYSTEM ====================
function drawNPC() {
    const npc = game.npc;
    
    ctx.save();
    ctx.translate(npc.x, npc.y);
    
    // NPC body (different color - purple/sage)
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(-npc.size/2, -npc.size/2, npc.size, npc.size);
    
    // NPC face/marker
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-npc.size/4, -npc.size/4, npc.size/2, npc.size/2);
    
    // Quest marker (!) if quest available OR completed (repeatable)
    if ((npc.questAvailable && !game.quest.active) || game.quest.completed) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', 0, -npc.size - 10);
        
        // Pulsating glow
        const pulse = Math.sin(Date.now() / 300) * 5 + 10;
        ctx.shadowBlur = pulse;
        ctx.shadowColor = '#ffd700';
        ctx.fillText('!', 0, -npc.size - 10);
    }
    
    ctx.restore();
}

function checkNPCInteraction(clickX, clickY) {
    const npc = game.npc;
    const distance = Math.sqrt(
        Math.pow(clickX - npc.x, 2) + Math.pow(clickY - npc.y, 2)
    );
    
    // Allow interaction if:
    // 1. Quest available and not active
    // 2. OR quest completed (for repeat)
    if (distance < 50 && npc.questAvailable && (!game.quest.active || game.quest.completed)) {
        showNPCDialog();
    }
}

function showNPCDialog() {
    const dialog = document.getElementById('npcDialog');
    const textEl = document.getElementById('npcText');
    const acceptBtn = document.getElementById('acceptQuestBtn');
    
    // Check if quest has been completed before
    if (game.quest.completed) {
        // Repeatable quest - different dialog
        textEl.textContent = 'Luar biasa! Tapi musuh baru berdatangan lagi, bisa bantu aku sekali lagi?';
        acceptBtn.textContent = 'TERIMA MISI LAGI';
    } else {
        // First time quest
        textEl.textContent = 'Bantu aku kalahkan 15 musuh! Jika berhasil, pemimpin mereka akan muncul.';
        acceptBtn.textContent = 'TERIMA MISI';
    }
    
    dialog.style.display = 'block';
}

function hideNPCDialog() {
    document.getElementById('npcDialog').style.display = 'none';
}

function acceptQuest() {
    game.quest.active = true;
    game.quest.progress = 0;
    game.quest.completed = false; // Reset completed flag
    game.npc.questAvailable = false;
    game.npc.hasQuest = true;
    
    // Show quest tracker
    document.getElementById('questTracker').style.display = 'block';
    updateQuestTracker();
    
    hideNPCDialog();
    
    console.log('📜 Quest Accepted (Repeatable)!');
    saveGame();
}

function updateQuestTracker() {
    document.getElementById('questCount').textContent = game.quest.progress;
    document.getElementById('questGoal').textContent = game.quest.goal;
}

function checkQuestProgress() {
    if (!game.quest.active) return;
    
    game.quest.progress++;
    updateQuestTracker();
    
    // Check if quest completed
    if (game.quest.progress >= game.quest.goal) {
        console.log('🎯 Quest Goal Reached! Spawning Boss...');
        spawnBoss();
    }
    
    saveGame();
}

// ==================== EVENT LISTENERS ====================
// NPC Dialog buttons
document.getElementById('acceptQuestBtn').addEventListener('click', acceptQuest);
document.getElementById('acceptQuestBtn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    acceptQuest();
});

document.getElementById('closeDialogBtn').addEventListener('click', hideNPCDialog);
document.getElementById('closeDialogBtn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    hideNPCDialog();
});

// NOTE: Canvas event listeners dipindahkan ke script.js
// karena canvas belum tersedia saat file ini diload
