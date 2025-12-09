import {
  Player,
  PlayerState,
  InputState,
  Platform,
  PLAYER_SPEED,
  PLAYER_JUMP_FORCE,
  GAME_HEIGHT
} from '../../types/game';
import {
  applyGravity,
  updateEntityPosition,
  wrapAroundScreen,
  handlePlatformCollisions
} from '../systems/physics';

// UI区域高度（底部预留空间）
const UI_BOTTOM = 20;
const GROUND_Y = GAME_HEIGHT - UI_BOTTOM;

let playerIdCounter = 0;

export function createPlayer(playerNumber: 1 | 2, x: number, y: number): Player {
  return {
    id: `player_${playerNumber}_${++playerIdCounter}`,
    playerNumber,
    x,
    y,
    width: 14,
    height: 16,
    velocityX: 0,
    velocityY: 0,
    facingRight: playerNumber === 1,
    state: PlayerState.IDLE,
    lives: 3,
    score: 0,
    isAttacking: false,
    attackCooldown: 0,
    invincible: false,
    invincibleTimer: 0,
    onGround: false,
    color: playerNumber === 1 ? '#4488ff' : '#44ff88', // 蓝色和绿色
    speedBoostTimer: 0,
    powerBoostTimer: 0
  };
}

export function updatePlayer(
  player: Player,
  input: InputState,
  platforms: Platform[],
  deltaTime: number = 1
): void {
  const previousY = player.y;

  // 更新无敌时间
  if (player.invincible) {
    player.invincibleTimer -= deltaTime;
    if (player.invincibleTimer <= 0) {
      player.invincible = false;
    }
  }

  // 更新药水增益时间
  if (player.speedBoostTimer > 0) {
    player.speedBoostTimer -= deltaTime;
  }
  if (player.powerBoostTimer > 0) {
    player.powerBoostTimer -= deltaTime;
  }

  // 更新攻击冷却
  if (player.attackCooldown > 0) {
    player.attackCooldown -= deltaTime;
  }

  // 处于死亡状态时不响应输入
  if (player.state === PlayerState.DEAD) {
    applyGravity(player);
    updateEntityPosition(player);
    return;
  }

  // 处理水平移动
  if (input.left && !input.right) {
    player.velocityX = -PLAYER_SPEED;
    player.facingRight = false;
    if (player.onGround && !player.isAttacking) {
      player.state = PlayerState.WALKING;
    }
  } else if (input.right && !input.left) {
    player.velocityX = PLAYER_SPEED;
    player.facingRight = true;
    if (player.onGround && !player.isAttacking) {
      player.state = PlayerState.WALKING;
    }
  } else {
    player.velocityX = 0;
    if (player.onGround && !player.isAttacking) {
      player.state = PlayerState.IDLE;
    }
  }

  // 处理跳跃
  if (input.jump && player.onGround) {
    player.velocityY = PLAYER_JUMP_FORCE;
    player.onGround = false;
    player.state = PlayerState.JUMPING;
  }

  // 处理攻击
  if (input.attack && player.attackCooldown <= 0 && !player.isAttacking) {
    player.isAttacking = true;
    player.attackCooldown = 15; // 冷却时间
    player.state = PlayerState.ATTACKING;
    // 攻击动画持续时间
    setTimeout(() => {
      player.isAttacking = false;
      if (player.state === PlayerState.ATTACKING) {
        player.state = player.onGround ? PlayerState.IDLE : PlayerState.FALLING;
      }
    }, 200);
  }

  // 应用重力
  applyGravity(player);

  // 更新位置
  updateEntityPosition(player);

  // 处理平台碰撞
  player.onGround = handlePlatformCollisions(player, platforms, previousY);

  // 更新状态
  if (!player.onGround) {
    if (player.velocityY < 0) {
      if (!player.isAttacking) player.state = PlayerState.JUMPING;
    } else {
      if (!player.isAttacking) player.state = PlayerState.FALLING;
    }
  }

  // 屏幕环绕
  wrapAroundScreen(player);

  // 如果掉落到屏幕底部，死亡
  if (player.y > GROUND_Y) {
    playerDie(player);
  }
}

export function playerDie(player: Player): void {
  player.state = PlayerState.DEAD;
  player.lives--;
  player.velocityX = 0;
  player.velocityY = -3;
}

export function respawnPlayer(player: Player, spawnX: number, spawnY: number): void {
  player.x = spawnX;
  player.y = spawnY;
  player.velocityX = 0;
  player.velocityY = 0;
  player.state = PlayerState.IDLE;
  player.invincible = true;
  player.invincibleTimer = 180; // 3秒无敌
  player.onGround = false;
  player.isAttacking = false;
}

export function addScore(player: Player, points: number): void {
  player.score += points;
  // 每10000分加一条命
  if (Math.floor(player.score / 10000) > Math.floor((player.score - points) / 10000)) {
    player.lives++;
  }
}
