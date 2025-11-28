import React, { useEffect, useState, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';
import { PlayerView } from './PlayerView';

export function SplitScreenBattle() {
    const [gameState, setGameState] = useState(null);
    const engineRef = useRef(null);

    useEffect(() => {
        const engine = new GameEngine((newState) => {
            setGameState(newState);
        });
        engineRef.current = engine;
        engine.start();

        return () => {
            engine.stop();
        };
    }, []);

    const handleDeploy = (playerId, cardId, x, y) => {
        if (engineRef.current) {
            engineRef.current.spawnUnit(playerId, cardId, x, y);
        }
    };

    if (!gameState) return <div>Loading...</div>;

    if (gameState.gameOver) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                backgroundColor: '#222',
                color: 'white',
            }}>
                <h1>Game Over!</h1>
                <h2>{gameState.winner} Wins!</h2>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '10px 20px',
                        fontSize: '20px',
                        marginTop: '20px',
                        cursor: 'pointer',
                    }}
                >
                    Play Again
                </button>
            </div>
        );
    }

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'black' }}>
            {/* Player 2 (Top, Rotated) */}
            <PlayerView
                playerId="p2"
                gameState={gameState}
                onDeploy={handleDeploy}
                isRotated={true}
            />

            {/* Separator */}
            <div style={{ height: '2px', backgroundColor: '#555' }}></div>

            {/* Player 1 (Bottom) */}
            <PlayerView
                playerId="p1"
                gameState={gameState}
                onDeploy={handleDeploy}
                isRotated={false}
            />
        </div>
    );
}
