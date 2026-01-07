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
import './styles/design-system.css';

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
  const [activeDeck, setActiveDeck] = useState(null); // The deck currently in use in the lobby
  const [status, setStatus] = useState('login'); // login, signup, lobby, deck_select, waiting, playing, profile
  const [isSinglePlayer, setIsSinglePlayer] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [user, setUser] = useState(null); // Logged in user info
  const [winner, setWinner] = useState(null); // High-level game result

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
      setWinner(winner);
      setGameState(null);
      setPlayerId(null);
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
        setActiveDeck(parsedUser.activeDeck || null);
        setStatus('lobby');
      } catch (e) {
        console.error('Failed to parse saved user:', e);
        localStorage.removeItem('bibeGameUser');
      }
    }
  }, []);

  useEffect(() => {
    if (user && activeDeck) {
      const updatedUser = { ...user, activeDeck };
      localStorage.setItem('bibeGameUser', JSON.stringify(updatedUser));
    }
  }, [activeDeck, user]);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setActiveDeck(loggedInUser.activeDeck || null);
    setStatus('lobby');
    localStorage.setItem('bibeGameUser', JSON.stringify(loggedInUser));
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
    const deckToUse = activeDeck || ['knight', 'archer', 'giant', 'wizard', 'fireball', 'cannon', 'goblin', 'skeletons'];
    setIsSinglePlayer(false);
    handleDeckSelected(deckToUse);
  };

  const handleSinglePlayerClick = () => {
    const deckToUse = activeDeck || ['knight', 'archer', 'giant', 'wizard', 'fireball', 'cannon', 'goblin', 'skeletons'];
    setIsSinglePlayer(true);
    handleDeckSelected(deckToUse);
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

  if (status === 'lobby') {
    return (
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
        activeDeck={activeDeck}
        setActiveDeck={setActiveDeck}
      />
    );
  }

  if (status === 'waiting') {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div style={{ fontSize: '4rem', marginBottom: '20px', animation: 'pulse 1s infinite' }}>⚔️</div>
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.5rem' }}>SEARCHING FOR OPPONENT...</h2>
          <p style={{ opacity: 0.5, fontWeight: 'bold' }}>Arena is preparing for your arrival</p>
          <button onClick={() => setStatus('lobby')} className="premium-button" style={{ marginTop: '30px', background: 'var(--color-danger)' }}>CANCEL</button>
        </div>
      </div>
    );
  }

  // Final Game Over Modal
  if (winner) {
    const isWinner = (winner === 'p1' && playerId === 'p1') || (winner === 'p2' && playerId === 'p2');
    return (
      <div className="auth-page">
        <div className="auth-container" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '5rem', marginBottom: '20px' }}>{isWinner ? '🏆' : '💀'}</div>
          <h1 style={{ fontFamily: 'var(--font-title)', fontSize: '3rem', color: isWinner ? 'var(--color-accent)' : 'var(--color-danger)' }}>
            {isWinner ? 'VICTORY' : 'DEFEAT'}
          </h1>
          <p style={{ fontSize: '1.2rem', fontWeight: '900', margin: '20px 0', opacity: 0.8 }}>
            {isWinner ? 'YOU HAVE DOMINATED THE ARENA!' : 'TRAIN HARDER FOR THE NEXT BATTLE.'}
          </p>
          <button
            onClick={() => { setWinner(null); setStatus('lobby'); }}
            className="premium-button"
            style={{ width: '100%', padding: '20px', fontSize: '1.2rem' }}
          >
            RETURN TO LOBBY
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
