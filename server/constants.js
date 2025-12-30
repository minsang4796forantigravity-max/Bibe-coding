const UNITS = {
    // === 1 코스트: 사이클 & 물량 ===
    SKELETONS: {
        id: 'skeletons',
        name: 'Skeletons',
        cost: 1,
        hp: 80,
        damage: 67,
        speed: 2.5,
        range: 1,
        attackSpeed: 1.0,
        type: 'ground',
        targets: 'ground',
        count: 4,
    },

    // === 2 코스트: 저렴한 유틸리티 ===
    GOBLIN: {
        id: 'goblin',
        name: 'Goblin',
        cost: 2,
        hp: 160,
        damage: 100,
        speed: 3.0,
        range: 0.5,
        attackSpeed: 1.1,
        type: 'ground',
        targets: 'ground',
        count: 3,
    },
    RAGE: {
        id: 'rage',
        name: 'Rage',
        cost: 2,
        type: 'spell',
        radius: 3.0,
        duration: 6,
        speedBuff: 1.35,
        attackSpeedBuff: 1.35,
    },
    LOG: {
        id: 'log',
        name: 'Log',
        cost: 2,
        type: 'spell',
        damage: 240,
        knockback: 2.0,
        width: 2.0,
        range: 10,
        speed: 12,
    },

    // === 3 코스트: 기본 전투 유닛 & 스펠 ===
    KNIGHT: {
        id: 'knight',
        name: 'Knight',
        cost: 3,
        hp: 1200, // 1400 -> 1200
        damage: 145, // 160 -> 145
        speed: 1.2,
        range: 1,
        attackSpeed: 1.2,
        type: 'ground',
        targets: 'ground',
        count: 1,
        shield: 300, // New trait: Shield
    },
    ARCHER: {
        id: 'archer',
        name: 'Archer',
        cost: 3,
        hp: 250,
        damage: 90,
        speed: 1.4,
        range: 5.5, // 5.0 -> 5.5
        attackSpeed: 1.0, // 1.2 -> 1.0
        type: 'ground',
        targets: 'both',
        count: 2,
    },
    BOMBER: {
        id: 'bomber',
        name: 'Bomber',
        cost: 3,
        hp: 300,
        damage: 200,
        speed: 1.6,
        range: 4.5,
        attackSpeed: 1.8,
        type: 'ground',
        targets: 'ground', // Fixed targeting
        splash: 1.5,
        count: 1,
    },
    KAMIKAZE: {
        id: 'kamikaze',
        name: 'Kamikaze',
        cost: 3,
        hp: 200,
        damage: 600, // 800 -> 600
        speed: 3.0, // 3.5 -> 3.0
        range: 0.5,
        attackSpeed: 0,
        type: 'ground',
        targets: 'ground',
        selfDestruct: true,
        splash: 2.0, // 2.5 -> 2.0
        count: 1,
    },
    CANNON: {
        id: 'cannon',
        name: 'Cannon',
        cost: 3,
        hp: 700,
        damage: 120,
        speed: 0,
        range: 5.5,
        attackSpeed: 0.8,
        type: 'building',
        targets: 'ground', // Fixed targeting
        lifetime: 30,
        count: 1,
        projectile: 'cannonball',
        projectileSpeed: 12,
    },
    TORNADO: {
        id: 'tornado',
        name: 'Tornado',
        cost: 3,
        type: 'spell',
        radius: 3.0,
        duration: 3,
        damagePerSecond: 70,
        pullForce: 3.5,
    },
    GOBLIN_BARREL: {
        id: 'goblin_barrel',
        name: 'Goblin Barrel',
        cost: 3,
        type: 'spell',
        spawnUnit: 'goblin',
        spawnCount: 3,
        speed: 15,
    },

    // === 4 코스트: 특수 유닛 & 스펠 ===
    VALKYRIE: {
        id: 'valkyrie',
        name: 'Valkyrie',
        cost: 4,
        hp: 1600,
        damage: 180, // 220 -> 180
        speed: 1.5,
        range: 1,
        attackSpeed: 1.5,
        type: 'ground',
        targets: 'ground',
        splash: 1.5,
        count: 1,
    },
    HOG_RIDER: {
        id: 'hog_rider',
        name: 'Hog Rider',
        cost: 4,
        hp: 1400,
        damage: 260,
        speed: 2.5,
        range: 1,
        attackSpeed: 1.6,
        type: 'ground',
        targets: 'ground',
        favoriteTarget: 'building',
        count: 1,
        canCharge: true, // New trait: Charge
    },
    BABY_DRAGON: {
        id: 'baby_dragon',
        name: 'Baby Dragon',
        cost: 4,
        hp: 1000,
        damage: 130,
        speed: 1.8,
        range: 3.5,
        attackSpeed: 1.5,
        type: 'flying',
        targets: 'both',
        splash: 1.5,
        count: 1,
        projectile: 'fireball_small',
        projectileSpeed: 10,
    },
    SNIPER: {
        id: 'sniper',
        name: 'Sniper',
        cost: 4,
        hp: 350,
        damage: 300,
        speed: 1.0,
        range: 7.0,
        attackSpeed: 2.5,
        type: 'ground',
        targets: 'both',
        count: 1,
        projectile: 'bullet',
        projectileSpeed: 25,
    },
    AIR_DEFENSE: { // New specialized building
        id: 'air_defense',
        name: 'Air Defense',
        cost: 3,
        hp: 800,
        damage: 350,
        speed: 0,
        range: 7.0,
        attackSpeed: 1.0,
        type: 'building',
        targets: 'air',
        lifetime: 40,
        count: 1,
        projectile: 'magic_bolt',
        projectileSpeed: 15,
    },
    FIREBALL: {
        id: 'fireball',
        name: 'Fireball',
        cost: 4,
        damage: 572,
        type: 'spell',
        targets: 'both',
        radius: 2.5,
        speed: 15,
    },
    FREEZE: {
        id: 'freeze',
        name: 'Freeze',
        cost: 4,
        type: 'spell',
        radius: 3.0,
        duration: 4.0,
    },
    ELECTRO_WIZARD: {
        id: 'electro_wizard',
        name: 'Electro Wizard',
        cost: 4,
        hp: 600,
        damage: 100,
        speed: 1.4,
        range: 5.0,
        attackSpeed: 1.7,
        type: 'ground',
        targets: 'both',
        count: 1,
        stunDuration: 0.5,
        deployStunRadius: 2.0,
        projectile: 'zap',
        projectileSpeed: 20,
    },

    // === 5 코스트: 강력한 유닛 & 건물 ===
    GIANT: {
        id: 'giant',
        name: 'Giant',
        cost: 5,
        hp: 2800, // 3300 -> 2800
        damage: 210,
        speed: 0.9,
        range: 1,
        attackSpeed: 1.5,
        type: 'ground',
        targets: 'ground',
        favoriteTarget: 'building',
        count: 1,
    },
    WIZARD: {
        id: 'wizard',
        name: 'Wizard',
        cost: 5,
        hp: 600,
        damage: 230,
        speed: 1.4,
        range: 5.5,
        attackSpeed: 1.4,
        type: 'ground',
        targets: 'both',
        splash: 1.5,
        count: 1,
        projectile: 'fireball_small',
        projectileSpeed: 11,
        burnDps: 20, // New trait: Burn
        burnDuration: 3,
    },
    WITCH: {
        id: 'witch',
        name: 'Witch',
        cost: 5,
        hp: 700,
        damage: 100,
        speed: 1.2,
        range: 5,
        attackSpeed: 0.7,
        type: 'ground',
        targets: 'both',
        splash: 1.0,
        spawnUnit: 'skeletons',
        spawnInterval: 7,
        spawnCount: 3,
        spawnOnDeploy: true,
        count: 1,
        projectile: 'magic_bolt',
        projectileSpeed: 9,
        curseSlow: 0.4, // New trait: Slow (Curse)
        curseDuration: 2,
    },
    BARBARIANS: {
        id: 'barbarians',
        name: 'Barbarians',
        cost: 5,
        hp: 550,
        damage: 150,
        speed: 1.5,
        range: 1,
        attackSpeed: 1.4,
        type: 'ground',
        targets: 'ground',
        count: 5,
    },
    BALLOON: {
        id: 'balloon',
        name: 'Balloon',
        cost: 5,
        hp: 1400,
        damage: 800,
        speed: 1.5,
        range: 0.5,
        attackSpeed: 3.0,
        type: 'flying',
        targets: 'ground',
        favoriteTarget: 'building',
        deathDamage: 200,
        deathDamageRadius: 3.0,
        count: 1,
    },
    GOBLIN_HUT: {
        id: 'goblin_hut',
        name: 'Goblin Hut',
        cost: 5,
        hp: 1200,
        type: 'building',
        targets: 'ground',
        lifetime: 50,
        spawnUnit: 'goblin',
        spawnInterval: 4.5,
    },

    // === 6 코스트 ===
    MANA_COLLECTOR: {
        id: 'mana_collector',
        name: 'Mana Collector',
        cost: 6, // 8 -> 6
        hp: 1000,
        type: 'building',
        lifetime: 70,
        manaProduction: 1,
        productionInterval: 8.5,
    },

    // === 1 코스트 스펠 ===
    HEAL: {
        id: 'heal',
        name: 'Heal',
        cost: 1,
        type: 'spell',
        radius: 2.5,
        duration: 2,
        healPerSecond: 150,
    },

    // === 타워 ===
    TOWER: {
        id: 'tower',
        name: 'King Tower',
        hp: 4000,
        damage: 110,
        range: 7,
        attackSpeed: 0.8,
        type: 'building',
        targets: 'both',
    }
};

// 진화 스탯: 각 유닛마다 개별적으로 조정된 강화 스탯
const EVOLVED_STATS = {
    // === 1 코스트 ===
    SKELETONS: {
        hp: 100,
        damage: 80,
        count: 6,
    },

    // === 2 코스트 ===
    GOBLIN: {
        hp: 200,
        damage: 130,
        count: 4,
    },
    RAGE: {
        radius: 4.0,
        duration: 8,
        speedBuff: 1.5,
        attackSpeedBuff: 1.5,
    },
    LOG: {
        damage: 300,
        width: 2.5,
        knockback: 3.0,
    },

    // === 3 코스트 ===
    KNIGHT: {
        hp: 1800,
        damage: 180,
        speed: 1.3,
    },
    ARCHER: {
        hp: 300,
        damage: 110,
        range: 6.0,
    },
    BOMBER: {
        hp: 350,
        damage: 250,
        splash: 2.0,
    },
    KAMIKAZE: {
        hp: 250,
        damage: 1000,
        splash: 3.0,
        speed: 4.0,
    },
    CANNON: {
        hp: 900,
        damage: 150,
        attackSpeed: 0.7,
    },
    TORNADO: {
        radius: 4.0,
        duration: 4,
        damagePerSecond: 100,
        pullForce: 4.5,
    },
    GOBLIN_BARREL: {
        spawnCount: 4,
    },

    // === 4 코스트 ===
    VALKYRIE: {
        hp: 2000,
        damage: 260,
        splash: 2.0,
        speed: 1.6,
    },
    HOG_RIDER: {
        hp: 1600,
        damage: 300,
        speed: 2.7,
    },
    BABY_DRAGON: {
        hp: 1300,
        damage: 160,
        splash: 2.0,
        range: 4.0,
    },
    SNIPER: {
        hp: 450,
        damage: 400,
        range: 9.0,
    },
    FIREBALL: {
        damage: 700,
        radius: 3.0,
    },
    FREEZE: {
        radius: 4.0,
        duration: 5.0,
    },
    ELECTRO_WIZARD: {
        hp: 750,
        damage: 140,
        stunDuration: 1.0,
    },

    // === 5 코스트 ===
    GIANT: {
        hp: 4200,
        damage: 250,
    },
    WIZARD: {
        hp: 750,
        damage: 280,
        splash: 2.0,
        range: 6.0,
    },
    WITCH: {
        hp: 850,
        spawnInterval: 5,
        spawnCount: 4,
    },
    BARBARIANS: {
        hp: 650,
        damage: 180,
        count: 6,
    },
    BALLOON: {
        hp: 1700,
        damage: 1000,
        deathDamage: 400,
    },
    GOBLIN_HUT: {
        hp: 1500,
        lifetime: 60,
        spawnInterval: 4.0,
    },

    // === 6 코스트 ===
    MANA_COLLECTOR: {
        hp: 1400,
        lifetime: 80,
        manaProduction: 1,
        productionInterval: 7.0,
    },

    // === 1 코스트 ===
    HEAL: {
        radius: 3.5,
        duration: 3,
        healPerSecond: 200,
    },
};

const GAME_CONFIG = {
    MANA_REGEN_RATE: 0.5,
    MAX_MANA: 20, // 20 -> 10 (Standard) -> 20 (User Request)
    FIELD_WIDTH: 10,
    FIELD_HEIGHT: 18,
    FPS: 30,
};

module.exports = { UNITS, EVOLVED_STATS, GAME_CONFIG };
