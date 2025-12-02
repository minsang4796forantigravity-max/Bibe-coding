import React, { useState, useEffect } from 'react';
import { BattleScreen } from './components/BattleScreen';
import { DeckSelector } from './components/DeckSelector';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import CardUpgrade from './components/CardUpgrade';
import { socket } from './socket';
import './App.css';

const ACCESS_PASSWORD = "000";

function checkAccessPassword() {
  const input = prompt("입장 비밀번호를 입력하세요:");
  if (input !== ACCESS_PASSWORD) {
    alert("비밀번호가 틀렸습니다.");
    window.location.href = "https://www.google.com";
  }
}

checkAccessPassword();

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [gameState, setGameState] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [status, setStatus] = useState('login');
  const [activeTab, setActiveTab] = useState('play'); // play, cards, leaderboard
  const [isSinglePlayer, setIsSinglePlayer] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [user, setUser] = useState(null);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onGameStart({ state, player }) {
      setGameState(state);
      setPlayerId(player);
      setStatus('playing');
    }

    function onGameUpdate(state) {
      setGameState(state);
    }

    function onGameOver({ winner }) {
      alert(`${winner} Wins!`);
      setGameState(null);
      setPlayerId(null);
      setStatus('lobby');
      setSelectedDeck(null);
      setIsSinglePlayer(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('game_start', onGameStart);
    socket.on('game_update', onGameUpdate);
    socket.on('game_over', onGameOver);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('game_start', onGameStart);
      socket.off('game_update', onGameUpdate);
      socket.off('game_over', onGameOver);
      socket.disconnect();
    };
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setStatus('lobby');
  };

  const handleLogout = () => {
    setUser(null);
    setStatus('login');
    setRoomId('');
    setIsSinglePlayer(false);
  };

  const handleJoinClick = () => {
    if (!roomId.trim()) return;
    setIsSinglePlayer(false);
    setStatus('deck_select');
  };

  const handleSinglePlayerClick = () => {
    setIsSinglePlayer(true);
    setStatus('deck_select');
  };

  const handleDeckSelected = (deck) => {
    setSelectedDeck(deck);
    setStatus('waiting');

    if (isSinglePlayer) {
      socket.emit('start_single_player', {
        deck,
        difficulty,
        username: user ? user.username : 'Guest'
      });
    } else {
      socket.emit('join_game', {
        roomId,
        username: user ? user.username : 'Guest',
        deck
      });
    }
  };

  // Render different screens
  if (status === 'login') {
    return <Login onLogin={handleLogin} onNavigate={() => setStatus('signup')} />;
  }

  if (status === 'signup') {
    return <Signup onNavigate={() => setStatus('login')} />;
  }

  if (status === 'profile') {
    return <Profile username={user.username} onBack={() => setStatus('lobby')} />;
  }

  if (status === 'playing' && gameState && playerId) {
    return (
      <BattleScreen
        gameState={gameState}
        playerId={playerId}
        socket={socket}
      />
    );
  }

  if (status === 'deck_select') {
    return <DeckSelector onDeckSelected={handleDeckSelected} username={user ? user.username : null} />;
  }

  if (status === 'waiting') {
    return (
      <div className="app-container">
        <div className="lobby">
          <h1>⏳ Waiting for opponent...</h1>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // Main lobby with tabs
  return (
    <div className="app-container">
      {/* Background particles */}
      <div className="background-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Status indicator */}
      <div className="status-indicator">
        <div className={`status-dot ${!isConnected ? 'disconnected' : ''}`}></div>
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>

      <div className="lobby">
        <h1>⚔️ Clash Royale Web</h1>

        {/* User info header */}
        {user && (
          <div className="user-info-header">
            <div className="user-info">
              👋 환영합니다, <strong>{user.username}</strong>님!
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="logout-button" onClick={() => setStatus('profile')}>
                📊 내 전적
              </button>
              <button className="logout-button" onClick={handleLogout}>
                🚪 로그아웃
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'play' ? 'active' : ''}`}
            onClick={() => setActiveTab('play')}
          >
            🎮 플레이
          </button>
          <button
            className={`tab-button ${activeTab === 'cards' ? 'active' : ''}`}
            onClick={() => setActiveTab('cards')}
          >
            🃏 카드 업그레이드
          </button>
          <button
            className={`tab-button ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            🏆 랭킹
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'play' && (
            <div>
              {/* Multiplayer Section */}
              <div className="section-card">
                <h3>🌐 멀티플레이어</h3>
                <div className="join-form">
                  <input
                    type="text"
                    placeholder="방 번호 입력 (예: 123)"
                    value={roomId}
                    onChange={e => setRoomId(e.target.value)}
                  />
                  <button
                    onClick={handleJoinClick}
                    disabled={!roomId.trim()}
                    className="primary-button"
                    style={{
                      backgroundColor: roomId.trim() ? '#3498db' : '#95a5a6',
                      color: 'white'
                    }}
                  >
                    방 참가하기
                  </button>
                </div>
              </div>

              {/* Single Player Section */}
              <div className="single-player-section">
                <h2>🤖 싱글 플레이 (AI 대전)</h2>

                <div className="difficulty-selector">
                  <label>난이도:</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="easy">😊 쉬움 (Easy)</option>
                    <option value="medium">😐 보통 (Medium)</option>
                    <option value="hard">😰 어려움 (Hard)</option>
                    <option value="impossible">💀 불가능 (Impossible)</option>
                  </select>
                </div>

                <button
                  onClick={handleSinglePlayerClick}
                  className="primary-button"
                  style={{
                    backgroundColor: '#2ecc71',
                    color: 'white',
                    width: '100%'
                  }}
                >
                  ▶️ 게임 시작
                </button>
              </div>
            </div>
          )}

          {activeTab === 'cards' && (
            <CardUpgrade username={user ? user.username : ''} />
          )}

          {activeTab === 'leaderboard' && (
            <div>
              <Leaderboard currentUsername={user ? user.username : ''} limit={10} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
