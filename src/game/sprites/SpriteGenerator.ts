// 像素精灵生成器 - 生成雪人兄弟风格的像素图
// 每个精灵都是预渲染的Canvas

export interface SpriteSheet {
  canvas: HTMLCanvasElement;
  frames: Map<string, { x: number; y: number; width: number; height: number }>;
}

// 颜色调色板 - 模仿NES/街机风格
const PALETTE = {
  // 玩家1 (蓝色雪人 - Nick)
  player1: {
    body: '#FFFFFF',
    outline: '#6088C0',
    hat: '#2038A8',
    hatHighlight: '#4060D0',
    face: '#000000',
    cheek: '#F08080'
  },
  // 玩家2 (绿色雪人 - Tom)
  player2: {
    body: '#FFFFFF',
    outline: '#60A060',
    hat: '#20A820',
    hatHighlight: '#40D040',
    face: '#000000',
    cheek: '#F08080'
  },
  // 红色敌人
  enemyRed: {
    body: '#E04040',
    outline: '#801010',
    belly: '#F08080',
    face: '#FFFFFF',
    pupil: '#000000'
  },
  // 蓝色敌人
  enemyBlue: {
    body: '#4040E0',
    outline: '#101080',
    belly: '#8080F0',
    face: '#FFFFFF',
    pupil: '#000000'
  },
  // 绿色敌人
  enemyGreen: {
    body: '#40C040',
    outline: '#108010',
    belly: '#80E080',
    face: '#FFFFFF',
    pupil: '#000000'
  },
  // Boss敌人 (紫色大怪)
  enemyBoss: {
    body: '#C040C0',
    outline: '#601060',
    belly: '#E080E0',
    face: '#FFFFFF',
    pupil: '#FF0000',
    crown: '#FFD700',
    crownHighlight: '#FFFF80'
  },
  // 雪球
  snowball: {
    main: '#FFFFFF',
    shadow: '#C0D0E0',
    highlight: '#F0F8FF'
  },
  // 平台/砖块
  brick: {
    main: '#D06020',
    highlight: '#F08040',
    shadow: '#803010',
    mortar: '#402010'
  },
  // 背景
  background: {
    main: '#4080C0',
    pattern: '#3070B0'
  }
};

// 绘制单个像素
function setPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

// 绘制像素矩形
function fillRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// 创建玩家精灵 (16x16)
export function createPlayerSprite(playerNumber: 1 | 2, frame: 'idle' | 'walk1' | 'walk2' | 'jump' | 'attack'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;

  const colors = playerNumber === 1 ? PALETTE.player1 : PALETTE.player2;

  // 清空
  ctx.clearRect(0, 0, 16, 16);

  // 根据帧绘制
  switch (frame) {
    case 'idle':
    case 'walk1':
      drawSnowmanIdle(ctx, colors, frame === 'walk1');
      break;
    case 'walk2':
      drawSnowmanWalk(ctx, colors);
      break;
    case 'jump':
      drawSnowmanJump(ctx, colors);
      break;
    case 'attack':
      drawSnowmanAttack(ctx, colors);
      break;
  }

  return canvas;
}

function drawSnowmanIdle(ctx: CanvasRenderingContext2D, colors: typeof PALETTE.player1, step: boolean) {
  const yOffset = step ? 0 : 0;

  // 帽子
  fillRect(ctx, 5, 0 + yOffset, 6, 2, colors.hat);
  fillRect(ctx, 4, 2 + yOffset, 8, 3, colors.hat);
  fillRect(ctx, 6, 1 + yOffset, 4, 1, colors.hatHighlight);

  // 头部（上半身）
  fillRect(ctx, 4, 5 + yOffset, 8, 5, colors.body);
  fillRect(ctx, 5, 4 + yOffset, 6, 1, colors.body);
  setPixel(ctx, 3, 6 + yOffset, colors.outline);
  setPixel(ctx, 3, 7 + yOffset, colors.outline);
  setPixel(ctx, 12, 6 + yOffset, colors.outline);
  setPixel(ctx, 12, 7 + yOffset, colors.outline);

  // 眼睛
  fillRect(ctx, 5, 6 + yOffset, 2, 2, colors.face);
  fillRect(ctx, 9, 6 + yOffset, 2, 2, colors.face);

  // 下半身
  fillRect(ctx, 3, 10 + yOffset, 10, 4, colors.body);
  fillRect(ctx, 4, 14 + yOffset, 8, 2, colors.body);
  setPixel(ctx, 2, 11 + yOffset, colors.outline);
  setPixel(ctx, 2, 12 + yOffset, colors.outline);
  setPixel(ctx, 13, 11 + yOffset, colors.outline);
  setPixel(ctx, 13, 12 + yOffset, colors.outline);

  // 腮红
  setPixel(ctx, 4, 8 + yOffset, colors.cheek);
  setPixel(ctx, 11, 8 + yOffset, colors.cheek);
}

function drawSnowmanWalk(ctx: CanvasRenderingContext2D, colors: typeof PALETTE.player1) {
  // 帽子
  fillRect(ctx, 5, 1, 6, 2, colors.hat);
  fillRect(ctx, 4, 3, 8, 3, colors.hat);
  fillRect(ctx, 6, 2, 4, 1, colors.hatHighlight);

  // 头部
  fillRect(ctx, 4, 6, 8, 4, colors.body);
  fillRect(ctx, 5, 5, 6, 1, colors.body);

  // 眼睛
  fillRect(ctx, 5, 7, 2, 2, colors.face);
  fillRect(ctx, 9, 7, 2, 2, colors.face);

  // 下半身 - 走路姿势
  fillRect(ctx, 3, 10, 10, 3, colors.body);
  fillRect(ctx, 2, 13, 5, 3, colors.body);
  fillRect(ctx, 9, 13, 5, 3, colors.body);

  // 腮红
  setPixel(ctx, 4, 9, colors.cheek);
  setPixel(ctx, 11, 9, colors.cheek);
}

function drawSnowmanJump(ctx: CanvasRenderingContext2D, colors: typeof PALETTE.player1) {
  // 帽子 - 跳跃时稍微上移
  fillRect(ctx, 5, 0, 6, 2, colors.hat);
  fillRect(ctx, 4, 2, 8, 3, colors.hat);
  fillRect(ctx, 6, 1, 4, 1, colors.hatHighlight);

  // 头部
  fillRect(ctx, 4, 5, 8, 4, colors.body);
  fillRect(ctx, 5, 4, 6, 1, colors.body);

  // 眼睛 - 看上方
  fillRect(ctx, 5, 5, 2, 2, colors.face);
  fillRect(ctx, 9, 5, 2, 2, colors.face);

  // 下半身 - 收缩
  fillRect(ctx, 4, 9, 8, 4, colors.body);
  fillRect(ctx, 3, 13, 4, 2, colors.body);
  fillRect(ctx, 9, 13, 4, 2, colors.body);

  // 腮红
  setPixel(ctx, 4, 8, colors.cheek);
  setPixel(ctx, 11, 8, colors.cheek);
}

function drawSnowmanAttack(ctx: CanvasRenderingContext2D, colors: typeof PALETTE.player1) {
  // 帽子
  fillRect(ctx, 5, 1, 6, 2, colors.hat);
  fillRect(ctx, 4, 3, 8, 3, colors.hat);
  fillRect(ctx, 6, 2, 4, 1, colors.hatHighlight);

  // 头部
  fillRect(ctx, 4, 6, 8, 4, colors.body);
  fillRect(ctx, 5, 5, 6, 1, colors.body);

  // 眼睛 - 专注
  fillRect(ctx, 6, 7, 2, 2, colors.face);
  fillRect(ctx, 10, 7, 2, 2, colors.face);

  // 下半身
  fillRect(ctx, 3, 10, 10, 4, colors.body);
  fillRect(ctx, 4, 14, 8, 2, colors.body);

  // 手臂伸出 (攻击)
  fillRect(ctx, 13, 8, 3, 2, colors.body);
  fillRect(ctx, 14, 7, 2, 1, colors.outline);

  // 腮红
  setPixel(ctx, 4, 9, colors.cheek);
  setPixel(ctx, 11, 9, colors.cheek);
}

// 创建敌人精灵 (16x16, Boss是32x32)
export function createEnemySprite(type: 'red' | 'blue' | 'green' | 'boss', frame: 'idle' | 'walk' | 'frozen' | 'snowball'): HTMLCanvasElement {
  const isBoss = type === 'boss';
  const size = isBoss ? 32 : 16;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  let colors;
  switch (type) {
    case 'red': colors = PALETTE.enemyRed; break;
    case 'blue': colors = PALETTE.enemyBlue; break;
    case 'green': colors = PALETTE.enemyGreen; break;
    case 'boss': colors = PALETTE.enemyBoss; break;
  }

  ctx.clearRect(0, 0, size, size);

  if (frame === 'snowball') {
    drawSnowball(ctx, size);
  } else if (frame === 'frozen') {
    if (isBoss) {
      drawBossFrozen(ctx, colors as typeof PALETTE.enemyBoss);
    } else {
      drawFrozenEnemy(ctx, colors as typeof PALETTE.enemyRed);
    }
  } else {
    if (isBoss) {
      drawBoss(ctx, colors as typeof PALETTE.enemyBoss, frame === 'walk');
    } else {
      drawEnemy(ctx, colors as typeof PALETTE.enemyRed, frame === 'walk');
    }
  }

  return canvas;
}

function drawEnemy(ctx: CanvasRenderingContext2D, colors: typeof PALETTE.enemyRed, walking: boolean) {
  const yOffset = walking ? 1 : 0;

  // 身体轮廓
  fillRect(ctx, 4, 2 + yOffset, 8, 2, colors.body);
  fillRect(ctx, 3, 4 + yOffset, 10, 8, colors.body);
  fillRect(ctx, 4, 12 + yOffset, 8, 2, colors.body);

  // 高光/肚子
  fillRect(ctx, 5, 6 + yOffset, 6, 4, colors.belly);

  // 眼睛
  fillRect(ctx, 4, 4 + yOffset, 3, 3, colors.face);
  fillRect(ctx, 9, 4 + yOffset, 3, 3, colors.face);

  // 瞳孔
  fillRect(ctx, 5, 5 + yOffset, 2, 2, colors.pupil);
  fillRect(ctx, 10, 5 + yOffset, 2, 2, colors.pupil);

  // 角/头饰
  fillRect(ctx, 3, 1 + yOffset, 2, 2, colors.outline);
  fillRect(ctx, 11, 1 + yOffset, 2, 2, colors.outline);

  // 脚
  if (walking) {
    fillRect(ctx, 3, 14, 3, 2, colors.body);
    fillRect(ctx, 10, 13, 3, 2, colors.body);
  } else {
    fillRect(ctx, 4, 14, 3, 2, colors.body);
    fillRect(ctx, 9, 14, 3, 2, colors.body);
  }
}

function drawFrozenEnemy(ctx: CanvasRenderingContext2D, colors: typeof PALETTE.enemyRed) {
  // 画一个部分被雪覆盖的敌人
  drawEnemy(ctx, colors, false);

  // 雪覆盖层
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  fillRect(ctx, 3, 8, 10, 8, 'rgba(255, 255, 255, 0.7)');
  fillRect(ctx, 4, 6, 8, 2, 'rgba(255, 255, 255, 0.5)');
}

// Boss绘制 (32x32)
function drawBoss(ctx: CanvasRenderingContext2D, colors: typeof PALETTE.enemyBoss, walking: boolean) {
  const yOffset = walking ? 1 : 0;

  // 皇冠
  fillRect(ctx, 10, 0 + yOffset, 12, 4, colors.crown);
  fillRect(ctx, 8, 4 + yOffset, 16, 2, colors.crown);
  // 皇冠尖角
  fillRect(ctx, 10, 0 + yOffset, 2, 2, colors.crownHighlight);
  fillRect(ctx, 15, 0 + yOffset, 2, 2, colors.crownHighlight);
  fillRect(ctx, 20, 0 + yOffset, 2, 2, colors.crownHighlight);
  // 宝石
  fillRect(ctx, 14, 2 + yOffset, 4, 3, '#FF0000');
  fillRect(ctx, 15, 3 + yOffset, 2, 1, '#FF8080');

  // 头部
  fillRect(ctx, 6, 6 + yOffset, 20, 10, colors.body);
  fillRect(ctx, 8, 5 + yOffset, 16, 1, colors.body);

  // 眼睛
  fillRect(ctx, 8, 9 + yOffset, 5, 5, colors.face);
  fillRect(ctx, 19, 9 + yOffset, 5, 5, colors.face);
  // 红色瞳孔 (愤怒的眼睛)
  fillRect(ctx, 10, 11 + yOffset, 3, 3, colors.pupil);
  fillRect(ctx, 21, 11 + yOffset, 3, 3, colors.pupil);
  // 眼睛高光
  setPixel(ctx, 10, 11 + yOffset, '#FFFFFF');
  setPixel(ctx, 21, 11 + yOffset, '#FFFFFF');

  // 身体
  fillRect(ctx, 4, 16 + yOffset, 24, 12, colors.body);
  fillRect(ctx, 6, 28 + yOffset, 20, 2, colors.body);

  // 肚子
  fillRect(ctx, 10, 18 + yOffset, 12, 8, colors.belly);

  // 手臂
  fillRect(ctx, 0, 18 + yOffset, 5, 6, colors.body);
  fillRect(ctx, 27, 18 + yOffset, 5, 6, colors.body);

  // 脚
  if (walking) {
    fillRect(ctx, 6, 30, 6, 2, colors.body);
    fillRect(ctx, 20, 29, 6, 3, colors.body);
  } else {
    fillRect(ctx, 8, 30, 6, 2, colors.body);
    fillRect(ctx, 18, 30, 6, 2, colors.body);
  }

  // 邪恶的笑容
  fillRect(ctx, 12, 14 + yOffset, 8, 1, colors.outline);
  setPixel(ctx, 11, 13 + yOffset, colors.outline);
  setPixel(ctx, 20, 13 + yOffset, colors.outline);
}

function drawBossFrozen(ctx: CanvasRenderingContext2D, colors: typeof PALETTE.enemyBoss) {
  // 画Boss
  drawBoss(ctx, colors, false);

  // 大面积雪覆盖
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  fillRect(ctx, 4, 16, 24, 16, 'rgba(255, 255, 255, 0.7)');
  fillRect(ctx, 6, 12, 20, 4, 'rgba(255, 255, 255, 0.5)');

  // 冰晶效果
  ctx.fillStyle = 'rgba(135, 206, 235, 0.5)';
  fillRect(ctx, 8, 18, 4, 8, 'rgba(135, 206, 235, 0.5)');
  fillRect(ctx, 20, 18, 4, 8, 'rgba(135, 206, 235, 0.5)');
}

function drawSnowball(ctx: CanvasRenderingContext2D, size: number) {
  const colors = PALETTE.snowball;
  const r = size / 2 - 1;
  const cx = size / 2;
  const cy = size / 2;

  // 主体 - 用像素圆
  ctx.fillStyle = colors.main;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx + 0.5;
      const dy = y - cy + 0.5;
      if (dx * dx + dy * dy <= r * r) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  // 阴影
  ctx.fillStyle = colors.shadow;
  for (let y = cy; y < size - 1; y++) {
    for (let x = cx; x < size - 1; x++) {
      const dx = x - cx + 0.5;
      const dy = y - cy + 0.5;
      if (dx * dx + dy * dy <= (r - 1) * (r - 1) && dx * dx + dy * dy > (r - 3) * (r - 3)) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  // 高光
  fillRect(ctx, cx - 2, cy - 3, 2, 2, colors.highlight);
  setPixel(ctx, cx - 3, cy - 2, colors.highlight);
}

// 创建雪花攻击精灵 (8x8)
export function createSnowAttackSprite(enhanced: boolean): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const size = enhanced ? 12 : 8;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);

  const colors = PALETTE.snowball;
  const cx = size / 2;
  const cy = size / 2;

  // 雪花形状
  ctx.fillStyle = colors.main;

  // 中心
  fillRect(ctx, cx - 1, cy - 1, 2, 2, colors.main);

  // 四个方向
  fillRect(ctx, cx - 1, 0, 2, size, colors.main);
  fillRect(ctx, 0, cy - 1, size, 2, colors.main);

  // 对角线
  for (let i = 0; i < size / 2; i++) {
    setPixel(ctx, cx - 1 - i, cy - 1 - i, colors.main);
    setPixel(ctx, cx + i, cy - 1 - i, colors.main);
    setPixel(ctx, cx - 1 - i, cy + i, colors.main);
    setPixel(ctx, cx + i, cy + i, colors.main);
  }

  // 增强效果发光
  if (enhanced) {
    ctx.fillStyle = colors.highlight;
    fillRect(ctx, cx - 1, cy - 1, 2, 2, colors.highlight);
  }

  return canvas;
}

// 创建砖块瓷砖 (8x8)
export function createBrickTile(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 8;
  const ctx = canvas.getContext('2d')!;

  const colors = PALETTE.brick;

  // 背景
  fillRect(ctx, 0, 0, 8, 8, colors.main);

  // 砖块图案 - 第一行
  fillRect(ctx, 0, 0, 8, 1, colors.highlight);
  fillRect(ctx, 0, 0, 1, 4, colors.highlight);
  fillRect(ctx, 0, 3, 8, 1, colors.mortar);

  // 砖块图案 - 第二行 (错开)
  fillRect(ctx, 4, 4, 4, 1, colors.highlight);
  fillRect(ctx, 0, 4, 4, 1, colors.highlight);
  fillRect(ctx, 4, 4, 1, 4, colors.highlight);
  fillRect(ctx, 0, 7, 8, 1, colors.mortar);

  // 阴影
  fillRect(ctx, 7, 0, 1, 4, colors.shadow);
  fillRect(ctx, 3, 4, 1, 4, colors.shadow);

  return canvas;
}

// 创建单向平台瓷砖 (8x8)
export function createOneWayPlatformTile(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 8;
  const ctx = canvas.getContext('2d')!;

  // 金属平台风格
  fillRect(ctx, 0, 0, 8, 2, '#C0C0C0');
  fillRect(ctx, 0, 0, 8, 1, '#E0E0E0');
  fillRect(ctx, 0, 2, 8, 2, '#808080');
  fillRect(ctx, 0, 4, 8, 4, '#606060');

  // 螺丝装饰
  setPixel(ctx, 1, 5, '#404040');
  setPixel(ctx, 6, 5, '#404040');

  return canvas;
}

// 创建道具精灵 (12x12)
export function createPowerUpSprite(type: 'potion_red' | 'potion_blue' | 'potion_yellow' | 'sushi' | 'money_bag' | 'extra_life'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 12;
  canvas.height = 12;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 12, 12);

  switch (type) {
    case 'potion_red':
      drawPotion(ctx, '#FF4040', '#FF8080');
      break;
    case 'potion_blue':
      drawPotion(ctx, '#4040FF', '#8080FF');
      break;
    case 'potion_yellow':
      drawPotion(ctx, '#FFD700', '#FFFF80');
      break;
    case 'sushi':
      drawSushi(ctx);
      break;
    case 'money_bag':
      drawMoneyBag(ctx);
      break;
    case 'extra_life':
      drawExtraLife(ctx);
      break;
  }

  return canvas;
}

function drawPotion(ctx: CanvasRenderingContext2D, mainColor: string, highlightColor: string) {
  // 瓶盖
  fillRect(ctx, 4, 0, 4, 2, '#804000');
  fillRect(ctx, 5, 0, 2, 1, '#A06020');

  // 瓶颈
  fillRect(ctx, 4, 2, 4, 2, '#E0E0E0');

  // 瓶身
  fillRect(ctx, 2, 4, 8, 7, mainColor);
  fillRect(ctx, 3, 11, 6, 1, mainColor);

  // 高光
  fillRect(ctx, 3, 5, 2, 4, highlightColor);

  // 边框
  setPixel(ctx, 1, 5, '#000000');
  setPixel(ctx, 1, 10, '#000000');
  setPixel(ctx, 10, 5, '#000000');
  setPixel(ctx, 10, 10, '#000000');
}

function drawSushi(ctx: CanvasRenderingContext2D) {
  // 饭团
  fillRect(ctx, 2, 4, 8, 6, '#FFFFFF');
  fillRect(ctx, 3, 3, 6, 1, '#FFFFFF');
  fillRect(ctx, 3, 10, 6, 1, '#FFFFFF');

  // 海苔
  fillRect(ctx, 1, 5, 10, 4, '#203020');

  // 鱼肉
  fillRect(ctx, 3, 1, 6, 3, '#FF6060');
  fillRect(ctx, 4, 0, 4, 1, '#FF8080');
}

function drawMoneyBag(ctx: CanvasRenderingContext2D) {
  // 袋子
  fillRect(ctx, 3, 3, 6, 8, '#D4A030');
  fillRect(ctx, 2, 5, 8, 5, '#D4A030');
  fillRect(ctx, 4, 2, 4, 1, '#B08020');

  // 绑带
  fillRect(ctx, 4, 2, 4, 2, '#804010');

  // $符号
  fillRect(ctx, 5, 5, 2, 1, '#FFFF00');
  fillRect(ctx, 4, 6, 1, 1, '#FFFF00');
  fillRect(ctx, 5, 7, 2, 1, '#FFFF00');
  fillRect(ctx, 7, 8, 1, 1, '#FFFF00');
  fillRect(ctx, 5, 9, 2, 1, '#FFFF00');

  // 高光
  fillRect(ctx, 3, 4, 1, 3, '#E8C060');
}

function drawExtraLife(ctx: CanvasRenderingContext2D) {
  // 小雪人头像
  // 头
  fillRect(ctx, 3, 2, 6, 5, '#FFFFFF');
  fillRect(ctx, 4, 1, 4, 1, '#FFFFFF');
  fillRect(ctx, 4, 7, 4, 1, '#FFFFFF');

  // 帽子
  fillRect(ctx, 4, 0, 4, 2, '#4080FF');

  // 眼睛
  setPixel(ctx, 4, 4, '#000000');
  setPixel(ctx, 7, 4, '#000000');

  // 身体
  fillRect(ctx, 2, 8, 8, 4, '#FFFFFF');

  // 腮红
  setPixel(ctx, 3, 5, '#FF8080');
  setPixel(ctx, 8, 5, '#FF8080');
}

// 创建背景图案
export function createBackgroundPattern(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;

  const colors = PALETTE.background;

  // 主背景
  fillRect(ctx, 0, 0, 16, 16, colors.main);

  // 棋盘格图案
  for (let y = 0; y < 16; y += 2) {
    for (let x = (y % 4 === 0) ? 0 : 2; x < 16; x += 4) {
      fillRect(ctx, x, y, 2, 2, colors.pattern);
    }
  }

  return canvas;
}

// 精灵缓存
class SpriteCache {
  private cache: Map<string, HTMLCanvasElement> = new Map();

  getPlayerSprite(playerNumber: 1 | 2, frame: string): HTMLCanvasElement {
    const key = `player_${playerNumber}_${frame}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, createPlayerSprite(playerNumber, frame as any));
    }
    return this.cache.get(key)!;
  }

  getEnemySprite(type: string, frame: string): HTMLCanvasElement {
    const key = `enemy_${type}_${frame}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, createEnemySprite(type as any, frame as any));
    }
    return this.cache.get(key)!;
  }

  getSnowAttackSprite(enhanced: boolean): HTMLCanvasElement {
    const key = `snow_${enhanced}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, createSnowAttackSprite(enhanced));
    }
    return this.cache.get(key)!;
  }

  getBrickTile(): HTMLCanvasElement {
    const key = 'brick';
    if (!this.cache.has(key)) {
      this.cache.set(key, createBrickTile());
    }
    return this.cache.get(key)!;
  }

  getOneWayPlatformTile(): HTMLCanvasElement {
    const key = 'oneway';
    if (!this.cache.has(key)) {
      this.cache.set(key, createOneWayPlatformTile());
    }
    return this.cache.get(key)!;
  }

  getPowerUpSprite(type: string): HTMLCanvasElement {
    const key = `powerup_${type}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, createPowerUpSprite(type as any));
    }
    return this.cache.get(key)!;
  }

  getBackgroundPattern(): HTMLCanvasElement {
    const key = 'background';
    if (!this.cache.has(key)) {
      this.cache.set(key, createBackgroundPattern());
    }
    return this.cache.get(key)!;
  }
}

export const spriteCache = new SpriteCache();
