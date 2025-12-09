import React, { useState } from 'react';
import { GAME_WIDTH, GAME_HEIGHT, SCALE } from '../types/game';

interface MainMenuProps {
  onStartGame: (playerCount: 1 | 2, isOnline: boolean, roomId?: string) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [showOnlineOptions, setShowOnlineOptions] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleLocalGame = (playerCount: 1 | 2) => {
    onStartGame(playerCount, false);
  };

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(newRoomId);
    setIsCreating(true);
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      onStartGame(2, true, roomId.trim().toUpperCase());
    }
  };

  const handleStartOnlineGame = () => {
    onStartGame(2, true, roomId);
  };

  return (
    <div
      style={{
        width: GAME_WIDTH * SCALE,
        height: GAME_HEIGHT * SCALE,
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
      {/* 标题 */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1
          style={{
            fontSize: 32,
            color: '#87ceeb',
            textShadow: '3px 3px 0 #4444ff, 6px 6px 0 #222',
            margin: 0
          }}
        >
          SNOW
        </h1>
        <h1
          style={{
            fontSize: 32,
            color: '#ffffff',
            textShadow: '3px 3px 0 #888, 6px 6px 0 #222',
            margin: 0
          }}
        >
          BROTHERS
        </h1>
      </div>

      {/* 雪人装饰 */}
      <div style={{ fontSize: 48, marginBottom: 30 }}>
        ⛄
      </div>

      {!showOnlineOptions ? (
        <>
          {/* 本地游戏按钮 */}
          <button
            onClick={() => handleLocalGame(1)}
            style={buttonStyle}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4488ff')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2266dd')}
          >
            1 PLAYER
          </button>

          <button
            onClick={() => handleLocalGame(2)}
            style={buttonStyle}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#44ff88')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#22dd66')}
          >
            2 PLAYERS (LOCAL)
          </button>

          <button
            onClick={() => setShowOnlineOptions(true)}
            style={{ ...buttonStyle, backgroundColor: '#dd6622' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ff8844')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dd6622')}
          >
            ONLINE
          </button>
        </>
      ) : (
        <>
          {!isCreating ? (
            <>
              <button
                onClick={handleCreateRoom}
                style={buttonStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4488ff')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2266dd')}
              >
                CREATE ROOM
              </button>

              <div style={{ margin: '20px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 12, marginBottom: 10 }}>OR JOIN:</div>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="ROOM ID"
                  maxLength={6}
                  style={{
                    padding: '10px 15px',
                    fontSize: 14,
                    fontFamily: '"Press Start 2P", monospace',
                    backgroundColor: '#333',
                    border: '2px solid #666',
                    borderRadius: 4,
                    color: '#fff',
                    textAlign: 'center',
                    width: 120
                  }}
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={!roomId.trim()}
                  style={{
                    ...buttonStyle,
                    marginLeft: 10,
                    padding: '10px 15px',
                    opacity: roomId.trim() ? 1 : 0.5
                  }}
                >
                  JOIN
                </button>
              </div>

              <button
                onClick={() => setShowOnlineOptions(false)}
                style={{ ...buttonStyle, backgroundColor: '#666' }}
              >
                BACK
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 14, marginBottom: 20 }}>ROOM CREATED!</div>
              <div
                style={{
                  fontSize: 24,
                  color: '#ffff44',
                  marginBottom: 20,
                  letterSpacing: 4
                }}
              >
                {roomId}
              </div>
              <div style={{ fontSize: 10, marginBottom: 30, color: '#aaa' }}>
                Share this code with a friend
              </div>

              <button
                onClick={handleStartOnlineGame}
                style={buttonStyle}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#44ff88')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#22dd66')}
              >
                START GAME
              </button>

              <button
                onClick={() => {
                  setIsCreating(false);
                  setRoomId('');
                }}
                style={{ ...buttonStyle, backgroundColor: '#666', marginTop: 10 }}
              >
                CANCEL
              </button>
            </>
          )}
        </>
      )}

      {/* 操作说明 */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          fontSize: 8,
          color: '#888',
          textAlign: 'center'
        }}
      >
        <div>P1: WASD + J/K | P2: ARROWS + ./,</div>
        <div style={{ marginTop: 5 }}>ESC: Pause</div>
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '12px 24px',
  fontSize: 12,
  fontFamily: '"Press Start 2P", monospace',
  backgroundColor: '#2266dd',
  color: '#ffffff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  marginBottom: 15,
  minWidth: 200,
  transition: 'background-color 0.2s'
};

export default MainMenu;
