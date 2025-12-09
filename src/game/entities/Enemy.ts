import {
  Enemy,
  EnemyState,
  EnemyType,
  Platform,
  Player,
  GAME_HEIGHT
} from '../../types/game';
import {
  applyGravity,
  updateEntityPosition,
  wrapAroundScreen,
  handlePlatformCollisions,
  getPlatformBelow
} from '../systems/physics';

// UI区域高度（底部预留空间）
const UI_BOTTOM = 20;
const GROUND_Y = GAME_HEIGHT - UI_BOTTOM;

let enemyIdCounter = 0;

const ENEMY_CONFIGS = {
  [EnemyType.RED]: {
    width: 14,
    height: 16,
    speed: 0.8,
    health: 1,
    color: '#ff4444',
    jumpForce: -4,
    canJump: false
  },
  [EnemyType.BLUE]: {
    width: 14,
    height: 16,
    speed: 1.0,
    health: 1,
    color: '#4444ff',
    jumpForce: -5,
    canJump: true
  },
  [EnemyType.GREEN]: {
    width: 14,
    height: 16,
    speed: 0.7,
    health: 2,
    color: '#44ff44',
    jumpForce: -4,
    canJump: false
  },
  [EnemyType.BOSS]: {
    width: 32,
    height: 32,
    speed: 0.5,
    health: 10,
    color: '#ff44ff',
    jumpForce: -6,
    canJump: true
  }
};

export function createEnemy(type: EnemyType, x: number, y: number): Enemy {
  const config = ENEMY_CONFIGS[type];
  return {
    id: `enemy_${++enemyIdCounter}`,
    type,
    x,
    y,
    width: config.width,
    height: config.height,
    velocityX: (Math.random() > 0.5 ? 1 : -1) * config.speed,
    velocityY: 0,
    facingRight: Math.random() > 0.5,
    state: EnemyState.IDLE,
    freezeLevel: 0,
    freezeDecayTimer: 0,
    health: config.health,
    aiTimer: Math.random() * 60,
    targetPlatform: null
  };
}

export function updateEnemy(
  enemy: Enemy,
  platforms: Platform[],
  players: Player[],
  deltaTime: number = 1
): void {
  const previousY = enemy.y;
  const config = ENEMY_CONFIGS[enemy.type];

  // 如果是雪球状态，不做AI更新
  if (enemy.state === EnemyState.SNOWBALL || enemy.state === EnemyState.ROLLING) {
    return;
  }

  // 如果是冰冻状态，处理解冻
  if (enemy.freezeLevel > 0) {
    enemy.freezeDecayTimer += deltaTime;
    // Boss解冻更快
    const decayRate = enemy.type === EnemyType.BOSS ? 30 : 60;
    if (enemy.freezeDecayTimer >= decayRate) {
      enemy.freezeDecayTimer = 0;
      enemy.freezeLevel = Math.max(0, enemy.freezeLevel - (enemy.type === EnemyType.BOSS ? 5 : 2));
      updateFreezeState(enemy);
    }

    // 冰冻中减速
    if (enemy.freezeLevel >= 75) {
      enemy.velocityX = 0;
    } else if (enemy.freezeLevel >= 50) {
      enemy.velocityX *= 0.3;
    } else if (enemy.freezeLevel >= 25) {
      enemy.velocityX *= 0.6;
    }
  }

  // AI行为
  if (enemy.state !== EnemyState.DEAD && enemy.freezeLevel < 100) {
    enemy.aiTimer += deltaTime;

    // 寻找最近的玩家
    const nearestPlayer = findNearestPlayer(enemy, players);

    // Boss有特殊AI
    if (enemy.type === EnemyType.BOSS) {
      updateBossAI(enemy, nearestPlayer, platforms, config, deltaTime);
    } else if (enemy.aiTimer >= 30) {
      enemy.aiTimer = 0;

      // 随机改变方向或追踪玩家
      if (nearestPlayer && Math.random() > 0.3) {
        // 追踪玩家
        if (nearestPlayer.x < enemy.x) {
          enemy.velocityX = -config.speed;
          enemy.facingRight = false;
        } else {
          enemy.velocityX = config.speed;
          enemy.facingRight = true;
        }

        // 如果玩家在上方且可以跳跃，尝试跳跃
        if (config.canJump && nearestPlayer.y < enemy.y - 20 && Math.random() > 0.5) {
          const platformBelow = getPlatformBelow(enemy, platforms);
          if (platformBelow || enemy.y >= GROUND_Y - 20) {
            // 跳跃
            enemy.velocityY = config.jumpForce;
            enemy.state = EnemyState.JUMPING;
          }
        }
      } else {
        // 随机行为
        const rand = Math.random();
        if (rand < 0.3) {
          enemy.velocityX = -config.speed;
          enemy.facingRight = false;
        } else if (rand < 0.6) {
          enemy.velocityX = config.speed;
          enemy.facingRight = true;
        } else if (rand < 0.8 && config.canJump) {
          enemy.velocityY = config.jumpForce;
          enemy.state = EnemyState.JUMPING;
        }
      }
    }
  }

  // 应用重力
  applyGravity(enemy);

  // 更新位置
  updateEntityPosition(enemy);

  // 处理平台碰撞
  const onGround = handlePlatformCollisions(enemy, platforms, previousY);

  // 更新状态
  if (onGround && enemy.state !== EnemyState.DEAD && enemy.freezeLevel < 100) {
    enemy.state = enemy.velocityX !== 0 ? EnemyState.WALKING : EnemyState.IDLE;
  }

  // 屏幕环绕
  wrapAroundScreen(enemy);

  // 防止敌人掉出屏幕底部
  if (enemy.y > GROUND_Y - enemy.height) {
    enemy.y = GROUND_Y - enemy.height;
    enemy.velocityY = 0;
  }
}

export function freezeEnemy(enemy: Enemy, amount: number): void {
  if (enemy.state === EnemyState.SNOWBALL || enemy.state === EnemyState.ROLLING) {
    return;
  }

  enemy.freezeLevel = Math.min(100, enemy.freezeLevel + amount);
  enemy.freezeDecayTimer = 0;
  updateFreezeState(enemy);
}

function updateFreezeState(enemy: Enemy): void {
  if (enemy.freezeLevel >= 100) {
    enemy.state = EnemyState.SNOWBALL;
    enemy.velocityX = 0;
  } else if (enemy.freezeLevel >= 75) {
    enemy.state = EnemyState.FROZEN_4;
  } else if (enemy.freezeLevel >= 50) {
    enemy.state = EnemyState.FROZEN_3;
  } else if (enemy.freezeLevel >= 25) {
    enemy.state = EnemyState.FROZEN_2;
  } else if (enemy.freezeLevel > 0) {
    enemy.state = EnemyState.FROZEN_1;
  }
}

export function pushSnowball(enemy: Enemy, direction: number): void {
  if (enemy.state === EnemyState.SNOWBALL) {
    enemy.state = EnemyState.ROLLING;
    enemy.velocityX = direction * 4; // 滚动速度
    enemy.aiTimer = 0; // 重置计时器用于追踪滚动时间
  }
}

export function updateRollingSnowball(
  enemy: Enemy,
  platforms: Platform[],
  deltaTime: number = 1
): boolean {
  if (enemy.state !== EnemyState.ROLLING) {
    return false;
  }

  const previousY = enemy.y;

  // 应用重力
  applyGravity(enemy);

  // 更新位置
  updateEntityPosition(enemy);

  // 处理平台碰撞
  const onGround = handlePlatformCollisions(enemy, platforms, previousY);

  // 屏幕环绕 - 雪球穿过屏幕边缘后消灭
  if (enemy.x < -enemy.width * 2 || enemy.x > 256 + enemy.width) {
    enemy.state = EnemyState.DEAD;
    return true;
  }

  // 碰到底部消灭
  if (enemy.y > GROUND_Y) {
    enemy.state = EnemyState.DEAD;
    return true;
  }

  // 滚动一段时间后如果没有撞到任何东西，自动消灭
  // 通过检测是否在地面上滚动了足够远
  if (onGround) {
    enemy.aiTimer += deltaTime;
    if (enemy.aiTimer > 300) { // 5秒后消失
      enemy.state = EnemyState.DEAD;
      return true;
    }
  }

  return false;
}

// Boss专用AI - 更加积极地追踪玩家，会跳跃砸地
function updateBossAI(
  enemy: Enemy,
  nearestPlayer: Player | null,
  platforms: Platform[],
  config: typeof ENEMY_CONFIGS[EnemyType.BOSS],
  deltaTime: number
): void {
  // Boss每20帧更新一次AI
  if (enemy.aiTimer < 20) return;
  enemy.aiTimer = 0;

  if (!nearestPlayer) {
    // 没有玩家就随机移动
    enemy.velocityX = (Math.random() > 0.5 ? 1 : -1) * config.speed;
    enemy.facingRight = enemy.velocityX > 0;
    return;
  }

  const distX = Math.abs(nearestPlayer.x - enemy.x);
  const distY = nearestPlayer.y - enemy.y;

  // 总是追踪玩家
  if (nearestPlayer.x < enemy.x - 10) {
    enemy.velocityX = -config.speed * 1.5; // Boss移动稍快
    enemy.facingRight = false;
  } else if (nearestPlayer.x > enemy.x + 10) {
    enemy.velocityX = config.speed * 1.5;
    enemy.facingRight = true;
  } else {
    enemy.velocityX = 0;
  }

  // Boss跳跃逻辑
  // 1. 如果玩家在上方，跳跃追击
  // 2. 如果玩家很近，跳跃砸地攻击
  const shouldJump =
    (distY < -30 && Math.random() > 0.3) || // 玩家在上方
    (distX < 50 && distY > -20 && Math.random() > 0.6); // 玩家很近，跳跃攻击

  if (shouldJump && enemy.velocityY === 0) {
    enemy.velocityY = config.jumpForce * 1.2; // Boss跳得更高
    enemy.state = EnemyState.JUMPING;
  }
}

function findNearestPlayer(enemy: Enemy, players: Player[]): Player | null {
  let nearest: Player | null = null;
  let nearestDist = Infinity;

  for (const player of players) {
    if (player.state !== 'dead' && player.lives > 0) {
      const dist = Math.abs(player.x - enemy.x) + Math.abs(player.y - enemy.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = player;
      }
    }
  }

  return nearest;
}

export function killEnemy(enemy: Enemy): number {
  enemy.state = EnemyState.DEAD;
  enemy.velocityY = -3;

  // 返回分数
  const baseScore = {
    [EnemyType.RED]: 500,
    [EnemyType.BLUE]: 800,
    [EnemyType.GREEN]: 1000,
    [EnemyType.BOSS]: 5000
  };

  return baseScore[enemy.type];
}
