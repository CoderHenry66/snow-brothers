import { SnowAttack, Player, Enemy, GAME_WIDTH } from '../../types/game';
import { checkCollision } from '../systems/physics';
import { freezeEnemy } from './Enemy';

let attackIdCounter = 0;

export function createSnowAttack(player: Player): SnowAttack {
  const direction = player.facingRight ? 1 : -1;

  // 检查玩家是否有增益效果
  const hasSpeedBoost = player.speedBoostTimer > 0;  // 红药水：子弹变长
  const hasPowerBoost = player.powerBoostTimer > 0;  // 蓝药水：威力加倍

  // 增强子弹更大、飞得更远
  const baseWidth = hasSpeedBoost ? 16 : 8;
  const baseHeight = hasSpeedBoost ? 10 : 8;
  const baseSpeed = hasSpeedBoost ? 4.5 : 3.5;
  const baseLifetime = hasSpeedBoost ? 60 : 45;

  // 威力：普通25%，强化50%（2次冰冻）
  const power = hasPowerBoost ? 50 : 25;

  return {
    id: `snow_${++attackIdCounter}`,
    playerId: player.id,
    x: player.x + (player.facingRight ? player.width : -baseWidth),
    y: player.y + 2,
    width: baseWidth,
    height: baseHeight,
    velocityX: direction * baseSpeed,
    velocityY: -1.5,
    facingRight: player.facingRight,
    lifetime: baseLifetime,
    power: power,
    isEnhanced: hasSpeedBoost
  };
}

const SNOW_GRAVITY = 0.12;

export function updateSnowAttack(attack: SnowAttack, deltaTime: number = 1): boolean {
  // 应用重力
  attack.velocityY += SNOW_GRAVITY * deltaTime;

  // 更新位置
  attack.x += attack.velocityX * deltaTime;
  attack.y += attack.velocityY * deltaTime;

  attack.lifetime -= deltaTime;

  // 检查是否超出屏幕或生命周期结束
  if (attack.lifetime <= 0 || attack.x < -20 || attack.x > GAME_WIDTH + 20 || attack.y > 224) {
    return true;
  }

  return false;
}

export function checkSnowAttackCollisions(
  attacks: SnowAttack[],
  enemies: Enemy[]
): SnowAttack[] {
  const toRemove: SnowAttack[] = [];

  for (const attack of attacks) {
    let attackHit = false;
    for (const enemy of enemies) {
      // 跳过死亡、滚动中、已经是雪球的敌人
      if (enemy.state === 'dead' || enemy.state === 'rolling' || enemy.state === 'snowball') continue;

      if (checkCollision(attack, enemy)) {
        // 冰冻敌人，使用子弹的威力值
        freezeEnemy(enemy, attack.power);
        attackHit = true;

        // 增强子弹可以穿透继续打其他敌人
        if (!attack.isEnhanced) {
          break;
        }
      }
    }
    if (attackHit && !attack.isEnhanced) {
      toRemove.push(attack);
    }
  }

  return toRemove;
}
