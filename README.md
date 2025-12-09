# Snow Brothers - 雪人兄弟

一个基于React和Canvas的经典雪人兄弟(Snow Bros)复刻游戏，支持本地双人和在线联机。

## 游戏特点

- **高度还原经典玩法**: 雪花冰冻敌人、推雪球连击等经典机制
- **1-3关卡设计**: 逐步增加难度，不同类型的敌人
- **本地双人游戏**: 支持两人同屏游玩
- **在线联机**: 通过房间号与朋友联机游戏
- **像素风格**: 复古像素艺术风格

## 快速开始

### 安装依赖

```bash
cd snow-brothers
npm install
```

### 启动前端 (单人/本地双人)

```bash
npm start
```

游戏将在 http://localhost:3000 运行

### 启动服务器 (在线联机)

```bash
npm run server
```

服务器将在 http://localhost:3001 运行

### 同时启动前端和服务器

```bash
npm run dev
```

## 游戏操作

### 玩家1 (蓝色雪人)
- **移动**: WASD 或 方向键
- **跳跃**: J 或 空格
- **攻击**: K 或 L

### 玩家2 (绿色雪人) - 仅限本地双人
- **移动**: 小键盘 4/6/8/5
- **跳跃**: 小键盘 0 或 .
- **攻击**: 小键盘 Del 或 ,

### 全局操作
- **暂停**: ESC
- **重新开始**: Enter (游戏结束后)

## 游戏玩法

1. **冰冻敌人**: 使用雪花攻击敌人，连续攻击4次使敌人完全变成雪球
2. **推雪球**: 走到雪球旁边推动它
3. **连击加分**: 滚动的雪球撞击其他敌人可以获得连击奖励
4. **收集道具**: 击败敌人会掉落各种道具
   - 红色药水: 加速
   - 蓝色药水: 增强雪花
   - 黄色药水: 无敌
   - 寿司/钱袋: 加分
   - 心: 加命

## 敌人类型

- **红色敌人**: 基础类型，只会左右移动
- **蓝色敌人**: 会跳跃，追踪玩家
- **绿色敌人**: 更耐打，需要冰冻更长时间

## 关卡说明

### 第1关
- 5个红色敌人
- 简单平台布局
- 入门难度

### 第2关
- 红色和蓝色敌人混合
- 更复杂的平台结构
- 中等难度

### 第3关
- 引入绿色敌人
- 更多平台层次
- 较高难度

## 技术栈

- **前端**: React 19 + TypeScript
- **渲染**: HTML5 Canvas
- **联机**: Socket.io
- **数据库**: MongoDB (可选)

## 项目结构

```
snow-brothers/
├── src/
│   ├── components/      # React组件
│   │   ├── Game.tsx     # 主游戏组件
│   │   ├── GameCanvas.tsx # Canvas渲染
│   │   └── MainMenu.tsx # 主菜单
│   ├── game/            # 游戏核心逻辑
│   │   ├── GameEngine.ts # 游戏引擎
│   │   ├── entities/    # 游戏实体
│   │   ├── systems/     # 物理系统
│   │   └── levels/      # 关卡定义
│   ├── hooks/           # React Hooks
│   └── types/           # TypeScript类型
├── server/              # 后端服务器
│   └── index.js         # Socket.io服务器
└── package.json
```

## MongoDB 集成 (可选)

如果需要保存游戏记录和排行榜，请确保MongoDB已启动：

```bash
mongod
```

服务器会自动连接到 `mongodb://localhost:27017/snowbrothers`

## 开发说明

### 添加新关卡

在 `src/game/levels/levels.ts` 中添加新关卡配置：

```typescript
export const level4: Level = {
  id: 4,
  name: 'ROUND 4',
  backgroundColor: '#...',
  platforms: [...],
  spawnPoints: [...],
  playerSpawns: [...],
  enemies: [...]
};
```

### 添加新敌人类型

1. 在 `src/types/game.ts` 中添加枚举
2. 在 `src/game/entities/Enemy.ts` 中添加配置
3. 在 `src/components/GameCanvas.tsx` 中添加渲染逻辑

## License

MIT
