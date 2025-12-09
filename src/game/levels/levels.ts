import { Level, EnemyType, GAME_WIDTH, GAME_HEIGHT } from '../../types/game';

// UI区域高度（底部预留空间）
const UI_BOTTOM = 20;
const GROUND_Y = GAME_HEIGHT - UI_BOTTOM;

// 关卡1 - 简单入门
export const level1: Level = {
  id: 1,
  name: 'ROUND 1',
  backgroundColor: '#1a1a2e',
  platforms: [
    // 地面
    { x: 0, y: GROUND_Y - 8, width: GAME_WIDTH, height: 8, isOneWay: false },

    // 第一层平台
    { x: 16, y: GROUND_Y - 48, width: 72, height: 8, isOneWay: true },
    { x: GAME_WIDTH - 88, y: GROUND_Y - 48, width: 72, height: 8, isOneWay: true },

    // 第二层平台
    { x: GAME_WIDTH / 2 - 40, y: GROUND_Y - 88, width: 80, height: 8, isOneWay: true },

    // 第三层平台
    { x: 24, y: GROUND_Y - 128, width: 64, height: 8, isOneWay: true },
    { x: GAME_WIDTH - 88, y: GROUND_Y - 128, width: 64, height: 8, isOneWay: true },

    // 顶层平台
    { x: GAME_WIDTH / 2 - 48, y: GROUND_Y - 168, width: 96, height: 8, isOneWay: true },
  ],
  spawnPoints: [
    { x: 32, y: GROUND_Y - 64 },
    { x: GAME_WIDTH - 48, y: GROUND_Y - 64 },
    { x: GAME_WIDTH / 2, y: GROUND_Y - 104 },
    { x: 40, y: GROUND_Y - 144 },
    { x: GAME_WIDTH - 56, y: GROUND_Y - 144 },
    { x: GAME_WIDTH / 2, y: GROUND_Y - 184 }
  ],
  playerSpawns: [
    { x: 32, y: GROUND_Y - 32 },
    { x: GAME_WIDTH - 48, y: GROUND_Y - 32 }
  ],
  enemies: [
    { type: EnemyType.RED, spawnIndex: 0 },
    { type: EnemyType.RED, spawnIndex: 1 },
    { type: EnemyType.RED, spawnIndex: 2 },
    { type: EnemyType.RED, spawnIndex: 3 },
    { type: EnemyType.RED, spawnIndex: 4 }
  ]
};

// 关卡2 - 增加蓝色敌人（会跳跃）
export const level2: Level = {
  id: 2,
  name: 'ROUND 2',
  backgroundColor: '#162447',
  platforms: [
    // 地面
    { x: 0, y: GROUND_Y - 8, width: GAME_WIDTH, height: 8, isOneWay: false },

    // 左右墙壁平台
    { x: 0, y: GROUND_Y - 56, width: 48, height: 8, isOneWay: true },
    { x: GAME_WIDTH - 48, y: GROUND_Y - 56, width: 48, height: 8, isOneWay: true },

    // 中间下层
    { x: 72, y: GROUND_Y - 56, width: 112, height: 8, isOneWay: true },

    // 左右中层
    { x: 16, y: GROUND_Y - 104, width: 56, height: 8, isOneWay: true },
    { x: GAME_WIDTH - 72, y: GROUND_Y - 104, width: 56, height: 8, isOneWay: true },

    // 中间中层
    { x: GAME_WIDTH / 2 - 32, y: GROUND_Y - 104, width: 64, height: 8, isOneWay: true },

    // 上层平台
    { x: 56, y: GROUND_Y - 144, width: 48, height: 8, isOneWay: true },
    { x: GAME_WIDTH - 104, y: GROUND_Y - 144, width: 48, height: 8, isOneWay: true },

    // 顶层
    { x: GAME_WIDTH / 2 - 40, y: GROUND_Y - 180, width: 80, height: 8, isOneWay: true },
  ],
  spawnPoints: [
    { x: 24, y: GROUND_Y - 72 },
    { x: GAME_WIDTH - 40, y: GROUND_Y - 72 },
    { x: GAME_WIDTH / 2, y: GROUND_Y - 72 },
    { x: 32, y: GROUND_Y - 120 },
    { x: GAME_WIDTH - 48, y: GROUND_Y - 120 },
    { x: 72, y: GROUND_Y - 160 },
    { x: GAME_WIDTH - 88, y: GROUND_Y - 160 },
    { x: GAME_WIDTH / 2, y: GROUND_Y - 196 }
  ],
  playerSpawns: [
    { x: 32, y: GROUND_Y - 32 },
    { x: GAME_WIDTH - 48, y: GROUND_Y - 32 }
  ],
  enemies: [
    { type: EnemyType.RED, spawnIndex: 0 },
    { type: EnemyType.RED, spawnIndex: 1 },
    { type: EnemyType.BLUE, spawnIndex: 2 },
    { type: EnemyType.BLUE, spawnIndex: 3 },
    { type: EnemyType.RED, spawnIndex: 4 },
    { type: EnemyType.BLUE, spawnIndex: 5 }
  ]
};

// 关卡3 - Boss关！
export const level3: Level = {
  id: 3,
  name: 'BOSS STAGE',
  backgroundColor: '#2a0a3a', // 紫色调背景，Boss关氛围
  platforms: [
    // 地面 - 加宽给Boss空间
    { x: 0, y: GROUND_Y - 8, width: GAME_WIDTH, height: 8, isOneWay: false },

    // 底层阶梯 - 玩家躲避用
    { x: 16, y: GROUND_Y - 48, width: 48, height: 8, isOneWay: true },
    { x: GAME_WIDTH - 64, y: GROUND_Y - 48, width: 48, height: 8, isOneWay: true },

    // 中层平台
    { x: 0, y: GROUND_Y - 88, width: 64, height: 8, isOneWay: true },
    { x: GAME_WIDTH - 64, y: GROUND_Y - 88, width: 64, height: 8, isOneWay: true },
    { x: GAME_WIDTH / 2 - 40, y: GROUND_Y - 96, width: 80, height: 8, isOneWay: true },

    // 上层平台 - 高处安全点
    { x: 32, y: GROUND_Y - 136, width: 56, height: 8, isOneWay: true },
    { x: GAME_WIDTH - 88, y: GROUND_Y - 136, width: 56, height: 8, isOneWay: true },

    // 顶层
    { x: GAME_WIDTH / 2 - 48, y: GROUND_Y - 170, width: 96, height: 8, isOneWay: true },
  ],
  spawnPoints: [
    // 小兵出生点
    { x: 32, y: GROUND_Y - 64 },
    { x: GAME_WIDTH - 48, y: GROUND_Y - 64 },
    { x: 16, y: GROUND_Y - 104 },
    { x: GAME_WIDTH - 32, y: GROUND_Y - 104 },
    // Boss出生点 (顶层中央)
    { x: GAME_WIDTH / 2 - 16, y: GROUND_Y - 200 }
  ],
  playerSpawns: [
    { x: 32, y: GROUND_Y - 32 },
    { x: GAME_WIDTH - 48, y: GROUND_Y - 32 }
  ],
  enemies: [
    // 先出几个小兵
    { type: EnemyType.RED, spawnIndex: 0 },
    { type: EnemyType.BLUE, spawnIndex: 1 },
    { type: EnemyType.GREEN, spawnIndex: 2 },
    { type: EnemyType.BLUE, spawnIndex: 3 },
    // Boss登场！
    { type: EnemyType.BOSS, spawnIndex: 4 }
  ]
};

export const LEVELS: Level[] = [level1, level2, level3];

export function getLevel(levelNumber: number): Level | null {
  const index = levelNumber - 1;
  if (index >= 0 && index < LEVELS.length) {
    return LEVELS[index];
  }
  return null;
}
