import {
  Entity,
  Platform,
  GRAVITY,
  MAX_FALL_SPEED,
  GAME_WIDTH,
  GAME_HEIGHT
} from '../../types/game';

// UI区域高度（底部预留空间）
const UI_BOTTOM = 20;
const GROUND_Y = GAME_HEIGHT - UI_BOTTOM;

// 碰撞检测
export function checkCollision(a: Entity, b: Entity): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// 检测实体与平台的碰撞
export function checkPlatformCollision(
  entity: Entity,
  platform: Platform,
  previousY: number
): { collides: boolean; fromAbove: boolean; fromBelow: boolean } {
  const collides =
    entity.x < platform.x + platform.width &&
    entity.x + entity.width > platform.x &&
    entity.y < platform.y + platform.height &&
    entity.y + entity.height > platform.y;

  if (!collides) {
    return { collides: false, fromAbove: false, fromBelow: false };
  }

  // 检测是否从上方碰撞
  const wasAbove = previousY + entity.height <= platform.y + 2;
  const fromAbove = wasAbove && entity.velocityY >= 0;

  // 检测是否从下方碰撞
  const wasBelow = previousY >= platform.y + platform.height - 2;
  const fromBelow = wasBelow && entity.velocityY < 0;

  return { collides, fromAbove, fromBelow };
}

// 应用重力
export function applyGravity(entity: Entity): void {
  entity.velocityY += GRAVITY;
  if (entity.velocityY > MAX_FALL_SPEED) {
    entity.velocityY = MAX_FALL_SPEED;
  }
}

// 更新实体位置
export function updateEntityPosition(entity: Entity): void {
  entity.x += entity.velocityX;
  entity.y += entity.velocityY;
}

// 屏幕环绕（雪人兄弟特有的机制：左右可以穿越）
export function wrapAroundScreen(entity: Entity): void {
  if (entity.x + entity.width < 0) {
    entity.x = GAME_WIDTH;
  } else if (entity.x > GAME_WIDTH) {
    entity.x = -entity.width;
  }
}

// 限制在屏幕内（上下不能出界）
export function clampToScreen(entity: Entity): void {
  if (entity.y < 0) {
    entity.y = 0;
    entity.velocityY = 0;
  }
  if (entity.y + entity.height > GROUND_Y) {
    entity.y = GROUND_Y - entity.height;
    entity.velocityY = 0;
  }
}

// 处理平台碰撞
export function handlePlatformCollisions(
  entity: Entity,
  platforms: Platform[],
  previousY: number
): boolean {
  let onGround = false;

  for (const platform of platforms) {
    const collision = checkPlatformCollision(entity, platform, previousY);

    if (collision.collides) {
      if (collision.fromAbove) {
        // 从上方落到平台上
        entity.y = platform.y - entity.height;
        entity.velocityY = 0;
        onGround = true;
      } else if (collision.fromBelow && !platform.isOneWay) {
        // 从下方撞到非单向平台
        entity.y = platform.y + platform.height;
        entity.velocityY = 0;
      } else if (!platform.isOneWay) {
        // 水平碰撞
        if (entity.velocityX > 0) {
          entity.x = platform.x - entity.width;
        } else if (entity.velocityX < 0) {
          entity.x = platform.x + platform.width;
        }
        entity.velocityX = 0;
      }
    }
  }

  return onGround;
}

// 检测是否在平台上方（用于下落判断）
export function isAbovePlatform(entity: Entity, platform: Platform): boolean {
  return (
    entity.x < platform.x + platform.width &&
    entity.x + entity.width > platform.x &&
    entity.y + entity.height <= platform.y + 4 &&
    entity.y + entity.height >= platform.y - 4
  );
}

// 获取实体下方的平台
export function getPlatformBelow(entity: Entity, platforms: Platform[]): Platform | null {
  let closestPlatform: Platform | null = null;
  let closestDistance = Infinity;

  for (const platform of platforms) {
    if (
      entity.x < platform.x + platform.width &&
      entity.x + entity.width > platform.x &&
      platform.y > entity.y + entity.height
    ) {
      const distance = platform.y - (entity.y + entity.height);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPlatform = platform;
      }
    }
  }

  return closestPlatform;
}
