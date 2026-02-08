// ==================== SAVE SYSTEM (LocalStorage) ====================

const SAVE_KEY = 'rpg_game_save';

/**
 * Save game data to localStorage
 */
function saveGame() {
    const saveData = {
        player: {
            coins: game.player.coins,
            currentFruit: game.player.currentFruit,
            level: game.player.level,
            exp: game.player.exp,
            kills: game.player.kills,
            atk: game.player.atk,
            hp: Math.max(1, game.player.hp), // Never save with 0 HP
            maxHp: game.player.maxHp
        },
        quest: {
            active: game.quest.active,
            progress: game.quest.progress,
            completed: game.quest.completed
        },
        npc: {
            questAvailable: game.npc.questAvailable,
            hasQuest: game.npc.hasQuest
        },
        boss: {
            spawned: game.boss.spawned,
            active: game.boss.active
        },
        timestamp: Date.now()
    };
    
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        console.log('💾 Game Saved!', saveData);
    } catch (error) {
        console.error('❌ Save Failed:', error);
    }
}

/**
 * Load game data from localStorage
 */
function loadGame() {
    try {
        const savedData = localStorage.getItem(SAVE_KEY);
        
        if (!savedData) {
            console.log('📂 No save data found. Starting fresh.');
            return false;
        }
        
        const data = JSON.parse(savedData);
        
        // Restore player data
        game.player.coins = data.player.coins || 50;
        game.player.currentFruit = data.player.currentFruit || null;
        game.player.level = data.player.level || 1;
        game.player.exp = data.player.exp || 0;
        game.player.kills = data.player.kills || 0;
        game.player.atk = data.player.atk || 10;
        game.player.maxHp = data.player.maxHp || 100;
        game.player.hp = Math.max(1, data.player.hp || 100); // Minimal HP 1
        
        // Restore quest data
        game.quest.active = data.quest?.active || false;
        game.quest.progress = data.quest?.progress || 0;
        game.quest.completed = data.quest?.completed || false;
        
        // Restore NPC data
        game.npc.questAvailable = data.npc?.questAvailable !== undefined ? data.npc.questAvailable : true;
        game.npc.hasQuest = data.npc?.hasQuest || false;
        
        // Restore boss data
        game.boss.spawned = data.boss?.spawned || false;
        game.boss.active = data.boss?.active || false;
        
        // Update UI after loading
        updateUI();
        updateFruitUI();
        updateSkillUI();
        
        // Show quest tracker if quest is active
        if (game.quest.active) {
            document.getElementById('questTracker').style.display = 'block';
            updateQuestTracker();
        }
        
        // Respawn boss if it was active
        if (game.boss.active && game.boss.spawned) {
            spawnBoss();
        }
        
        console.log('✅ Game Loaded!', data);
        return true;
        
    } catch (error) {
        console.error('❌ Load Failed:', error);
        return false;
    }
}

/**
 * Reset all game data
 */
function resetGame() {
    const confirmReset = confirm('⚠️ Yakin ingin reset semua progress? Data tidak bisa dikembalikan!');
    
    if (!confirmReset) return;
    
    try {
        // Clear localStorage
        localStorage.removeItem(SAVE_KEY);
        
        // Reset game state to default
        game.player.coins = 50;
        game.player.currentFruit = null;
        game.player.level = 1;
        game.player.exp = 0;
        game.player.kills = 0;
        game.player.atk = 10;
        game.player.hp = 100;
        game.player.maxHp = 100;
        
        game.quest.active = false;
        game.quest.progress = 0;
        game.quest.completed = false;
        
        game.npc.questAvailable = true;
        game.npc.hasQuest = false;
        
        game.boss.spawned = false;
        game.boss.active = false;
        game.boss.entity = null;
        
        // Hide UI elements
        document.getElementById('questTracker').style.display = 'none';
        document.getElementById('bossHpBar').style.display = 'none';
        
        // Update UI
        updateUI();
        updateFruitUI();
        updateSkillUI();
        
        console.log('🔄 Game Reset!');
        alert('✅ Data berhasil direset!');
        
        // Reload page
        location.reload();
        
    } catch (error) {
        console.error('❌ Reset Failed:', error);
        alert('❌ Gagal reset data!');
    }
}

/**
 * Auto-save game every 30 seconds
 */
function startAutoSave() {
    setInterval(() => {
        saveGame();
        console.log('🔄 Auto-saved');
    }, 30000); // 30 seconds
}

// Reset button event listener
document.getElementById('resetButton').addEventListener('click', resetGame);
document.getElementById('resetButton').addEventListener('touchstart', (e) => {
    e.preventDefault();
    resetGame();
});

// Save on page unload
window.addEventListener('beforeunload', () => {
    saveGame();
});
