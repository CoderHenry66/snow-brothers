import {
  GameState,
  Player,
  Enemy,
  SnowAttack,
  PowerUp,
  InputState,
  Level,
  EnemyState,
  PlayerState,
  GAME_HEIGHT
} from '../types/game';
import { createPlayer, updatePlayer, respawnPlayer, addScore, playerDie } from './entities/Player';
import { createEnemy, updateEnemy, pushSnowball, updateRollingSnowball, killEnemy } from './entities/Enemy';
import { createSnowAttack, updateSnowAttack, checkSnowAttackCollisions } from './entities/SnowAttack';
import { createPowerUp, updatePowerUp, applyPowerUp, getRandomPowerUp } from './entities/PowerUp';
import { getLevel } from './levels/levels';
import { checkCollision } from './systems/physics';

// UI区域高度（底部预留空间）
const UI_BOTTOM = 20;
const GROUND_Y = GAME_HEIGHT - UI_BOTTOM;

export class GameEngine {
  private gameState: GameState;
  private currentLevel: Level | null = null;
  private inputStates: Map<string, InputState> = new Map();
  private respawnTimers: Map<string, number> = new Map();
  private levelCompleteTimer: number = 0;
  private gameLoopId: number | null = null;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly FIXED_TIMESTEP = 1000 / 60; // 60 FPS

  constructor() {
    this.gameState = this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      status: 'menu',
      currentLevel: 1,
      players: [],
      enemies: [],
      snowballs: [],
      snowAttacks: [],
      powerUps: [],
      timeRemaining: 120 * 60, // 2分钟（帧数）
      combo: 0,
      comboTimer: 0
    };
  }

  public startGame(playerCount: 1 | 2 = 1): void {
    this.gameState = this.createInitialState();
    this.gameState.status = 'playing';

    // 加载第一关
    this.loadLevel(1);

    // 创建玩家
    if (this.currentLevel) {
      const spawn1 = this.currentLevel.playerSpawns[0];
      this.gameState.players.push(createPlayer(1, spawn1.x, spawn1.y));

      if (playerCount === 2) {
        const spawn2 = this.currentLevel.playerSpawns[1];
        this.gameState.players.push(createPlayer(2, spawn2.x, spawn2.y));
      }

      // 初始化输入状态
      for (const player of this.gameState.players) {
        this.inputStates.set(player.id, {
          left: false,
          right: false,
          up: false,
          down: false,
          jump: false,
          attack: false
        });
      }
    }
  }

  private loadLevel(levelNumber: number): void {
    const level = getLevel(levelNumber);
    if (!level) {
      // 没有更多关卡，游戏胜利
      this.gameState.status = 'victory';
      return;
    }

    this.currentLevel = level;
    this.gameState.currentLevel = levelNumber;
    this.gameState.enemies = [];
    this.gameState.snowAttacks = [];
    this.gameState.powerUps = [];
    this.gameState.timeRemaining = 120 * 60;

    // 生成敌人
    for (const enemyDef of level.enemies) {
      const spawnPoint = level.spawnPoints[enemyDef.spawnIndex];
      if (spawnPoint) {
        this.gameState.enemies.push(
          createEnemy(enemyDef.type, spawnPoint.x, spawnPoint.y)
        );
      }
    }

    // 重置玩家位置
    for (let i = 0; i < this.gameState.players.length; i++) {
      const player = this.gameState.players[i];
      const spawn = level.playerSpawns[i];
      if (spawn) {
        player.x = spawn.x;
        player.y = spawn.y;
        player.velocityX = 0;
        player.velocityY = 0;
        player.state = PlayerState.IDLE;
        player.invincible = true;
        player.invincibleTimer = 120;
      }
    }
  }

  public update(deltaTime: number = 1): void {
    if (this.gameState.status !== 'playing') {
      return;
    }

    if (!this.currentLevel) return;

    // 更新时间
    this.gameState.timeRemaining -= deltaTime;
    if (this.gameState.timeRemaining <= 0) {
      // 时间到，惩罚机制（原版会生成快速敌人）
      this.gameState.timeRemaining = 60 * 60; // 重置一分钟
    }

    // 更新连击计时器
    if (this.gameState.comboTimer > 0) {
      this.gameState.comboTimer -= deltaTime;
      if (this.gameState.comboTimer <= 0) {
        this.gameState.combo = 0;
      }
    }

    // 更新玩家
    for (const player of this.gameState.players) {
      const input = this.inputStates.get(player.id) || {
        left: false, right: false, up: false, down: false, jump: false, attack: false
      };

      // 处理死亡重生
      if (player.state === PlayerState.DEAD) {
        let timer = this.respawnTimers.get(player.id) || 0;
        timer += deltaTime;
        this.respawnTimers.set(player.id, timer);

        if (timer >= 120 && player.lives > 0) { // 2秒后重生
          const spawn = this.currentLevel.playerSpawns[player.playerNumber - 1];
          respawnPlayer(player, spawn.x, spawn.y);
          this.respawnTimers.delete(player.id);
        }
        continue;
      }

      // 处理攻击
      if (input.attack && player.attackCooldown <= 0 && !player.isAttacking) {
        const snowAttack = createSnowAttack(player);
        this.gameState.snowAttacks.push(snowAttack);
      }

      updatePlayer(player, input, this.currentLevel.platforms, deltaTime);
    }

    // 更新雪花攻击
    const attacksToRemove: SnowAttack[] = [];
    for (const attack of this.gameState.snowAttacks) {
      if (updateSnowAttack(attack, deltaTime)) {
        attacksToRemove.push(attack);
      }
    }

    // 检测雪花攻击碰撞
    const hitAttacks = checkSnowAttackCollisions(
      this.gameState.snowAttacks,
      this.gameState.enemies
    );
    attacksToRemove.push(...hitAttacks);

    // 移除攻击
    this.gameState.snowAttacks = this.gameState.snowAttacks.filter(
      a => !attacksToRemove.includes(a)
    );

    // 更新敌人
    const enemiesToRemove: Enemy[] = [];
    for (const enemy of this.gameState.enemies) {
      if (enemy.state === EnemyState.DEAD) {
        // 死亡动画
        enemy.y += enemy.velocityY;
        enemy.velocityY += 0.2;
        if (enemy.y > GROUND_Y + 50) {
          enemiesToRemove.push(enemy);
        }
        continue;
      }

      if (enemy.state === EnemyState.ROLLING) {
        // 处理滚动的雪球
        const snowballFinished = updateRollingSnowball(enemy, this.currentLevel.platforms, deltaTime);
        if (snowballFinished) {
          // 雪球消失时给分数和掉落道具
          const score = killEnemy(enemy);
          for (const player of this.gameState.players) {
            if (player.state !== PlayerState.DEAD) {
              addScore(player, score);
              break;
            }
          }
          // 掉落道具
          if (Math.random() < 0.7) {
            const powerUp = createPowerUp(
              getRandomPowerUp(),
              enemy.x,
              enemy.y - 10
            );
            this.gameState.powerUps.push(powerUp);
          }
          enemiesToRemove.push(enemy);
        }

        // 检测滚动雪球与其他敌人的碰撞
        // 雪球可以一路撞击多个敌人，不会立即消失
        for (const otherEnemy of this.gameState.enemies) {
          if (otherEnemy.id === enemy.id) continue;
          if (otherEnemy.state === EnemyState.DEAD) continue;

          if (checkCollision(enemy, otherEnemy)) {
            // 连击
            this.gameState.combo++;
            this.gameState.comboTimer = 120; // 延长连击时间

            const comboMultiplier = Math.min(this.gameState.combo, 10);
            const score = killEnemy(otherEnemy) * comboMultiplier;

            // 给推雪球的玩家加分
            for (const player of this.gameState.players) {
              if (player.state !== PlayerState.DEAD) {
                addScore(player, score);
                break;
              }
            }

            // 掉落道具 - 提高掉落率
            if (Math.random() < 0.6) {
              const powerUp = createPowerUp(
                getRandomPowerUp(),
                otherEnemy.x,
                otherEnemy.y
              );
              this.gameState.powerUps.push(powerUp);
            }
          }
        }

        // 检测滚动雪球与玩家的碰撞（弹开但不伤害）
        continue;
      }

      updateEnemy(enemy, this.currentLevel.platforms, this.gameState.players, deltaTime);

      // 检测玩家与敌人的碰撞
      for (const player of this.gameState.players) {
        if (player.state === PlayerState.DEAD || player.invincible) continue;

        if (checkCollision(player, enemy)) {
          if (enemy.state === EnemyState.SNOWBALL) {
            // 推雪球
            const direction = player.x < enemy.x ? 1 : -1;
            pushSnowball(enemy, direction);

            // 给推雪球的分数
            addScore(player, 100);
            this.gameState.combo = 1;
            this.gameState.comboTimer = 180;
          } else if (enemy.freezeLevel < 50) {
            // 被非冰冻敌人碰到，受伤
            playerDie(player);
            this.respawnTimers.set(player.id, 0);
          }
        }
      }
    }

    // 移除死亡敌人
    this.gameState.enemies = this.gameState.enemies.filter(
      e => !enemiesToRemove.includes(e)
    );

    // 更新道具
    const powerUpsToRemove: PowerUp[] = [];
    for (const powerUp of this.gameState.powerUps) {
      if (updatePowerUp(powerUp, deltaTime)) {
        powerUpsToRemove.push(powerUp);
        continue;
      }

      // 检测玩家拾取
      for (const player of this.gameState.players) {
        if (player.state === PlayerState.DEAD) continue;

        if (checkCollision(player, powerUp)) {
          const score = applyPowerUp(powerUp, player);
          addScore(player, score);
          powerUpsToRemove.push(powerUp);
          break;
        }
      }
    }

    this.gameState.powerUps = this.gameState.powerUps.filter(
      p => !powerUpsToRemove.includes(p)
    );

    // 检测关卡完成 - 所有敌人都被移除后过关
    if (this.gameState.enemies.length === 0) {
      this.levelCompleteTimer += deltaTime;
      if (this.levelCompleteTimer >= 120) { // 2秒后进入下一关
        this.levelCompleteTimer = 0;
        this.loadLevel(this.gameState.currentLevel + 1);
      }
    } else {
      this.levelCompleteTimer = 0;
    }

    // 检测游戏结束
    const allPlayersDead = this.gameState.players.every(
      p => p.state === PlayerState.DEAD && p.lives <= 0
    );
    if (allPlayersDead) {
      this.gameState.status = 'gameover';
    }
  }

  public setInput(playerId: string, input: Partial<InputState>): void {
    const currentInput = this.inputStates.get(playerId);
    if (currentInput) {
      this.inputStates.set(playerId, { ...currentInput, ...input });
    }
  }

  public getState(): GameState {
    return this.gameState;
  }

  public getCurrentLevel(): Level | null {
    return this.currentLevel;
  }

  public getPlayerById(id: string): Player | undefined {
    return this.gameState.players.find(p => p.id === id);
  }

  public getPlayerByNumber(num: 1 | 2): Player | undefined {
    return this.gameState.players.find(p => p.playerNumber === num);
  }

  public pause(): void {
    if (this.gameState.status === 'playing') {
      this.gameState.status = 'paused';
    }
  }

  public resume(): void {
    if (this.gameState.status === 'paused') {
      this.gameState.status = 'playing';
    }
  }

  public restart(): void {
    this.startGame(this.gameState.players.length as 1 | 2);
  }

  // 用于联机同步的方法
  public setState(state: GameState): void {
    this.gameState = state;
  }

  public serialize(): string {
    return JSON.stringify({
      gameState: this.gameState,
      currentLevel: this.currentLevel
    });
  }

  public deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.gameState = parsed.gameState;
    this.currentLevel = parsed.currentLevel;
  }
}
