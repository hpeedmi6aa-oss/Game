// ==================== FRUIT DATABASE - 10 DEVIL FRUITS ====================
// Total: 10 Buah x 3 Skill = 30 Skill Unik

const FRUITS = {
    flame: {
        name: "Flame Fruit",
        emoji: "🔥",
        color: "#ff4500",
        glowColor: "#ff8c00",
        atkBonus: 15,
        speedBonus: 0,
        description: "Kuasai kekuatan api yang membakar!",
        rarity: "Common",
        gachaCost: 10,
        
        skills: {
            z: {
                name: "Fire Fist",
                cooldown: 4000,
                damage: 25,
                icon: "🔥",
                description: "Tembakan api dari tangan",
                type: "projectile"
            },
            x: {
                name: "Flame Wave",
                cooldown: 8000,
                damage: 40,
                icon: "🌊🔥",
                description: "Gelombang api area 180°",
                type: "wave"
            },
            c: {
                name: "Inferno Blast",
                cooldown: 12000,
                damage: 80,
                icon: "💥🔥",
                description: "Ledakan api massive + burn",
                type: "aoe"
            }
        }
    },
    
    ice: {
        name: "Ice Fruit",
        emoji: "❄️",
        color: "#00bfff",
        glowColor: "#87ceeb",
        atkBonus: 5,
        speedBonus: 0,
        description: "Bekukan musuh dengan es abadi!",
        rarity: "Common",
        gachaCost: 10,
        
        skills: {
            z: {
                name: "Ice Shard",
                cooldown: 3500,
                damage: 15,
                icon: "💎❄️",
                description: "3 pecahan es tembak musuh",
                type: "projectile"
            },
            x: {
                name: "Glacial Burst",
                cooldown: 8000,
                damage: 35,
                icon: "💥❄️",
                description: "Ledakan es 360° + freeze",
                type: "freeze"
            },
            c: {
                name: "Frozen Domain",
                cooldown: 15000,
                damage: 60,
                icon: "🌨️❄️",
                description: "Area es freeze semua musuh",
                type: "domain"
            }
        }
    },
    
    light: {
        name: "Light Fruit",
        emoji: "⚡",
        color: "#ffff00",
        glowColor: "#ffd700",
        atkBonus: 10,
        speedBonus: 2,
        description: "Kecepatan cahaya dan listrik!",
        rarity: "Rare",
        gachaCost: 20,
        
        skills: {
            z: {
                name: "Light Beam",
                cooldown: 2500,
                damage: 20,
                icon: "⚡",
                description: "Laser instan ke musuh terdekat",
                type: "instant"
            },
            x: {
                name: "Sacred Rain",
                cooldown: 7000,
                damage: 45,
                icon: "🌟⚡",
                description: "Hujan cahaya dari langit",
                type: "rain"
            },
            c: {
                name: "Divine Judgment",
                cooldown: 10000,
                damage: 100,
                icon: "✨⚡",
                description: "Cahaya suci penghakiman",
                type: "ultimate"
            }
        }
    },
    
    dark: {
        name: "Dark Fruit",
        emoji: "🌑",
        color: "#4b0082",
        glowColor: "#8b00ff",
        atkBonus: 8,
        speedBonus: 0,
        description: "Kendalikan kegelapan dan gravitasi!",
        rarity: "Rare",
        gachaCost: 20,
        
        skills: {
            z: {
                name: "Shadow Pulse",
                cooldown: 4000,
                damage: 18,
                icon: "🌑",
                description: "Gelombang bayangan",
                type: "wave"
            },
            x: {
                name: "Black Hole",
                cooldown: 9000,
                damage: 50,
                icon: "⚫🌀",
                description: "Tarik semua musuh ke tengah",
                type: "blackhole"
            },
            c: {
                name: "Void Collapse",
                cooldown: 14000,
                damage: 85,
                icon: "💀🌑",
                description: "Ledakan gravitasi",
                type: "gravity"
            }
        }
    },
    
    wind: {
        name: "Wind Fruit",
        emoji: "🌪️",
        color: "#90ee90",
        glowColor: "#98fb98",
        atkBonus: 3,
        speedBonus: 1.5,
        description: "Kuasai angin dan tornado!",
        rarity: "Common",
        gachaCost: 10,
        
        skills: {
            z: {
                name: "Wind Slash",
                cooldown: 3000,
                damage: 12,
                icon: "🌪️",
                description: "Tebasan angin tajam",
                type: "slash"
            },
            x: {
                name: "Tornado Spin",
                cooldown: 7000,
                damage: 38,
                icon: "🌀",
                description: "Tornado dorong musuh",
                type: "knockback"
            },
            c: {
                name: "Hurricane Fury",
                cooldown: 11000,
                damage: 70,
                icon: "🌪️💨",
                description: "Badai massive area luas",
                type: "aoe"
            }
        }
    },
    
    magma: {
        name: "Magma Fruit",
        emoji: "🌋",
        color: "#8b0000",
        glowColor: "#ff4500",
        atkBonus: 20,
        speedBonus: -0.5,
        description: "Lava panas yang melelehkan segalanya!",
        rarity: "Epic",
        gachaCost: 30,
        
        skills: {
            z: {
                name: "Lava Fist",
                cooldown: 4500,
                damage: 30,
                icon: "🌋",
                description: "Pukulan lava panas",
                type: "melee"
            },
            x: {
                name: "Meteor Shower",
                cooldown: 9000,
                damage: 55,
                icon: "☄️🌋",
                description: "Hujan meteor lava",
                type: "meteor"
            },
            c: {
                name: "Volcanic Eruption",
                cooldown: 16000,
                damage: 90,
                icon: "💥🌋",
                description: "Erupsi + lava pool DOT",
                type: "eruption"
            }
        }
    },
    
    quake: {
        name: "Quake Fruit",
        emoji: "💥",
        color: "#ffffff",
        glowColor: "#add8e6",
        atkBonus: 25,
        speedBonus: -1,
        description: "Gempa bumi yang menghancurkan!",
        rarity: "Legendary",
        gachaCost: 50,
        
        skills: {
            z: {
                name: "Tremor Punch",
                cooldown: 5000,
                damage: 35,
                icon: "💥",
                description: "Pukulan getaran kuat",
                type: "shockwave"
            },
            x: {
                name: "Earthquake",
                cooldown: 10000,
                damage: 65,
                icon: "🌊💥",
                description: "Gempa + screen shake",
                type: "earthquake"
            },
            c: {
                name: "Cataclysm",
                cooldown: 18000,
                damage: 120,
                icon: "💀💥",
                description: "Retakan layar + massive shake",
                type: "cataclysm"
            }
        }
    },
    
    buddha: {
        name: "Buddha Fruit",
        emoji: "🙏",
        color: "#ffd700",
        glowColor: "#ffff00",
        atkBonus: 12,
        speedBonus: 0,
        description: "Transformasi dewa Buddha!",
        rarity: "Legendary",
        gachaCost: 50,
        
        skills: {
            z: {
                name: "Palm Strike",
                cooldown: 4000,
                damage: 28,
                icon: "🙏",
                description: "Pukulan telapak suci",
                type: "melee"
            },
            x: {
                name: "Buddha Form",
                cooldown: 12000,
                damage: 0,
                icon: "✨🙏",
                description: "Transform 2x size + defense",
                type: "transform"
            },
            c: {
                name: "Divine Impact",
                cooldown: 15000,
                damage: 95,
                icon: "💫🙏",
                description: "Hantaman suci area luas",
                type: "ultimate"
            }
        }
    },
    
    electric: {
        name: "Electric Fruit",
        emoji: "⚡",
        color: "#ffff00",
        glowColor: "#ffaa00",
        atkBonus: 18,
        speedBonus: 1,
        description: "Petir yang menyambar!",
        rarity: "Epic",
        gachaCost: 30,
        
        skills: {
            z: {
                name: "Thunder Strike",
                cooldown: 3500,
                damage: 22,
                icon: "⚡",
                description: "Petir instan 1 target",
                type: "instant"
            },
            x: {
                name: "Chain Lightning",
                cooldown: 8000,
                damage: 48,
                icon: "⚡🔗",
                description: "Petir zigzag antar musuh",
                type: "chain"
            },
            c: {
                name: "Thunder God",
                cooldown: 13000,
                damage: 88,
                icon: "👑⚡",
                description: "Badai petir area massive",
                type: "storm"
            }
        }
    },
    
    venom: {
        name: "Venom Fruit",
        emoji: "☠️",
        color: "#9400d3",
        glowColor: "#8b008b",
        atkBonus: 10,
        speedBonus: 0,
        description: "Racun mematikan yang perlahan membunuh!",
        rarity: "Epic",
        gachaCost: 30,
        
        skills: {
            z: {
                name: "Poison Spit",
                cooldown: 3500,
                damage: 15,
                icon: "☠️",
                description: "Ludah racun DOT",
                type: "projectile"
            },
            x: {
                name: "Venom Pool",
                cooldown: 8500,
                damage: 42,
                icon: "💜☠️",
                description: "Kolam racun di lantai",
                type: "pool"
            },
            c: {
                name: "Hydra",
                cooldown: 14000,
                damage: 78,
                icon: "🐍☠️",
                description: "Racun naga 3 kepala",
                type: "ultimate"
            }
        }
    }
};

// Gacha Rarity Weight
const RARITY_WEIGHTS = {
    "Common": 50,      // 50%
    "Rare": 30,        // 30%
    "Epic": 15,        // 15%
    "Legendary": 5     // 5%
};

function getAllFruitKeys() {
    return Object.keys(FRUITS);
}

function getRandomFruit() {
    const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    let selectedRarity = null;
    for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
        random -= weight;
        if (random <= 0) {
            selectedRarity = rarity;
            break;
        }
    }
    
    const fruitsOfRarity = Object.entries(FRUITS)
        .filter(([key, data]) => data.rarity === selectedRarity)
        .map(([key]) => key);
    
    const randomKey = fruitsOfRarity[Math.floor(Math.random() * fruitsOfRarity.length)];
    
    return {
        key: randomKey,
        data: FRUITS[randomKey]
    };
}

function getFruit(key) {
    return FRUITS[key] || null;
}

function getSkill(fruitKey, skillSlot) {
    const fruit = getFruit(fruitKey);
    if (!fruit) return null;
    return fruit.skills[skillSlot] || null;
}
