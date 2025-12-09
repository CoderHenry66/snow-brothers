import { PowerUp, PowerUpType, Player, GAME_HEIGHT } from '../../types/game';
import { applyGravity, updateEntityPosition, wrapAroundScreen } from '../systems/physics';

// UI区域高度（底部预留空间）
const UI_BOTTOM = 20;
const GROUND_Y = GAME_HEIGHT - UI_BOTTOM;

let powerUpIdCounter = 0;

const POWERUP_CONFIGS = {
  [PowerUpType.POTION_RED]: {
    color: '#ff4444',
    width: 12,
    height: 12,
    score: 200
  },
  [PowerUpType.POTION_BLUE]: {
    color: '#4444ff',
    width: 12,
    height: 12,
    score: 200
  },
  [PowerUpType.POTION_YELLOW]: {
    color: '#ffff44',
    width: 12,
    height: 12,
    score: 200
  },
  [PowerUpType.SUSHI]: {
    color: '#ff8844',
    width: 14,
    height: 10,
    score: 1000
  },
  [PowerUpType.MONEY_BAG]: {
    color: '#ffcc00',
    width: 12,
    height: 14,
    score: 5000
  },
  [PowerUpType.EXTRA_LIFE]: {
    color: '#ff69b4',
    width: 14,
    height: 14,
    score: 1000
  }
};

export function createPowerUp(type: PowerUpType, x: number, y: number): PowerUp {
  const config = POWERUP_CONFIGS[type];
  return {
    id: `powerup_${++powerUpIdCounter}`,
    type,
    x,
    y,
    width: config.width,
    height: config.height,
    velocityX: (Math.random() - 0.5) * 2,
    velocityY: -3,
    facingRight: true,
    lifetime: 600 // 10秒后消失
  };
}

export function updatePowerUp(powerUp: PowerUp, deltaTime: number = 1): boolean {
  powerUp.lifetime -= deltaTime;

  if (powerUp.lifetime <= 0) {
    return true; // 需要移除
  }

  // 应用重力
  applyGravity(powerUp);

  // 减速
  powerUp.velocityX *= 0.98;

  // 更新位置
  updateEntityPosition(powerUp);

  // 屏幕环绕
  wrapAroundScreen(powerUp);

  // 地面碰撞
  if (powerUp.y > GROUND_Y - powerUp.height - 8) {
    powerUp.y = GROUND_Y - powerUp.height - 8;
    powerUp.velocityY = 0;
  }

  return false;
}

// 玩家增益状态（用于跟踪药水效果）
export interface PlayerBuffs {
  speedBoost: number;      // 速度加成计时器
  attackBoost: number;     // 攻击加成计时器
}

export function applyPowerUp(powerUp: PowerUp, player: Player): number {
  const config = POWERUP_CONFIGS[powerUp.type];

  switch (powerUp.type) {
    case PowerUpType.POTION_RED:
      // 红色药水：子弹变长、变大、可穿透，持续10秒
      player.speedBoostTimer = 600; // 10秒
      break;
    case PowerUpType.POTION_BLUE:
      // 蓝色药水：子弹威力加倍（2次冰冻），持续10秒
      player.powerBoostTimer = 600; // 10秒
      break;
    case PowerUpType.POTION_YELLOW:
      // 黄色药水：无敌 8秒
      player.invincible = true;
      player.invincibleTimer = 480; // 8秒
      break;
    case PowerUpType.EXTRA_LIFE:
      player.lives++;
      break;
    default:
      break;
  }

  return config.score;
}

export function getRandomPowerUp(): PowerUpType {
  const types = Object.values(PowerUpType);
  // 调整权重：更多药水，更多好东西
  const weights = [25, 25, 20, 15, 10, 5]; // 红药水、蓝药水、黄药水、寿司、钱袋、加命
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < types.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return types[i];
    }
  }

  return PowerUpType.SUSHI;
}
