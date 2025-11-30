export const UNITS = {
  // === 1 코스트: 사이클 & 물량 ===
  SKELETONS: {
    id: 'skeletons',
    name: 'Skeletons',
    cost: 1,
    hp: 100,
    damage: 67,
    speed: 2.5,
    range: 1,
    damage: 700,
    speed: 3.5,
    range: 0.5,
    attackSpeed: 0,
    type: 'ground',
    selfDestruct: true,
    splash: 2.5,
    count: 1,
  },

  // === 4 코스트: 특수 유닛 & 스펠 ===
  CANNON: {
    id: 'cannon',
    name: 'Cannon',
    cost: 4,
    hp: 597,
    damage: 147,
    speed: 0.7,
    range: 7,
    attackSpeed: 0.9,
    type: 'both',
    count: 1,
    projectile: 'cannonball',
    projectileSpeed: 10,
  },
  SNIPER: {
    id: 'sniper',
    name: 'Sniper',
    cost: 5,
    hp: 230,
    damage: 240,
    speed: 1.0,
    range: 10,
    attackSpeed: 3.0,
    type: 'ground',
    count: 1,
    projectile: 'bullet',
    projectileSpeed: 20,
  },
  VALKYRIE: {
    id: 'valkyrie',
    name: 'Valkyrie',
    cost: 4,
    hp: 1600,
    damage: 220,
    speed: 1.5,
    range: 1,
    attackSpeed: 1.5,
    type: 'ground',
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
    favoriteTarget: 'building',
    count: 1,
  },
  BABY_DRAGON: {
    id: 'baby_dragon',
    name: 'Baby Dragon',
    cost: 4,
    hp: 850,
    damage: 110,
    speed: 1.8,
    range: 3,
    attackSpeed: 1.5,
    type: 'flying',
    splash: 1.5,
    count: 1,
    projectile: 'fireball_small',
    projectileSpeed: 8,
  },
  FIREBALL: {
    id: 'fireball',
    name: 'Fireball',
    cost: 6,
    damage: 650,
    type: 'spell',
    radius: 1.5,
    speed: 15, // Added speed for projectile
  },
  TORNADO: {
    id: 'tornado',
    name: 'Tornado',
    cost: 3,
    type: 'spell',
    radius: 2.5,
    duration: 4,
    damagePerSecond: 50,
    pullForce: 5,
  },
  RAGE: {
    id: 'rage',
    name: 'Rage',
    cost: 2,
    type: 'spell',
    radius: 2.5,
    duration: 8,
    speedBuff: 1.6,
    attackSpeedBuff: 1.6,
  },
  HEAL: {
    id: 'heal',
    name: 'Heal',
    cost: 1,
    type: 'spell',
    radius: 2.0,
    duration: 3,
    healPerSecond: 100,
  },
  LOG: {
    id: 'log',
    name: 'Log',
    cost: 2,
    type: 'spell',
    damage: 240,
    knockback: 2.0,
    width: 1.5,
    range: 10, // distance -> range
    speed: 10, // Added speed
  },
  FREEZE: {
    id: 'freeze',
    name: 'Freeze',
    cost: 4,
    type: 'spell',
    radius: 3.0,
    duration: 3.0,
  },
  ELECTRO_WIZARD: {
    id: 'electro_wizard',
    name: 'Electro Wizard',
    cost: 4,
    hp: 650,
    damage: 120,
    speed: 1.4,
    range: 5,
    attackSpeed: 1.7,
    type: 'ground',
    count: 1,
    stunDuration: 0.5,
    deployStunRadius: 2.0,
    projectile: 'zap',
    projectileSpeed: 15,
  },
  GOBLIN_BARREL: {
    id: 'goblin_barrel',
    name: 'Goblin Barrel',
    cost: 3,
    type: 'spell',
    spawnUnit: 'goblin',
    spawnCount: 3,
    speed: 15, // Added speed
  },

  // === 5 코스트: 강력한 유닛 & 건물 ===
  GIANT: {
    id: 'giant',
    name: 'Giant',
    cost: 6,
    hp: 3000,
    damage: 200,
    speed: 1.0,
    range: 1,
    attackSpeed: 1.5,
    type: 'ground',
    target: 'building',
    count: 1,
  },
  WIZARD: {
    id: 'wizard',
    name: 'Wizard',
    cost: 5,
    hp: 598,
    damage: 169,
    speed: 1.4,
    range: 5.5,
    attackSpeed: 1.7,
    type: 'ground',
    splash: 2,
    count: 1,
    projectile: 'fireball_small',
    projectileSpeed: 9,
  },
  WITCH: {
    id: 'witch',
    name: 'Witch',
    cost: 5,
    hp: 850,
    damage: 90,
    speed: 1.2,
    range: 5,
    attackSpeed: 0.7,
    type: 'ground',
    splash: 1.0,
    spawnUnit: 'skeletons',
    spawnInterval: 0,
    spawnCount: 4,
    spawnOnDeploy: true,
    count: 1,
    projectile: 'magic_bolt',
    projectileSpeed: 9,
  },
  BARBARIANS: {
    id: 'barbarians',
    name: 'Barbarians',
    cost: 5,
    hp: 700,
    damage: 170,
    speed: 1.6,
    range: 1,
    attackSpeed: 1.4,
    type: 'ground',
    count: 4,
  },
  BALLOON: {
    id: 'balloon',
    name: 'Balloon',
    cost: 5,
    hp: 1396,
    damage: 600,
    speed: 1.5,
    range: 0.5,
    attackSpeed: 3.0,
    type: 'flying',
    favoriteTarget: 'building',
    deathDamage: 350,
    deathDamageRadius: 3.5,
    count: 1,
  },
  GOBLIN_HUT: {
    id: 'goblin_hut',
    name: 'Goblin Hut',
    cost: 5,
    hp: 1007,
    type: 'building',
    lifetime: 40,
    spawnUnit: 'goblin',
    spawnInterval: 3,
  },

  // === 6 코스트: 투자형 건물 ===
  MANA_COLLECTOR: {
    id: 'mana_collector',
    name: 'Mana Collector',
    cost: 8,
    hp: 3400,
    type: 'building',
    lifetime: 60,
    manaProduction: 0.5,
    productionInterval: 3.5,
  },

  // === 타워 ===
  TOWER: {
    id: 'tower',
    name: 'King Tower',
    hp: 4008,
    damage: 100,
    range: 7,
    attackSpeed: 0.8,
    type: 'building',
  }
};

// 진화 스탯: 각 유닛마다 개별적으로 조정된 강화 스탯
export const EVOLVED_STATS = {
  // === 1 코스트 ===
  SKELETONS: {
    hp: 120,           // +20 HP (생존력 향상)
    damage: 80,        // +13 데미지 (+19%)
    speed: 2.7,        // +0.2 속도
    count: 8,          // 6 → 8마리 (+33%)
  },

  // === 2 코스트 ===
  GOBLIN: {
    hp: 180,           // +30 HP (+20%)
    damage: 120,       // +20 데미지 (딜러 특성 강화)
    speed: 2.7,        // +0.2 속도
    attackSpeed: 1.0,  // -0.1 (더 빠른 공격)
  },

  // === 3 코스트 ===
  KNIGHT: {
    hp: 1800,          // +300 HP (탱커 특성 강화, +20%)
    damage: 185,       // +35 데미지 (+23%)
    speed: 1.35,       // +0.15 속도
  },
  ARCHER: {
    hp: 300,           // +48 HP
    damage: 115,       // +26 데미지
    range: 6.5,        // +1.0 사거리 (원거리 특성 강화)
    attackSpeed: 1.0,  // -0.2 (더 빠른 공격)
  },
  BOMBER: {
    hp: 250,           // +45 HP
    damage: 180,       // +47 데미지 (광역 딜 증가)
    splash: 2.0,       // +0.5 범위
    speed: 1.8,        // +0.2 속도
  },
  KAMIKAZE: {
    hp: 220,           // +40 HP (+22%)
    damage: 850,       // +150 데미지 (자폭 특성 강화, +21%)
    splash: 2.8,       // +0.3 범위
    speed: 3.8,        // +0.3 속도 (더 빠르게 돌진)
  },

  // === 4 코스트 ===
  CANNON: {
    hp: 800,           // +203 HP
    damage: 210,       // +63 데미지
    range: 7.0,        // +1.0 사거리
    attackSpeed: 0.75, // -0.15 (더 빠른 공격)
  },
  SNIPER: {
    hp: 350,           // +78 HP
    damage: 320,       // +80 데미지 (고화력 특성)
    range: 12,         // +2 사거리 (저격수 특성 강화)
    attackSpeed: 2.7,  // -0.3
    projectileSpeed: 25, // +5 투사체 속도
  },
  VALKYRIE: {
    hp: 2100,          // +500 HP
    damage: 290,       // +70 데미지
    splash: 2.0,       // +0.5 범위 (광역 탱커)
    speed: 1.7,        // +0.2 속도
  },
  HOG_RIDER: {
    hp: 1650,          // +250 HP (+18%)
    damage: 315,       // +55 데미지 (+21%)
    speed: 2.8,        // +0.3 속도 (돌격 특성 강화)
    attackSpeed: 1.45, // -0.15
  },
  BABY_DRAGON: {
    hp: 1350,          // +350 HP
    damage: 175,       // +45 데미지
    splash: 2.0,       // +0.5 범위
    speed: 2.1,        // +0.3 속도
    range: 3.5,        // +0.5 사거리
  },

  // === 스펠 (진화 시 효과 강화) ===
  FIREBALL: {
    damage: 780,       // +130 데미지 (+20%)
    radius: 1.8,       // +0.3 범위
  },
  TORNADO: {
    radius: 2.5,       // +0.5 범위
    duration: 4,       // +1초
    damagePerSecond: 70, // +20 DPS
    pullForce: 4,      // +1 끌어당김
  },
  RAGE: {
    radius: 3.0,       // +0.5 범위
    duration: 8,       // +2초
    speedBuff: 1.5,    // 1.35 → 1.5
    attackSpeedBuff: 1.5, // 1.35 → 1.5
  },
  HEAL: {
    radius: 2.5,       // +0.5 범위
    duration: 4.5,     // +1.5초
    healPerSecond: 150, // +50 HPS
  },

  // === 5 코스트 ===
  GIANT: {
    hp: 4000,          // +725 HP (초탱커, +22%)
    damage: 245,       // +45 데미지 (+23%)
    speed: 1.15,       // +0.15 속도
    attackSpeed: 1.35, // -0.15
  },
  WIZARD: {
    hp: 740,           // +142 HP (+24%)
    damage: 210,       // +41 데미지 (+24%)
    splash: 2.3,       // +0.3 범위 (광역 마법사)
    range: 6.2,        // +0.7 사거리
    attackSpeed: 1.55, // -0.15
  },
  WITCH: {
    hp: 950,           // +250 HP
    damage: 95,        // +25 데미지
    spawnInterval: 5.5, // -1.5초 (더 자주 소환)
    spawnCount: 4,     // 3 → 4마리 스켈레톤
    range: 6.0,        // +1.0 사거리
  },
  BARBARIANS: {
    hp: 700,           // +100 HP (각 바바리안, +17%)
    damage: 185,       // +35 데미지 (+23%)
    speed: 1.65,       // +0.15 속도
    attackSpeed: 1.25, // -0.15
    count: 5,          // 4 → 5마리 (+25%)
  },
  BALLOON: {
    hp: 1700,          // +304 HP (+22%)
    damage: 720,       // +120 데미지 (건물 파괴자, +20%)
    speed: 1.7,        // +0.2 속도
    deathDamage: 250,  // +50 데미지 (+25%)
    deathDamageRadius: 3.3, // +0.3 범위
    attackSpeed: 2.8,  // -0.2
  },
  GOBLIN_HUT: {
    hp: 1400,          // +393 HP
    lifetime: 55,      // +15초
    spawnInterval: 5,  // -1초 (더 자주 소환)
  },

  // === 6 코스트 ===
  MANA_COLLECTOR: {
    hp: 4500,          // +1100 HP
    lifetime: 80,      // +20초
    manaProduction: 0.7, // +0.2 마나
    productionInterval: 3.0, // -0.5초 (더 자주 생산)
  },
};

export const GAME_CONFIG = {
  MANA_REGEN_RATE: 0.5,
  MAX_MANA: 20,
  FIELD_WIDTH: 10,
  FIELD_HEIGHT: 18,
  FPS: 30,
};
