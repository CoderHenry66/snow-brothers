// 游戏常量
export const GAME_WIDTH = 256;
export const GAME_HEIGHT = 224;
export const TILE_SIZE = 8;
export const SCALE = 3;

export const GRAVITY = 0.3;
export const MAX_FALL_SPEED = 5;
export const PLAYER_SPEED = 1.5;
export const PLAYER_JUMP_FORCE = -5.5;
export const SNOWBALL_SPEED = 3;

// 玩家状态
export enum PlayerState {
  IDLE = 'idle',
  WALKING = 'walking',
  JUMPING = 'jumping',
  FALLING = 'falling',
  ATTACKING = 'attacking',
  HURT = 'hurt',
  DEAD = 'dead',
  PUSHING = 'pushing'
}

// 敌人状态
export enum EnemyState {
  IDLE = 'idle',
  WALKING = 'walking',
  JUMPING = 'jumping',
  FALLING = 'falling',
  FROZEN_1 = 'frozen_1',  // 25% 冰冻
  FROZEN_2 = 'frozen_2',  // 50% 冰冻
  FROZEN_3 = 'frozen_3',  // 75% 冰冻
  FROZEN_4 = 'frozen_4',  // 100% 冰冻，变成雪球
  SNOWBALL = 'snowball',  // 完全变成雪球
  ROLLING = 'rolling',    // 被推动滚动中
  DEAD = 'dead'
}

// 敌人类型
export enum EnemyType {
  RED = 'red',      // 红色敌人 - 基础类型
  BLUE = 'blue',    // 蓝色敌人 - 会跳跃
  GREEN = 'green',  // 绿色敌人 - 会扔炸弹
  BOSS = 'boss'     // Boss
}

// 道具类型
export enum PowerUpType {
  POTION_RED = 'potion_red',      // 加速
  POTION_BLUE = 'potion_blue',    // 雪花更大
  POTION_YELLOW = 'potion_yellow', // 无敌
  SUSHI = 'sushi',                 // 加分
  MONEY_BAG = 'money_bag',         // 大量加分
  EXTRA_LIFE = 'extra_life'        // 加命
}

// 实体基类接口
export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  facingRight: boolean;
}

// 玩家接口
export interface Player extends Entity {
  playerNumber: 1 | 2;
  state: PlayerState;
  lives: number;
  score: number;
  isAttacking: boolean;
  attackCooldown: number;
  invincible: boolean;
  invincibleTimer: number;
  onGround: boolean;
  color: string;
  // 药水增益效果
  speedBoostTimer: number;    // 红色药水：子弹变长
  powerBoostTimer: number;    // 蓝色药水：子弹威力加倍（2次冰冻）
}

// 敌人接口
export interface Enemy extends Entity {
  type: EnemyType;
  state: EnemyState;
  freezeLevel: number;  // 0-100
  freezeDecayTimer: number;
  health: number;
  aiTimer: number;
  targetPlatform: number | null;
}

// 雪球（被推动的敌人）
export interface Snowball extends Entity {
  sourceEnemy: Enemy;
  rolling: boolean;
  hitCount: number;  // 击中的敌人数量，用于连击加分
}

// 雪花攻击
export interface SnowAttack extends Entity {
  playerId: string;
  lifetime: number;
  power: number;      // 威力：普通25，强化50
  isEnhanced: boolean; // 是否是增强子弹（变长）
}

// 道具
export interface PowerUp extends Entity {
  type: PowerUpType;
  lifetime: number;
}

// 平台
export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  isOneWay: boolean;  // 单向平台，可以从下方跳上
}

// 关卡定义
export interface Level {
  id: number;
  name: string;
  platforms: Platform[];
  spawnPoints: { x: number; y: number }[];
  playerSpawns: { x: number; y: number }[];
  enemies: { type: EnemyType; spawnIndex: number }[];
  backgroundColor: string;
  music?: string;
}

// 游戏状态
export interface GameState {
  status: 'menu' | 'playing' | 'paused' | 'gameover' | 'levelComplete' | 'victory';
  currentLevel: number;
  players: Player[];
  enemies: Enemy[];
  snowballs: Snowball[];
  snowAttacks: SnowAttack[];
  powerUps: PowerUp[];
  timeRemaining: number;
  combo: number;
  comboTimer: number;
}

// 输入状态
export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  attack: boolean;
}

// 网络消息类型
export interface NetworkMessage {
  type: 'join' | 'leave' | 'input' | 'state' | 'start' | 'restart';
  playerId?: string;
  data?: any;
}

// 房间状态（用于联机）
export interface RoomState {
  roomId: string;
  players: { id: string; ready: boolean; playerNumber: 1 | 2 }[];
  gameState: GameState | null;
  isPlaying: boolean;
}
