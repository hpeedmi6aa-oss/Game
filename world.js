// ==================== WORLD VISUAL SYSTEM ====================
// Dekorasi visual untuk membuat dunia terasa lebih hidup

// ==================== WORLD AREAS DEFINITION ====================
const WORLD_AREAS = {
    SPAWN: { x: 400, y: 400, label: "Spawn Point", color: "#4a9d4a" },
    NPC_GACHA: { x: 150, y: 150, label: "Gacha Shop", color: "#ffd700" },
    NPC_QUEST: { x: 650, y: 150, label: "Quest Giver", color: "#6b5ce7" },
    ENEMY_ZONE: { x: 400, y: 650, label: "Enemy Territory", color: "#ff4444" },
    BOSS_ARENA: { x: 700, y: 700, label: "Boss Arena", color: "#8b0000" }
};

// ==================== TERRAIN MOUNDS (GUNDUKAN TANAH) ====================
const terrainMounds = [];

// Generate random mounds at start
function generateMounds() {
    const moundCount = 20;
    
    for (let i = 0; i < moundCount; i++) {
        // Avoid spawning on paths
        let x, y, validPosition = false;
        let attempts = 0;
        
        while (!validPosition && attempts < 50) {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
            
            // Check if too close to any path
            validPosition = !isNearPath(x, y, 50);
            attempts++;
        }
        
        if (validPosition) {
            terrainMounds.push({
                x: x,
                y: y,
                width: 40 + Math.random() * 60,
                height: 20 + Math.random() * 30,
                rotation: Math.random() * Math.PI,
                color: `hsl(${90 + Math.random() * 20}, ${30 + Math.random() * 20}%, ${40 + Math.random() * 10}%)`
            });
        }
    }
    
    console.log(`🏔️ Generated ${terrainMounds.length} terrain mounds`);
}

function isNearPath(x, y, threshold) {
    for (const path of gamePaths) {
        const dist = distanceToLineSegment(x, y, path.start.x, path.start.y, path.end.x, path.end.y);
        if (dist < threshold) return true;
    }
    return false;
}

function distanceToLineSegment(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

function drawMounds() {
    terrainMounds.forEach(mound => {
        ctx.save();
        ctx.translate(mound.x, mound.y);
        ctx.rotate(mound.rotation);
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.ellipse(0, mound.height * 0.3, mound.width * 0.5, mound.height * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Mound
        const gradient = ctx.createRadialGradient(
            0, -mound.height * 0.2,
            0,
            0, 0,
            mound.width * 0.5
        );
        gradient.addColorStop(0, mound.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, mound.width * 0.5, mound.height * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

// ==================== CONNECTED PATH SYSTEM ====================
const gamePaths = [];

// Generate paths connecting all important areas
function generatePaths() {
    const spawn = WORLD_AREAS.SPAWN;
    const gachaShop = WORLD_AREAS.NPC_GACHA;
    const questGiver = WORLD_AREAS.NPC_QUEST;
    const enemyZone = WORLD_AREAS.ENEMY_ZONE;
    const bossArena = WORLD_AREAS.BOSS_ARENA;
    
    // Main paths from spawn
    gamePaths.push({
        start: spawn,
        end: gachaShop,
        width: 45,
        color: '#d4a574',
        label: 'To Gacha Shop'
    });
    
    gamePaths.push({
        start: spawn,
        end: questGiver,
        width: 45,
        color: '#c9a36a',
        label: 'To Quest Giver'
    });
    
    gamePaths.push({
        start: spawn,
        end: enemyZone,
        width: 40,
        color: '#d4a574',
        label: 'To Enemy Zone'
    });
    
    // Path from enemy zone to boss arena
    gamePaths.push({
        start: enemyZone,
        end: bossArena,
        width: 50,
        color: '#b8956a',
        label: 'To Boss Arena'
    });
    
    // Cross connections
    gamePaths.push({
        start: gachaShop,
        end: questGiver,
        width: 35,
        color: '#d4a574',
        label: 'Between NPCs'
    });
    
    console.log(`🛤️ Generated ${gamePaths.length} connected paths`);
}

function drawPaths() {
    gamePaths.forEach(path => {
        ctx.save();
        
        // Path shadow
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = path.width + 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(path.start.x, path.start.y + 2);
        ctx.lineTo(path.end.x, path.end.y + 2);
        ctx.stroke();
        
        // Main path
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(path.start.x, path.start.y);
        ctx.lineTo(path.end.x, path.end.y);
        ctx.stroke();
        
        // Path texture (dots)
        const pathLength = Math.sqrt(
            Math.pow(path.end.x - path.start.x, 2) + 
            Math.pow(path.end.y - path.start.y, 2)
        );
        const numDots = Math.floor(pathLength / 20);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < numDots; i++) {
            const ratio = i / numDots;
            const x = path.start.x + (path.end.x - path.start.x) * ratio;
            const y = path.start.y + (path.end.y - path.start.y) * ratio;
            const offset = (Math.random() - 0.5) * path.width * 0.4;
            
            ctx.beginPath();
            ctx.arc(x + offset, y + offset, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    });
}

// ==================== AREA MARKERS ====================
function drawAreaMarkers() {
    Object.values(WORLD_AREAS).forEach(area => {
        ctx.save();
        
        // Area circle background
        ctx.fillStyle = area.color + '33'; // 20% opacity
        ctx.beginPath();
        ctx.arc(area.x, area.y, 60, 0, Math.PI * 2);
        ctx.fill();
        
        // Area border
        ctx.strokeStyle = area.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(area.x, area.y, 60, 0, Math.PI * 2);
        ctx.stroke();
        
        // Area label
        ctx.fillStyle = area.color;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#000000';
        ctx.fillText(area.label, area.x, area.y - 75);
        
        ctx.restore();
    });
}

// ==================== DUST PARTICLES (PARTIKEL DEBU) ====================
const terrainMounds = [];

// Generate random mounds at start
function generateMounds() {
    const moundCount = 15;
    
    for (let i = 0; i < moundCount; i++) {
        terrainMounds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            width: 40 + Math.random() * 60,
            height: 20 + Math.random() * 30,
            rotation: Math.random() * Math.PI,
            color: `hsl(${90 + Math.random() * 20}, ${30 + Math.random() * 20}%, ${40 + Math.random() * 10}%)`
        });
    }
    
    console.log(`🏔️ Generated ${moundCount} terrain mounds`);
}

function drawMounds() {
    terrainMounds.forEach(mound => {
        ctx.save();
        ctx.translate(mound.x, mound.y);
        ctx.rotate(mound.rotation);
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.ellipse(0, mound.height * 0.3, mound.width * 0.5, mound.height * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Mound
        const gradient = ctx.createRadialGradient(
            0, -mound.height * 0.2,
            0,
            0, 0,
            mound.width * 0.5
        );
        gradient.addColorStop(0, mound.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, mound.width * 0.5, mound.height * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

// ==================== PATH SYSTEM (JALAN SETAPAK) ====================
const gamePaths = [];

// Generate paths connecting important areas
function generatePaths() {
    // Path from spawn to center
    gamePaths.push({
        start: { x: canvas.width / 2, y: canvas.height / 2 },
        end: { x: canvas.width / 2, y: canvas.height * 0.2 },
        width: 40,
        color: '#d4a574' // Light brown
    });
    
    // Path from spawn to NPC
    gamePaths.push({
        start: { x: canvas.width / 2, y: canvas.height / 2 },
        end: { x: 150, y: 150 },
        width: 35,
        color: '#c9a36a'
    });
    
    // Cross path
    gamePaths.push({
        start: { x: canvas.width * 0.2, y: canvas.height / 2 },
        end: { x: canvas.width * 0.8, y: canvas.height / 2 },
        width: 30,
        color: '#d4a574'
    });
    
    console.log(`🛤️ Generated ${gamePaths.length} paths`);
}

function drawPaths() {
    gamePaths.forEach(path => {
        ctx.save();
        
        // Path shadow
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = path.width + 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(path.start.x, path.start.y + 2);
        ctx.lineTo(path.end.x, path.end.y + 2);
        ctx.stroke();
        
        // Main path
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(path.start.x, path.start.y);
        ctx.lineTo(path.end.x, path.end.y);
        ctx.stroke();
        
        // Path texture (dots)
        const pathLength = Math.sqrt(
            Math.pow(path.end.x - path.start.x, 2) + 
            Math.pow(path.end.y - path.start.y, 2)
        );
        const numDots = Math.floor(pathLength / 15);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < numDots; i++) {
            const ratio = i / numDots;
            const x = path.start.x + (path.end.x - path.start.x) * ratio;
            const y = path.start.y + (path.end.y - path.start.y) * ratio;
            const offset = (Math.random() - 0.5) * path.width * 0.5;
            
            ctx.beginPath();
            ctx.arc(x + offset, y + offset, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    });
}

// ==================== DUST PARTICLES (PARTIKEL DEBU) ====================
class DustParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.life = 30;
        this.maxLife = 30;
        this.size = Math.random() * 2 + 1;
        this.opacity = 0.3;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.life--;
        this.opacity = (this.life / this.maxLife) * 0.3;
        return this.life > 0;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#d4a574';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let dustParticles = [];

function createDustParticles(x, y, count = 3) {
    for (let i = 0; i < count; i++) {
        dustParticles.push(new DustParticle(x, y));
    }
}

function updateDustParticles() {
    dustParticles = dustParticles.filter(p => p.update());
    
    // Create dust when player is moving
    if (game.player.vx !== 0 || game.player.vy !== 0) {
        // Create dust at player feet
        if (Math.random() < 0.3) { // 30% chance per frame
            createDustParticles(
                game.player.x + (Math.random() - 0.5) * game.player.size,
                game.player.y + game.player.size / 2,
                2
            );
        }
    }
}

function drawDustParticles() {
    dustParticles.forEach(p => p.draw());
}

// ==================== GRASS DECORATION ====================
const grassBlades = [];

function generateGrass() {
    const grassCount = 50;
    
    for (let i = 0; i < grassCount; i++) {
        grassBlades.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            height: 5 + Math.random() * 10,
            angle: (Math.random() - 0.5) * 0.3,
            color: `hsl(${100 + Math.random() * 30}, ${40 + Math.random() * 20}%, ${35 + Math.random() * 15}%)`
        });
    }
    
    console.log(`🌿 Generated ${grassCount} grass blades`);
}

function drawGrass() {
    grassBlades.forEach(blade => {
        ctx.save();
        ctx.translate(blade.x, blade.y);
        ctx.rotate(blade.angle);
        
        ctx.strokeStyle = blade.color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -blade.height);
        ctx.stroke();
        
        ctx.restore();
    });
}

// ==================== BUDDHA GOLD GLOW PARTICLES ====================
function updateBuddhaGlow() {
    if (!game.player.isBuddha) return;
    
    // Create gold particles around Buddha player
    if (Math.random() < 0.3) {
        const angle = Math.random() * Math.PI * 2;
        const radius = game.player.size * 0.5;
        const x = game.player.x + Math.cos(angle) * radius;
        const y = game.player.y + Math.sin(angle) * radius;
        
        skillParticles.push(new SkillParticle(
            x, y,
            (Math.random() - 0.5) * 2,
            -Math.random() * 2,
            '#ffd700',
            2 + Math.random() * 2,
            30
        ));
    }
}

// ==================== INITIALIZATION ====================
function initWorld() {
    generateMounds();
    generatePaths();
    generateGrass();
    console.log('🌍 World initialized');
}

// Call this once when game starts
// initWorld();
