import React, { useState, useEffect } from 'react';
import { BattleScreen } from './components/BattleScreen';
import { DeckSelector } from './components/DeckSelector';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import { Lobby } from './components/Lobby';
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
      // Return to lobby instead of reloading to keep login state
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

  // Auto-login on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('bibeGameUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setStatus('lobby');
      } catch (e) {
        console.error('Failed to parse saved user:', e);
        localStorage.removeItem('bibeGameUser');
      }
    }
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setStatus('lobby');
  };

  const handleLogout = () => {
    setUser(null);
    setStatus('login');
    localStorage.removeItem('bibeGameUser'); // Clear saved session
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
    return <DeckSelector onDeckSelected={handleDeckSelected} username={user ? user.username : null} />;
  }

  if (status === 'waiting') {
    return (
      <div className="lobby">
        return (
        <div className="App" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
          {status === 'lobby' && (
            <Lobby
              user={user}
              roomId={roomId}
              setRoomId={setRoomId}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              onJoinClick={handleJoinClick}
              onSinglePlayerClick={handleSinglePlayerClick}
              onProfileClick={() => setStatus('profile')}
              onLogout={handleLogout}
            />
          )}

          {status === 'waiting' && (
            <div style={{
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1a1c2c 0%, #4a192c 100%)',
              color: 'white'
            }}>
              <div className="spinner" style={{ marginBottom: '20px' }}></div>
              <h1>Searching for opponent...</h1>
              <button onClick={() => setStatus('lobby')} style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                borderRadius: '5px'
              }}>Cancel</button>
            </div>
          )}
        </div>
        );
}

        export default App;
