import React, { useState, useEffect } from 'react';
import { BattleScreen } from './components/BattleScreen';
import { DeckSelector } from './components/DeckSelector';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
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
  const [status, setStatus] = useState('login'); // login, signup, lobby, deck_select, waiting, playing, profile
  const [isSinglePlayer, setIsSinglePlayer] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [user, setUser] = useState(null); // Logged in user info

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
      window.location.reload();
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
  };

  const handleJoinClick = () => {
    if (!roomId.trim()) {
      alert('방 번호를 입력해주세요!');
      return;
    }
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

    const sendDeckSelection = () => {
      if (isSinglePlayer) {
        console.log("start_single_player emit with deck:", deck, "difficulty:", difficulty);
        socket.emit("start_single_player", {
          deck,
          difficulty,
          username: user ? user.username : 'Guest'
        });
      } else {
        const id = String(roomId).trim();
        console.log("join_game emit:", id, "with deck:", deck);
        socket.emit("join_game", {
          roomId: id,
          deck,
          username: user ? user.username : 'Guest'
        });
      }
    };

    if (!socket.connected) {
      socket.connect();
      socket.once('connect', () => {
        sendDeckSelection();
      });
    } else {
      sendDeckSelection();
    }
  };

  if (status === 'login') {
    return <Login onLogin={handleLogin} onNavigate={() => setStatus('signup')} />;
  }

  if (status === 'signup') {
    return <Signup onNavigate={() => setStatus('login')} />;
  }

  if (status === 'profile') {
    return <Profile username={user.username} onBack={() => setStatus('lobby')} />;
  }

  if (status === 'playing' && gameState) {
    return (
      <BattleScreen
        gameState={gameState}
        playerId={playerId}
        socket={socket}
      />
    );
  }

  if (status === 'deck_select') {
    return <DeckSelector onDeckSelected={handleDeckSelected} />;
  }

  if (status === 'waiting') {
    return (
      <div className="lobby">
        <h1>Waiting for opponent...</h1>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="status-bar">
        Status: {isConnected ? 'Connected' : 'Disconnected'}
        {user && (
          <div className="user-info">
            <span>환영합니다, {user.username}님!</span>
            <button onClick={() => setStatus('profile')}>내 전적</button>
            <button onClick={handleLogout}>로그아웃</button>
          </div>
        )}
      </div>

      {status === 'lobby' && (
        <div className="lobby">
          <h1>Clash Royale Web</h1>
          <div className="join-form">
            <input
              type="text"
              placeholder="방 번호 입력 (예: 123)"
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
              style={{ padding: '10px', fontSize: '16px', width: '250px' }}
            />
            <button
              onClick={handleJoinClick}
              disabled={!roomId.trim()}
              style={{
                padding: '10px',
                fontSize: '16px',
                cursor: roomId.trim() ? 'pointer' : 'not-allowed',
                backgroundColor: roomId.trim() ? '#3498db' : '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
              }}
            >
              멀티플레이 참가
            </button>
          </div>

          <div className="single-player-section" style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ color: '#333', marginBottom: '15px' }}>싱글 플레이 (AI 대전)</h2>

            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <label style={{ fontWeight: 'bold', color: '#555' }}>난이도:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={{
                  padding: '8px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  fontSize: '14px'
                }}
              >
                <option value="easy">쉬움 (Easy)</option>
                <option value="medium">보통 (Medium)</option>
                <option value="hard">어려움 (Hard)</option>
                <option value="impossible">불가능 (Impossible)</option>
              </select>
            </div>

            <button
              onClick={handleSinglePlayerClick}
              style={{
                backgroundColor: '#2ecc71',
                color: 'white',
                padding: '12px 24px',
                fontSize: '16px',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
            >
              게임 시작
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
