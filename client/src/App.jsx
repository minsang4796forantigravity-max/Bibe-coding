import React, { useState, useEffect } from 'react';
import { BattleScreen } from './components/BattleScreen';
import { DeckSelector } from './components/DeckSelector';
import { socket } from './socket';
import './App.css';

// 최상단에 넣기 (import 위는 안됨)
const ACCESS_PASSWORD = "000";

// 페이지 로드 시 비밀번호 확인
function checkAccessPassword() {
  const input = prompt("입장 비밀번호를 입력하세요:");
  if (input !== ACCESS_PASSWORD) {
    alert("비밀번호가 틀렸습니다.");
    window.location.href = "https://www.google.com"; // 돌려보냄
  }
}

// 한 번만 실행
checkAccessPassword();

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [gameState, setGameState] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [status, setStatus] = useState('lobby'); // lobby, deck_select, waiting, playing
  const [isSinglePlayer, setIsSinglePlayer] = useState(false);

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

    if (!socket.connected) {
      socket.connect();
    }

    if (isSinglePlayer) {
      console.log("start_single_player emit with deck:", deck);
      socket.emit("start_single_player", deck);
      // No waiting state needed really, but game_start will come quickly
    } else {
      const id = String(roomId).trim();
      console.log("join_game emit:", id, "with deck:", deck);
      socket.emit("join_game", id, deck);
      setStatus("waiting");
    }
  };

  const handleDeploy = (cardId, x, y) => {
    socket.emit('deploy_card', { cardId, x, y });
  };

  if (status === 'playing' && gameState) {
    return <BattleScreen gameState={gameState} playerId={playerId} onDeploy={handleDeploy} />;
  }

  if (status === 'deck_select') {
    return <DeckSelector onDeckSelected={handleDeckSelected} />;
  }

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px' }}>
      <h1>Battle Cards Online</h1>
      <div style={{ color: isConnected ? 'green' : 'red' }}>
        Server: {isConnected ? 'Connected' : 'Disconnected'}
      </div>

      {status === 'lobby' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

          <div style={{ margin: '10px 0', borderTop: '1px solid #ccc' }}></div>

          <button
            onClick={handleSinglePlayerClick}
            style={{
              padding: '10px',
              fontSize: '16px',
              cursor: 'pointer',
              backgroundColor: '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
            }}
          >
            싱글 플레이 (AI 대전)
          </button>
        </div>
      )}

      {status === 'waiting' && (
        <div style={{ textAlign: 'center' }}>
          <h2>상대를 기다리는 중...</h2>
          <p style={{ fontSize: '18px', color: '#f39c12' }}>방 번호: {roomId}</p>
          <p style={{ color: '#2ecc71' }}>✓ {selectedDeck?.length || 0}장 선택 완료</p>
        </div>
      )}
    </div>
  );
}

export default App;
