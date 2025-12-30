export const UNITS = {
  // === 1 코스트 ===
  SKELETONS: { id: 'skeletons', name: 'Skeletons', cost: 1, hp: 80, damage: 67, speed: 2.0, range: 1, attackSpeed: 1.0, type: 'ground', targets: 'ground', count: 4, rarity: 'normal' },

  // === 2 코스트 ===
  GOBLIN: { id: 'goblin', name: 'Goblins', cost: 2, hp: 140, damage: 100, speed: 2.4, range: 1.0, attackSpeed: 1.1, type: 'ground', targets: 'ground', count: 5, rarity: 'normal' },
  SPEAR_GOBLIN: { id: 'spear_goblin', name: 'Spear Goblin', cost: 0, hp: 110, damage: 50, speed: 2.4, range: 5.0, attackSpeed: 1.3, type: 'ground', targets: 'both', projectile: 'spear', projectileSpeed: 15, rarity: 'normal' },
  RAGE: { id: 'rage', name: 'Rage', cost: 2, type: 'spell', radius: 3.0, duration: 6, speedBuff: 1.35, attackSpeedBuff: 1.35, rarity: 'rare' },
  LOG: { id: 'log', name: 'Log', cost: 2, type: 'spell', damage: 240, knockback: 2.0, width: 2.0, range: 10, speed: 9.6, rarity: 'rare' },

  // === 3 코스트 ===
  KNIGHT: { id: 'knight', name: 'Knight', cost: 3, hp: 1400, damage: 145, speed: 1.0, range: 1, attackSpeed: 1.2, type: 'ground', targets: 'ground', count: 1, shield: 300, rarity: 'normal' },
  ARCHER: { id: 'archer', name: 'Archer', cost: 3, hp: 250, damage: 90, speed: 1.1, range: 5.5, attackSpeed: 1.0, type: 'ground', targets: 'both', count: 2, rarity: 'normal' },
  BOMBER: { id: 'bomber', name: 'Bomber', cost: 3, hp: 300, damage: 200, speed: 1.3, range: 4.5, attackSpeed: 1.8, type: 'ground', targets: 'ground', splash: 2.2, count: 1, concussion: true, rarity: 'rare' },
  KAMIKAZE: { id: 'kamikaze', name: 'Kamikaze', cost: 3, hp: 400, damage: 600, speed: 3.2, range: 0.5, attackSpeed: 0, type: 'ground', targets: 'ground', selfDestruct: true, splash: 2.0, count: 1, rarity: 'rare' },
  CANNON: { id: 'cannon', name: 'Cannon', cost: 3, hp: 700, damage: 120, speed: 0, range: 7.0, attackSpeed: 0.8, type: 'building', targets: 'ground', lifetime: 30, count: 1, projectile: 'cannonball', projectileSpeed: 12, rarity: 'normal' },
  TORNADO: { id: 'tornado', name: 'Tornado', cost: 3, type: 'spell', radius: 3.5, duration: 3, damagePerSecond: 0, pullForce: 4.0, rarity: 'epic' },
  GOBLIN_BARREL: { id: 'goblin_barrel', name: 'Goblin Barrel', cost: 3, type: 'spell', spawnUnit: 'goblin', spawnCount: 3, speed: 15, rarity: 'epic' },

  // === 4 코스트 ===
  VALKYRIE: { id: 'valkyrie', name: 'Valkyrie', cost: 4, hp: 1200, damage: 150, speed: 1.2, range: 1, attackSpeed: 1.5, type: 'ground', targets: 'ground', splash: 1.5, count: 1, rarity: 'rare' },
  HOG_RIDER: { id: 'hog_rider', name: 'Hog Rider', cost: 4, hp: 1250, damage: 240, speed: 1.8, range: 1, attackSpeed: 1.6, type: 'ground', targets: 'ground', favoriteTarget: 'building', count: 1, canCharge: true, rarity: 'rare' },
  BABY_DRAGON: { id: 'baby_dragon', name: 'Baby Dragon', cost: 4, hp: 1000, damage: 130, speed: 1.4, range: 3.5, attackSpeed: 1.5, type: 'flying', targets: 'both', splash: 1.5, count: 1, projectile: 'fireball_small', projectileSpeed: 11, rarity: 'epic' },
  SNIPER: { id: 'sniper', name: 'Sniper', cost: 4, hp: 350, damage: 265, speed: 0.8, range: 7.0, attackSpeed: 2.5, type: 'ground', targets: 'both', count: 1, projectile: 'bullet', projectileSpeed: 25, rarity: 'epic' },
  AIR_DEFENSE: { id: 'air_defense', name: 'Air Defense', cost: 3, hp: 800, damage: 350, speed: 0, range: 7.0, attackSpeed: 1.0, type: 'building', targets: 'air', lifetime: 40, count: 1, rarity: 'rare' },
  FIREBALL: { id: 'fireball', name: 'Fireball', cost: 4, damage: 686, type: 'spell', targets: 'both', radius: 2.5, speed: 15, rarity: 'normal' },
  FREEZE: { id: 'freeze', name: 'Freeze', cost: 4, type: 'spell', radius: 3.0, duration: 5.5, rarity: 'epic' },
  ELECTRO_WIZARD: { id: 'electro_wizard', name: 'Electro Wizard', cost: 4, hp: 800, damage: 120, speed: 1.4, range: 5.0, attackSpeed: 1.7, type: 'ground', targets: 'both', count: 1, stunDuration: 0.8, rarity: 'master' },

  // === 5 코스트 ===
  WIZARD: { id: 'wizard', name: 'Wizard', cost: 5, hp: 600, damage: 200, speed: 1.1, range: 5.5, attackSpeed: 1.4, type: 'ground', targets: 'both', splash: 1.5, count: 1, rarity: 'normal' },
  WITCH: { id: 'witch', name: 'Witch', cost: 5, hp: 700, damage: 100, speed: 1.0, range: 5, attackSpeed: 0.7, type: 'ground', targets: 'both', splash: 1.0, spawnUnit: 'skeletons', spawnInterval: 5, spawnCount: 3, spawnOnDeploy: true, count: 1, rarity: 'epic' },
  BARBARIANS: { id: 'barbarians', name: 'Barbarians', cost: 5, hp: 550, damage: 150, speed: 1.2, range: 1, attackSpeed: 1.4, type: 'ground', targets: 'ground', count: 5, brotherhood: true, rarity: 'rare' },
  BALLOON: { id: 'balloon', name: 'Balloon', cost: 5, hp: 1400, damage: 800, speed: 1.0, range: 1.5, attackSpeed: 3.0, type: 'flying', targets: 'ground', favoriteTarget: 'building', deathDamage: 200, deathDamageRadius: 3.0, count: 1, rarity: 'epic' },
  GIANT: { id: 'giant', name: 'Giant', cost: 5, hp: 4500, damage: 210, speed: 0.7, range: 1.5, attackSpeed: 1.5, type: 'ground', targets: 'ground', count: 1, rarity: 'normal' },

  // === 6+ 코스트 ===
  GOBLIN_HUT: { id: 'goblin_hut', name: 'Goblin Hut', cost: 5, hp: 1200, type: 'building', targets: 'ground', lifetime: 40, spawnUnit: 'goblin', spawnInterval: 8.0, spawnCount: 3, rarity: 'epic' },
  MANA_COLLECTOR: { id: 'mana_collector', name: 'Mana Collector', cost: 6, hp: 1000, type: 'building', lifetime: 70, manaProduction: 1, productionInterval: 8.5, rarity: 'master' },

  // === 1 코스트 스펠 ===
  HEAL: { id: 'heal', name: 'Heal', cost: 1, type: 'spell', radius: 2.5, duration: 2.5, healPerSecond: 150, rarity: 'epic' },

  // Eggs & Towers
  EGG_1: { id: 'egg_1', name: 'Egg (1)', cost: 1, type: 'egg', rarity: 'normal' },
  CHICKEN: { id: 'chicken', name: 'Chicken', cost: 5, hp: 800, type: 'building', targets: 'none', lifetime: 9.1, spawnUnit: 'egg_random', spawnInterval: 3.0, spawnCount: 1, rarity: 'master' },
  KING_TOWER: { id: 'king_tower', name: 'King Tower', hp: 8000, damage: 220, range: 6.5, attackSpeed: 1.5, type: 'building', targets: 'both', rarity: 'normal' },
  SIDE_TOWER: { id: 'side_tower', name: 'Princess Tower', hp: 3200, damage: 65, range: 6.5, attackSpeed: 1.8, type: 'building', targets: 'both', rarity: 'normal' }
};

export const EMOTES = {
  smile: { id: 'smile', name: 'Happy', emoji: '😄', price: 200 },
  angry: { id: 'angry', name: 'Angry', emoji: '😠', price: 200 },
  thumbsup: { id: 'thumbsup', name: 'Thumbs Up', emoji: '👍', price: 200 },
  laugh: { id: 'laugh', name: 'Laugh', emoji: '😂', price: 500 },
  cry: { id: 'cry', name: 'Cry', emoji: '😭', price: 500 },
  wow: { id: 'wow', name: 'Wow', emoji: '😲', price: 500 },
  heart: { id: 'heart', name: 'Love', emoji: '❤️', price: 1000 },
  crown: { id: 'crown', name: 'King', emoji: '👑', price: 1500 }
};

export const BOOSTERS = {
  COIN_BOOST: { id: 'coin_boost', name: 'Coin Booster', cost: 300, matches: 3, desc: 'Next 3 matches: 2x Coin Rewards' },
  EGG_BOOST: { id: 'egg_boost', name: 'Lucky Egg', cost: 500, matches: 5, desc: 'Next 5 matches: Higher Tier units from Eggs' }
};

export const RARITY_WEIGHTS = {
  normal: 60,
  rare: 25,
  epic: 12,
  master: 3
};

export const EVOLVED_STATS = {
  SKELETONS: { hp: 100, damage: 80, count: 6 },
  GOBLIN: { hp: 200, damage: 130, count: 4 },
  RAGE: { radius: 4.0, duration: 8, speedBuff: 1.5, attackSpeedBuff: 1.5 },
  LOG: { damage: 300, width: 2.5, knockback: 3.0 },
  KNIGHT: { hp: 1800, damage: 180, speed: 1.0 },
  ARCHER: { hp: 300, damage: 110, range: 6.0 },
  BOMBER: { hp: 350, damage: 250, splash: 2.0 },
  KAMIKAZE: { hp: 250, damage: 1000, splash: 3.0, speed: 4.0 },
  CANNON: { hp: 900, damage: 150, attackSpeed: 0.7 },
  TORNADO: { radius: 4.0, duration: 4, damagePerSecond: 100, pullForce: 4.5 },
  GOBLIN_BARREL: { spawnCount: 4 },
  VALKYRIE: { hp: 2000, damage: 260, splash: 2.0, speed: 1.28 },
  HOG_RIDER: { hp: 1600, damage: 300, speed: 1.84 },
  BABY_DRAGON: { hp: 1300, damage: 160, splash: 2.0, range: 4.0 },
  SNIPER: { hp: 450, damage: 400, range: 9.0 },
  FIREBALL: { damage: 700, radius: 3.0 },
  FREEZE: { radius: 4.0, duration: 5.0 },
  ELECTRO_WIZARD: { hp: 750, damage: 140, stunDuration: 1.0 },
  GIANT: { hp: 4200, damage: 250 },
  WIZARD: { hp: 750, damage: 280, splash: 2.0, range: 6.0 },
  WITCH: { hp: 850, spawnInterval: 5, spawnCount: 4 },
  BARBARIANS: { hp: 650, damage: 180, count: 6 },
  BALLOON: { hp: 1700, damage: 1000, deathDamage: 400 },
  GOBLIN_HUT: { hp: 1500, lifetime: 50, spawnInterval: 7.0 },
  MANA_COLLECTOR: { hp: 1400, lifetime: 80, manaProduction: 1, productionInterval: 7.0 },
  HEAL: { radius: 3.5, duration: 3, healPerSecond: 200 }
};

export const GAME_CONFIG = {
  MANA_REGEN_RATE: 0.45,
  MAX_MANA: 20,
  FIELD_WIDTH: 10,
  FIELD_HEIGHT: 18,
  MATCH_DURATION: 90,
  OVERTIME_DURATION: 30,
  DOUBLE_ELIXIR_TIME: 30,
  BRIDGE_ZONES: [{ xStart: 1.5, xEnd: 2.5 }, { xStart: 7.5, xEnd: 8.5 }],
  FPS: 30,
};
