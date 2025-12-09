const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// 生产环境：服务静态文件
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
}

const server = http.createServer(app);

// 根据环境配置 CORS
const corsOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL || '*']
  : ["http://localhost:3000", "http://localhost:3002"];

const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST"]
  }
});

// 房间管理
const rooms = new Map();

class GameRoom {
  constructor(roomId, hostSocket) {
    this.roomId = roomId;
    this.players = new Map();
    this.hostId = hostSocket.id;
    this.gameState = null;
    this.isPlaying = false;
    this.startTime = null;

    this.addPlayer(hostSocket, 1);
  }

  addPlayer(socket, playerNumber) {
    this.players.set(socket.id, {
      socket,
      playerNumber,
      ready: false
    });
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
    return this.players.size;
  }

  getPlayerCount() {
    return this.players.size;
  }

  broadcast(event, data, excludeId = null) {
    for (const [id, player] of this.players) {
      if (id !== excludeId) {
        player.socket.emit(event, data);
      }
    }
  }
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', ({ roomId }) => {
    let room = rooms.get(roomId);

    if (!room) {
      // 创建新房间
      room = new GameRoom(roomId, socket);
      rooms.set(roomId, room);
      socket.join(roomId);

      socket.emit('roomJoined', {
        isHost: true,
        playerNumber: 1,
        roomId
      });

      console.log(`Room ${roomId} created by ${socket.id}`);
    } else if (room.getPlayerCount() < 2) {
      // 加入现有房间
      room.addPlayer(socket, 2);
      socket.join(roomId);

      socket.emit('roomJoined', {
        isHost: false,
        playerNumber: 2,
        roomId
      });

      // 通知房主有人加入
      room.broadcast('playerJoined', { playerNumber: 2 }, socket.id);

      console.log(`Player ${socket.id} joined room ${roomId}`);
    } else {
      socket.emit('roomFull');
    }
  });

  socket.on('input', (data) => {
    // 找到玩家所在的房间
    for (const [roomId, room] of rooms) {
      if (room.players.has(socket.id)) {
        const player = room.players.get(socket.id);
        // 将输入转发给房主，带上玩家编号
        const inputData = {
          playerNumber: player.playerNumber,
          input: data.input
        };
        room.broadcast('input', inputData, socket.id);
        break;
      }
    }
  });

  socket.on('gameState', (state) => {
    // 房主广播游戏状态
    for (const [roomId, room] of rooms) {
      if (room.hostId === socket.id) {
        room.gameState = state;
        room.broadcast('gameState', state, socket.id);
        break;
      }
    }
  });

  socket.on('startGame', () => {
    for (const [roomId, room] of rooms) {
      if (room.hostId === socket.id) {
        room.isPlaying = true;
        room.startTime = Date.now();
        room.broadcast('gameStarted', {});
        break;
      }
    }
  });

  socket.on('gameOver', async ({ score, level }) => {
    for (const [roomId, room] of rooms) {
      if (room.players.has(socket.id)) {
        const duration = room.startTime
          ? Math.floor((Date.now() - room.startTime) / 1000)
          : 0;
        console.log(`Game over in room ${roomId}, score: ${score}, level: ${level}, duration: ${duration}s`);
        break;
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // 清理房间
    for (const [roomId, room] of rooms) {
      if (room.players.has(socket.id)) {
        const remaining = room.removePlayer(socket.id);

        if (remaining === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted`);
        } else {
          room.broadcast('playerLeft', { socketId: socket.id });

          // 如果房主离开，转移房主权限
          if (room.hostId === socket.id) {
            const newHost = room.players.keys().next().value;
            room.hostId = newHost;
            room.players.get(newHost).socket.emit('becomeHost');
          }
        }
        break;
      }
    }
  });
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size });
});

// 生产环境：所有其他请求返回 index.html (SPA)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
