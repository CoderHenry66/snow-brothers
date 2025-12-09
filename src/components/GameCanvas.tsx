import React, { useRef, useEffect, useCallback } from 'react';
import {
  GameState,
  Level,
  Player,
  Enemy,
  SnowAttack,
  PowerUp,
  EnemyState,
  PlayerState,
  GAME_WIDTH,
  GAME_HEIGHT,
  SCALE
} from '../types/game';
import { spriteCache } from '../game/sprites/SpriteGenerator';

interface GameCanvasProps {
  gameState: GameState;
  level: Level | null;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, level }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgPatternRef = useRef<CanvasPattern | null>(null);

  // 初始化背景图案
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bgSprite = spriteCache.getBackgroundPattern();
    bgPatternRef.current = ctx.createPattern(bgSprite, 'repeat');
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 关闭抗锯齿以保持像素感
    ctx.imageSmoothingEnabled = false;

    // 清屏并绘制背景
    if (bgPatternRef.current) {
      ctx.save();
      ctx.scale(SCALE, SCALE);
      ctx.fillStyle = bgPatternRef.current;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.restore();
    } else {
      ctx.fillStyle = level?.backgroundColor || '#4080C0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 缩放
    ctx.save();
    ctx.scale(SCALE, SCALE);

    // 绘制平台
    if (level) {
      drawPlatforms(ctx, level);
    }

    // 绘制道具
    for (const powerUp of gameState.powerUps) {
      drawPowerUp(ctx, powerUp);
    }

    // 绘制敌人
    for (const enemy of gameState.enemies) {
      drawEnemy(ctx, enemy);
    }

    // 绘制雪花攻击
    for (const attack of gameState.snowAttacks) {
      drawSnowAttack(ctx, attack);
    }

    // 绘制玩家
    for (const player of gameState.players) {
      drawPlayer(ctx, player);
    }

    ctx.restore();

    // 绘制UI（不缩放）
    drawUI(ctx, gameState, level);
  }, [gameState, level]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      width={GAME_WIDTH * SCALE}
      height={GAME_HEIGHT * SCALE}
      style={{
        imageRendering: 'pixelated',
        border: '4px solid #444',
        borderRadius: '8px'
      }}
    />
  );
};

function drawPlatforms(ctx: CanvasRenderingContext2D, level: Level): void {
  const brickTile = spriteCache.getBrickTile();
  const oneWayTile = spriteCache.getOneWayPlatformTile();

  for (const platform of level.platforms) {
    const tile = platform.isOneWay ? oneWayTile : brickTile;
    const tileWidth = 8;
    const tileHeight = 8;

    // 平铺绘制
    for (let x = 0; x < platform.width; x += tileWidth) {
      for (let y = 0; y < platform.height; y += tileHeight) {
        const drawWidth = Math.min(tileWidth, platform.width - x);
        const drawHeight = Math.min(tileHeight, platform.height - y);

        ctx.drawImage(
          tile,
          0, 0, drawWidth, drawHeight,
          platform.x + x, platform.y + y, drawWidth, drawHeight
        );
      }
    }
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player): void {
  // 无敌闪烁效果
  if (player.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
    return;
  }

  // 死亡状态
  if (player.state === PlayerState.DEAD) {
    ctx.globalAlpha = 0.5;
  }

  // 根据状态选择帧
  let frame: 'idle' | 'walk1' | 'walk2' | 'jump' | 'attack' = 'idle';
  if (player.isAttacking) {
    frame = 'attack';
  } else if (player.state === PlayerState.JUMPING || player.state === PlayerState.FALLING) {
    frame = 'jump';
  } else if (player.state === PlayerState.WALKING) {
    // 走路动画：根据时间切换帧
    frame = Math.floor(Date.now() / 150) % 2 === 0 ? 'walk1' : 'walk2';
  }

  const sprite = spriteCache.getPlayerSprite(player.playerNumber, frame);

  // 水平翻转
  ctx.save();
  if (!player.facingRight) {
    ctx.translate(player.x + player.width, player.y);
    ctx.scale(-1, 1);
    ctx.drawImage(sprite, 0, 0);
  } else {
    ctx.drawImage(sprite, player.x, player.y);
  }
  ctx.restore();

  ctx.globalAlpha = 1;

  // 增益效果显示
  if (player.speedBoostTimer > 0 || player.powerBoostTimer > 0) {
    // 绘制光环效果
    ctx.strokeStyle = player.speedBoostTimer > 0 ? '#FF4444' : '#4444FF';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.3;
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
  // 死亡状态
  if (enemy.state === EnemyState.DEAD) {
    ctx.globalAlpha = 0.5;
  }

  // 根据状态选择帧
  let frame: 'idle' | 'walk' | 'frozen' | 'snowball' = 'idle';
  if (enemy.state === EnemyState.SNOWBALL || enemy.state === EnemyState.ROLLING) {
    frame = 'snowball';
  } else if (enemy.freezeLevel >= 50) {
    frame = 'frozen';
  } else if (enemy.state === EnemyState.WALKING) {
    frame = Math.floor(Date.now() / 200) % 2 === 0 ? 'idle' : 'walk';
  }

  const sprite = spriteCache.getEnemySprite(enemy.type, frame);

  // 雪球状态下有滚动动画
  if (enemy.state === EnemyState.ROLLING) {
    ctx.save();
    ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
    ctx.rotate((Date.now() / 100) % (Math.PI * 2));
    ctx.drawImage(sprite, -enemy.width / 2, -enemy.height / 2);
    ctx.restore();
  } else {
    // 水平翻转
    ctx.save();
    if (!enemy.facingRight) {
      ctx.translate(enemy.x + enemy.width, enemy.y);
      ctx.scale(-1, 1);
      ctx.drawImage(sprite, 0, 0);
    } else {
      ctx.drawImage(sprite, enemy.x, enemy.y);
    }
    ctx.restore();
  }

  // 冰冻进度条
  if (enemy.freezeLevel > 0 && enemy.freezeLevel < 100 && enemy.state !== EnemyState.SNOWBALL) {
    const barWidth = 12;
    const barHeight = 2;
    const barX = enemy.x + (enemy.width - barWidth) / 2;
    const barY = enemy.y - 4;

    // 背景
    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // 冰冻量
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(barX, barY, (barWidth * enemy.freezeLevel) / 100, barHeight);
  }

  ctx.globalAlpha = 1;
}

function drawSnowAttack(ctx: CanvasRenderingContext2D, attack: SnowAttack): void {
  const sprite = spriteCache.getSnowAttackSprite(attack.isEnhanced);

  // 旋转动画
  ctx.save();
  ctx.translate(attack.x + attack.width / 2, attack.y + attack.height / 2);
  ctx.rotate((Date.now() / 50) % (Math.PI * 2));
  ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
  ctx.restore();

  // 威力加倍效果
  if (attack.power >= 50) {
    ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(attack.x + attack.width / 2, attack.y + attack.height / 2, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPowerUp(ctx: CanvasRenderingContext2D, powerUp: PowerUp): void {
  // 闪烁效果（快消失时）
  if (powerUp.lifetime < 180 && Math.floor(Date.now() / 200) % 2 === 0) {
    return;
  }

  const sprite = spriteCache.getPowerUpSprite(powerUp.type);

  // 上下浮动效果
  const floatOffset = Math.sin(Date.now() / 300) * 2;

  ctx.drawImage(sprite, powerUp.x, powerUp.y + floatOffset);

  // 闪光效果
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2 + floatOffset, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawUI(ctx: CanvasRenderingContext2D, gameState: GameState, level: Level | null): void {
  const fontSize = 14;
  ctx.font = `bold ${fontSize}px "Press Start 2P", monospace`;

  // 顶部黑色区域
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, GAME_WIDTH * SCALE, 30);

  // 关卡信息
  if (level) {
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`ROUND ${gameState.currentLevel}`, (GAME_WIDTH * SCALE) / 2, 20);
  }

  // 玩家信息
  ctx.textAlign = 'left';
  for (let i = 0; i < gameState.players.length; i++) {
    const player = gameState.players[i];
    const baseX = i === 0 ? 10 : GAME_WIDTH * SCALE - 180;

    // 玩家编号
    ctx.fillStyle = player.playerNumber === 1 ? '#4488ff' : '#44ff88';
    ctx.fillText(`${player.playerNumber}P`, baseX, 20);

    // 分数
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 12px "Press Start 2P", monospace`;
    ctx.fillText(player.score.toString().padStart(7, '0'), baseX + 30, 20);
  }

  // 底部UI
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, GAME_HEIGHT * SCALE - 35, GAME_WIDTH * SCALE, 35);

  // 生命显示
  ctx.font = `bold ${fontSize}px "Press Start 2P", monospace`;
  for (let i = 0; i < gameState.players.length; i++) {
    const player = gameState.players[i];
    const baseX = i === 0 ? 10 : GAME_WIDTH * SCALE - 100;

    ctx.fillStyle = player.playerNumber === 1 ? '#4488ff' : '#44ff88';
    ctx.fillText(`${player.playerNumber}P`, baseX, GAME_HEIGHT * SCALE - 15);

    // 生命图标
    ctx.fillStyle = '#ff6666';
    for (let life = 0; life < Math.min(player.lives, 5); life++) {
      ctx.fillText('♥', baseX + 35 + life * 14, GAME_HEIGHT * SCALE - 15);
    }
  }

  // 连击显示
  if (gameState.combo > 1) {
    ctx.fillStyle = '#ffff00';
    ctx.textAlign = 'center';
    ctx.font = `bold 20px "Press Start 2P", monospace`;
    ctx.fillText(`${gameState.combo} COMBO!`, (GAME_WIDTH * SCALE) / 2, GAME_HEIGHT * SCALE / 2);
  }

  // 游戏状态提示
  ctx.textAlign = 'center';
  if (gameState.status === 'paused') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, GAME_WIDTH * SCALE, GAME_HEIGHT * SCALE);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 24px "Press Start 2P", monospace`;
    ctx.fillText('PAUSED', (GAME_WIDTH * SCALE) / 2, (GAME_HEIGHT * SCALE) / 2);
  } else if (gameState.status === 'gameover') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, GAME_WIDTH * SCALE, GAME_HEIGHT * SCALE);
    ctx.fillStyle = '#ff4444';
    ctx.font = `bold 24px "Press Start 2P", monospace`;
    ctx.fillText('GAME OVER', (GAME_WIDTH * SCALE) / 2, (GAME_HEIGHT * SCALE) / 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 12px "Press Start 2P", monospace`;
    ctx.fillText('Press ENTER to restart', (GAME_WIDTH * SCALE) / 2, (GAME_HEIGHT * SCALE) / 2 + 40);
  } else if (gameState.status === 'victory') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, GAME_WIDTH * SCALE, GAME_HEIGHT * SCALE);
    ctx.fillStyle = '#44ff44';
    ctx.font = `bold 24px "Press Start 2P", monospace`;
    ctx.fillText('VICTORY!', (GAME_WIDTH * SCALE) / 2, (GAME_HEIGHT * SCALE) / 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 12px "Press Start 2P", monospace`;
    ctx.fillText('Press ENTER to play again', (GAME_WIDTH * SCALE) / 2, (GAME_HEIGHT * SCALE) / 2 + 40);
  }
}

export default GameCanvas;
