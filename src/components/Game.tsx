import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GameCanvas } from './GameCanvas';
import { MainMenu } from './MainMenu';
import { useInput, useGlobalKeys } from '../hooks/useInput';
import { useGameLoop } from '../hooks/useGameLoop';
import { GameState, InputState, Level } from '../types/game';
import { io, Socket } from 'socket.io-client';

type GameMode = 'menu' | 'local' | 'online';
type OnlineStatus = 'disconnected' | 'connecting' | 'waiting' | 'ready' | 'playing';

export const Game: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerCount, setPlayerCount] = useState<1 | 2>(1);
  const [roomId, setRoomId] = useState<string>('');
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>('disconnected');
  const [myPlayerNumber, setMyPlayerNumber] = useState<1 | 2>(1);

  const engineRef = useRef<GameEngine | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const isHostRef = useRef(false);
  const currentLevelRef = useRef<Level | null>(null);

  // 初始化游戏引擎
  useEffect(() => {
    engineRef.current = new GameEngine();
    return () => {
      engineRef.current = null;
    };
  }, []);

  // 更新游戏状态
  const handleUpdate = useCallback(() => {
    if (engineRef.current) {
      const state = engineRef.current.getState();
      setGameState({ ...state });
      currentLevelRef.current = engineRef.current.getCurrentLevel();

      // 房主广播游戏状态给客户端
      if (gameMode === 'online' && isHostRef.current && socketRef.current) {
        socketRef.current.emit('gameState', {
          state,
          level: currentLevelRef.current
        });
      }
    }
  }, [gameMode]);

  const { start: startLoop, stop: stopLoop } = useGameLoop(
    engineRef,
    handleUpdate
  );

  // 处理玩家输入
  const handlePlayer1Input = useCallback((input: InputState) => {
    if (!engineRef.current) return;

    if (gameMode === 'local') {
      // 本地模式：直接设置玩家1输入
      const player = engineRef.current.getPlayerByNumber(1);
      if (player) {
        engineRef.current.setInput(player.id, input);
      }
    } else if (gameMode === 'online') {
      if (isHostRef.current) {
        // 房主：直接设置自己（玩家1）的输入
        const player = engineRef.current.getPlayerByNumber(1);
        if (player) {
          engineRef.current.setInput(player.id, input);
        }
      } else {
        // 客户端：发送输入给房主
        if (socketRef.current) {
          socketRef.current.emit('input', { playerNumber: myPlayerNumber, input });
        }
      }
    }
  }, [gameMode, myPlayerNumber]);

  // 处理玩家2输入（本地模式）
  const handlePlayer2Input = useCallback((input: InputState) => {
    if (engineRef.current && gameMode === 'local') {
      const player = engineRef.current.getPlayerByNumber(2);
      if (player) {
        engineRef.current.setInput(player.id, input);
      }
    }
  }, [gameMode]);

  // 设置输入处理
  useInput(1, handlePlayer1Input, gameMode !== 'menu');
  useInput(2, handlePlayer2Input, gameMode === 'local' && playerCount === 2);

  // 暂停处理
  const handlePause = useCallback(() => {
    if (engineRef.current && gameMode !== 'menu') {
      const state = engineRef.current.getState();
      if (state.status === 'playing') {
        engineRef.current.pause();
      } else if (state.status === 'paused') {
        engineRef.current.resume();
      }
    }
  }, [gameMode]);

  // 重启处理
  const handleRestart = useCallback(() => {
    if (engineRef.current && gameMode !== 'menu') {
      const state = engineRef.current.getState();
      if (state.status === 'gameover' || state.status === 'victory') {
        engineRef.current.restart();
      }
    }
  }, [gameMode]);

  useGlobalKeys(handlePause, handleRestart);

  // 开始游戏
  const handleStartGame = useCallback((count: 1 | 2, isOnline: boolean, room?: string) => {
    if (!engineRef.current) return;

    setPlayerCount(count);

    if (isOnline && room) {
      setGameMode('online');
      setRoomId(room);
      setOnlineStatus('connecting');

      // 连接到服务器 - 生产环境使用同一域名，开发环境使用 localhost:3001
      const serverUrl = process.env.NODE_ENV === 'production'
        ? window.location.origin
        : 'http://localhost:3001';
      const socket = io(serverUrl);
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('joinRoom', { roomId: room });
      });

      socket.on('roomJoined', (data: { isHost: boolean; playerNumber: 1 | 2; roomId: string }) => {
        console.log('Room joined:', data);
        isHostRef.current = data.isHost;
        setMyPlayerNumber(data.playerNumber);

        if (data.isHost) {
          // 房主等待其他玩家加入
          setOnlineStatus('waiting');
        } else {
          // 客户端已连接，等待房主开始
          setOnlineStatus('ready');
        }
      });

      socket.on('playerJoined', (data: { playerNumber: number }) => {
        console.log('Player joined:', data);
        // 有玩家加入，房主可以开始了
        setOnlineStatus('ready');
      });

      socket.on('gameStarted', () => {
        console.log('Game started by host');
        setOnlineStatus('playing');
        // 客户端不启动自己的游戏循环，只接收状态
      });

      socket.on('gameState', (data: { state: GameState; level: Level | null }) => {
        // 客户端接收并更新游戏状态
        if (!isHostRef.current && engineRef.current) {
          engineRef.current.setState(data.state);
          currentLevelRef.current = data.level;
          setGameState({ ...data.state });
        }
      });

      socket.on('input', (data: { playerNumber: number; input: InputState }) => {
        // 房主接收客户端的输入
        if (isHostRef.current && engineRef.current) {
          const player = engineRef.current.getPlayerByNumber(data.playerNumber as 1 | 2);
          if (player) {
            engineRef.current.setInput(player.id, data.input);
          }
        }
      });

      socket.on('playerLeft', () => {
        console.log('Other player left');
        setOnlineStatus('waiting');
      });

      socket.on('roomFull', () => {
        alert('Room is full!');
        socket.disconnect();
        setGameMode('menu');
        setOnlineStatus('disconnected');
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
        setOnlineStatus('disconnected');
      });
    } else {
      // 本地游戏
      setGameMode('local');
      engineRef.current.startGame(count);
      startLoop();
      setGameState({ ...engineRef.current.getState() });
    }
  }, [startLoop]);

  // 房主点击开始游戏
  const handleHostStartGame = useCallback(() => {
    if (!engineRef.current || !socketRef.current) return;

    // 开始2人游戏
    engineRef.current.startGame(2);
    startLoop();
    setGameState({ ...engineRef.current.getState() });
    setOnlineStatus('playing');

    // 通知客户端游戏开始
    socketRef.current.emit('startGame');
  }, [startLoop]);

  // 返回主菜单
  const handleBackToMenu = useCallback(() => {
    stopLoop();
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    isHostRef.current = false;
    setGameMode('menu');
    setGameState(null);
    setOnlineStatus('disconnected');
    setRoomId('');
  }, [stopLoop]);

  // 渲染等待界面
  const renderWaitingScreen = () => (
    <div
      style={{
        width: 768,
        height: 672,
        backgroundColor: '#1a1a2e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Press Start 2P", monospace',
        border: '4px solid #444',
        borderRadius: '8px',
        color: '#ffffff'
      }}
    >
      <div style={{ fontSize: 20, marginBottom: 30 }}>ONLINE MODE</div>

      <div style={{ fontSize: 14, marginBottom: 20 }}>
        Room: <span style={{ color: '#ffff44' }}>{roomId}</span>
      </div>

      {onlineStatus === 'connecting' && (
        <div style={{ fontSize: 12, color: '#aaa' }}>Connecting...</div>
      )}

      {onlineStatus === 'waiting' && isHostRef.current && (
        <>
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 20 }}>
            Waiting for player 2 to join...
          </div>
          <div style={{ fontSize: 10, color: '#888' }}>
            Share this room code with a friend
          </div>
        </>
      )}

      {onlineStatus === 'ready' && (
        <>
          <div style={{ fontSize: 12, color: '#44ff44', marginBottom: 20 }}>
            {isHostRef.current ? 'Player 2 joined!' : 'Connected! Waiting for host to start...'}
          </div>
          {isHostRef.current && (
            <button
              onClick={handleHostStartGame}
              style={{
                padding: '12px 24px',
                fontSize: 12,
                fontFamily: '"Press Start 2P", monospace',
                backgroundColor: '#22dd66',
                color: '#ffffff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                marginBottom: 15
              }}
            >
              START GAME
            </button>
          )}
        </>
      )}

      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 10, color: '#888' }}>
          You are: Player {myPlayerNumber} {isHostRef.current ? '(Host)' : '(Guest)'}
        </div>
      </div>

      <button
        onClick={handleBackToMenu}
        style={{
          padding: '10px 20px',
          fontSize: 10,
          fontFamily: '"Press Start 2P", monospace',
          backgroundColor: '#666',
          color: '#ffffff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          marginTop: 30
        }}
      >
        BACK TO MENU
      </button>
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#0a0a1a',
        padding: 20
      }}
    >
      {gameMode === 'menu' ? (
        <MainMenu onStartGame={handleStartGame} />
      ) : gameMode === 'online' && onlineStatus !== 'playing' ? (
        renderWaitingScreen()
      ) : (
        <>
          {gameState && (
            <GameCanvas
              gameState={gameState}
              level={currentLevelRef.current}
            />
          )}

          {/* 游戏信息面板 */}
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              gap: 20,
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 10,
              color: '#888'
            }}
          >
            <span>LEVEL: {gameState?.currentLevel || 1}</span>
            {gameMode === 'online' && (
              <span>
                ONLINE: {roomId} (P{myPlayerNumber})
              </span>
            )}
            <button
              onClick={handleBackToMenu}
              style={{
                padding: '4px 12px',
                fontSize: 10,
                fontFamily: '"Press Start 2P", monospace',
                backgroundColor: '#333',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              MENU
            </button>
          </div>

          {/* 操作说明 */}
          <div
            style={{
              marginTop: 16,
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 8,
              color: '#666',
              textAlign: 'center'
            }}
          >
            <div>P1: WASD/Arrows to move | J/Space to jump | K/L to attack</div>
            {playerCount === 2 && gameMode === 'local' && (
              <div>P2: Numpad 4/6/8/5 to move | Numpad 0/. to jump | NumpadDec/, to attack</div>
            )}
            <div style={{ marginTop: 5 }}>ESC: Pause | ENTER: Restart (when game over)</div>
          </div>
        </>
      )}
    </div>
  );
};

export default Game;
