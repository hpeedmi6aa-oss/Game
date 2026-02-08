// ==================== NPC SYSTEM ====================
// NPCs dengan interaction system

// ==================== NPC DEFINITIONS ====================
const NPCS = {
    GACHA: {
        x: 150,
        y: 150,
        size: 40,
        color: '#ffd700',
        emoji: '🎲',
        name: 'Gacha Master',
        interactionRadius: 80,
        dialogText: 'Welcome! Spin the wheel of destiny!',
        type: 'gacha'
    },
    QUEST: {
        x: 650,
        y: 150,
        size: 40,
        color: '#6b5ce7',
        emoji: '📜',
        name: 'Quest Giver',
        interactionRadius: 80,
        dialogText: 'I have tasks for brave warriors!',
        type: 'quest'
    }
};

// Active quests from NPC
const activeQuests = {
    quest1: {
        id: 'quest1',
        name: 'Defeat 5 Enemies',
        description: 'Clear the enemy territory of threats',
        target: 5,
        progress: 0,
        completed: false,
        reward: { gold: 100, exp: 50 },
        active: false
    },
    quest2: {
        id: 'quest2',
        name: 'Defeat the Boss',
        description: 'Challenge the Raid Boss in the arena',
        target: 1,
        progress: 0,
        completed: false,
        reward: { gold: 500, exp: 200 },
        active: false,
        prerequisite: 'quest1' // Must complete quest1 first
    }
};

// ==================== NPC DRAWING ====================
function drawNPC(npc) {
    ctx.save();
    ctx.translate(npc.x, npc.y);
    
    // Interaction radius (when player is near)
    const dx = game.player.x - npc.x;
    const dy = game.player.y - npc.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < npc.interactionRadius) {
        // Highlight circle
        ctx.strokeStyle = npc.color + '88';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, npc.interactionRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Press E to interact text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#000000';
        ctx.fillText('[E] Interact', 0, -npc.size - 40);
    }
    
    // NPC body
    ctx.fillStyle = npc.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = npc.color;
    ctx.beginPath();
    ctx.arc(0, 0, npc.size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // NPC emoji
    ctx.shadowBlur = 0;
    ctx.font = `${npc.size * 0.8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(npc.emoji, 0, 0);
    
    // NPC name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.shadowBlur = 3;
    ctx.shadowColor = '#000000';
    ctx.fillText(npc.name, 0, -npc.size - 15);
    
    // Quest indicator (!)
    if (npc.type === 'quest') {
        const hasAvailableQuest = Object.values(activeQuests).some(q => 
            !q.active && !q.completed && (!q.prerequisite || activeQuests[q.prerequisite].completed)
        );
        
        if (hasAvailableQuest) {
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 30px Arial';
            const pulse = Math.sin(Date.now() / 300) * 0.2 + 1;
            ctx.save();
            ctx.scale(pulse, pulse);
            ctx.fillText('!', 0, -npc.size - 60);
            ctx.restore();
        }
    }
    
    ctx.restore();
}

function drawAllNPCs() {
    Object.values(NPCS).forEach(npc => drawNPC(npc));
}

// ==================== NPC INTERACTION ====================
function checkNPCInteraction() {
    for (const [key, npc] of Object.entries(NPCS)) {
        const dx = game.player.x - npc.x;
        const dy = game.player.y - npc.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < npc.interactionRadius) {
            // Show interaction available
            return npc;
        }
    }
    return null;
}

function interactWithNPC(npc) {
    if (npc.type === 'gacha') {
        openGachaDialog();
    } else if (npc.type === 'quest') {
        openQuestDialog();
    }
}

// ==================== GACHA DIALOG ====================
function openGachaDialog() {
    document.getElementById('gachaDialog').style.display = 'block';
    document.getElementById('questDialog').style.display = 'none';
}

function closeGachaDialog() {
    document.getElementById('gachaDialog').style.display = 'none';
}

// ==================== QUEST DIALOG ====================
function openQuestDialog() {
    updateQuestDialogContent();
    document.getElementById('questDialog').style.display = 'block';
    document.getElementById('gachaDialog').style.display = 'none';
}

function closeQuestDialog() {
    document.getElementById('questDialog').style.display = 'none';
}

function updateQuestDialogContent() {
    const container = document.getElementById('questListContainer');
    container.innerHTML = '';
    
    Object.values(activeQuests).forEach(quest => {
        // Check if quest is available
        const isAvailable = !quest.active && !quest.completed && 
                          (!quest.prerequisite || activeQuests[quest.prerequisite].completed);
        
        const isLocked = quest.prerequisite && !activeQuests[quest.prerequisite].completed;
        
        if (quest.active || quest.completed || isAvailable || isLocked) {
            const questDiv = document.createElement('div');
            questDiv.className = 'quest-item';
            
            let status = '';
            let buttonHtml = '';
            
            if (quest.completed) {
                status = '✅ Completed';
                questDiv.style.opacity = '0.6';
            } else if (quest.active) {
                status = `📊 Progress: ${quest.progress}/${quest.target}`;
                if (quest.progress >= quest.target) {
                    buttonHtml = `<button class="quest-btn complete-btn" onclick="completeQuest('${quest.id}')">Complete Quest</button>`;
                }
            } else if (isLocked) {
                status = `🔒 Locked (Complete ${quest.prerequisite} first)`;
                questDiv.style.opacity = '0.5';
            } else {
                buttonHtml = `<button class="quest-btn accept-btn" onclick="acceptQuest('${quest.id}')">Accept Quest</button>`;
            }
            
            questDiv.innerHTML = `
                <div class="quest-header">
                    <strong>${quest.name}</strong>
                    <span class="quest-status">${status}</span>
                </div>
                <div class="quest-description">${quest.description}</div>
                <div class="quest-reward">
                    Reward: 💰 ${quest.reward.gold} Gold | ⭐ ${quest.reward.exp} EXP
                </div>
                ${buttonHtml}
            `;
            
            container.appendChild(questDiv);
        }
    });
}

function acceptQuest(questId) {
    const quest = activeQuests[questId];
    if (quest && !quest.active && !quest.completed) {
        quest.active = true;
        quest.progress = 0;
        
        createSkillText(game.player.x, game.player.y - 50, `Quest Accepted: ${quest.name}`, '#ffd700');
        
        updateQuestDialogContent();
        updateActiveQuestUI();
        
        console.log(`📜 Quest Accepted: ${quest.name}`);
        saveGame();
    }
}

function completeQuest(questId) {
    const quest = activeQuests[questId];
    if (quest && quest.active && quest.progress >= quest.target) {
        quest.completed = true;
        quest.active = false;
        
        // Give rewards
        game.player.coins += quest.reward.gold;
        game.player.exp += quest.reward.exp;
        
        createSkillText(game.player.x, game.player.y - 50, `+${quest.reward.gold} Gold!`, '#ffd700');
        createSkillText(game.player.x, game.player.y - 70, `+${quest.reward.exp} EXP!`, '#00ff00');
        
        checkLevelUp();
        updateQuestDialogContent();
        updateActiveQuestUI();
        updateUI();
        
        console.log(`✅ Quest Completed: ${quest.name}`);
        console.log(`   Rewards: ${quest.reward.gold} gold, ${quest.reward.exp} exp`);
        
        saveGame();
    }
}

function updateActiveQuestUI() {
    const container = document.getElementById('activeQuestsTracker');
    container.innerHTML = '';
    
    const activeQuestsList = Object.values(activeQuests).filter(q => q.active);
    
    if (activeQuestsList.length > 0) {
        container.style.display = 'block';
        
        activeQuestsList.forEach(quest => {
            const div = document.createElement('div');
            div.className = 'active-quest-item';
            div.innerHTML = `
                <strong>${quest.name}</strong>
                <div class="quest-progress-bar">
                    <div class="quest-progress-fill" style="width: ${(quest.progress / quest.target) * 100}%"></div>
                </div>
                <span>${quest.progress}/${quest.target}</span>
            `;
            container.appendChild(div);
        });
    } else {
        container.style.display = 'none';
    }
}

// ==================== QUEST PROGRESS TRACKING ====================
function updateQuestProgress(type, amount = 1) {
    Object.values(activeQuests).forEach(quest => {
        if (!quest.active || quest.completed) return;
        
        // Check quest type and update
        if (type === 'enemy_kill' && quest.id === 'quest1') {
            quest.progress += amount;
            quest.progress = Math.min(quest.progress, quest.target);
            updateActiveQuestUI();
            
            if (quest.progress >= quest.target) {
                createSkillText(game.player.x, game.player.y - 50, 'Quest Complete! Return to NPC', '#ffd700');
            }
            
            saveGame();
        } else if (type === 'boss_kill' && quest.id === 'quest2') {
            quest.progress += amount;
            quest.progress = Math.min(quest.progress, quest.target);
            updateActiveQuestUI();
            
            if (quest.progress >= quest.target) {
                createSkillText(game.player.x, game.player.y - 50, 'Quest Complete! Return to NPC', '#ffd700');
            }
            
            saveGame();
        }
    });
}

// ==================== KEYBOARD INTERACTION ====================
document.addEventListener('keydown', (e) => {
    if (e.key === 'e' || e.key === 'E') {
        const nearbyNPC = checkNPCInteraction();
        if (nearbyNPC) {
            interactWithNPC(nearbyNPC);
        }
    }
    
    if (e.key === 'Escape') {
        closeGachaDialog();
        closeQuestDialog();
    }
});
