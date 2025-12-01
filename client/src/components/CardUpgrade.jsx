import React, { useState, useEffect } from 'react';
import { API_URL } from '../socket';
import { UNITS } from '../game/constants';
import './CardUpgrade.css';

const CardUpgrade = ({ username }) => {
    const [cardLevels, setCardLevels] = useState({});
    const [coins, setCoins] = useState(500);
    const [loading, setLoading] = useState(true);
    const [selectedCard, setSelectedCard] = useState(null);

    useEffect(() => {
        fetchCardLevels();
    }, [username]);

    const fetchCardLevels = async () => {
        try {
            const response = await fetch(`${API_URL}/api/cards/${username}`);
            if (response.ok) {
                const data = await response.json();
                setCardLevels(data.cardLevels || {});
                setCoins(data.coins || 500);
            }
        } catch (error) {
            console.error('Error fetching card levels:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCardLevel = (cardId) => {
        return cardLevels[cardId] || 1;
    };

    const getLevelUpCost = (currentLevel) => {
        if (currentLevel >= 10) return null;
        return 100 * Math.pow(2, currentLevel - 1);
    };

    const handleLevelUp = async (cardId) => {
        const currentLevel = getCardLevel(cardId);
        const cost = getLevelUpCost(currentLevel);

        if (!cost || coins < cost) return;

        try {
            const response = await fetch(`${API_URL}/api/cards/level-up`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, cardId })
            });

            if (response.ok) {
                const data = await response.json();
                setCardLevels(prev => ({ ...prev, [cardId]: data.newLevel }));
                setCoins(data.coinsRemaining);
                alert(`✅ ${UNITS[cardId.toUpperCase()].name} 레벨 ${data.newLevel}로 업그레이드 완료!`);
            } else {
                const error = await response.json();
                alert(`❌ ${error.message}`);
            }
        } catch (error) {
            console.error('Error leveling up card:', error);
            alert('❌ 업그레이드 실패');
        }
    };

    const getStatBonus = (level) => {
        return (level - 1) * 8; // 8% per level
    };

    if (loading) {
        return <div className="card-upgrade-loading">Loading...</div>;
    }

    // Filter only playable cards (not TOWER)
    const playableCards = Object.keys(UNITS).filter(key => key !== 'TOWER');

    return (
        <div className="card-upgrade-container">
            <div className="upgrade-header">
                <h2>🃏 카드 업그레이드</h2>
                <div className="coins-display">
                    <span className="coin-icon">💰</span>
                    <span className="coin-amount">{coins.toLocaleString()}</span>
                    <span className="coin-label">코인</span>
                </div>
            </div>

            <div className="upgrade-info">
                <p>💡 레벨당 HP와 공격력이 <strong>8%</strong> 증가합니다!</p>
                <p>📈 최대 레벨: <strong>10</strong></p>
            </div>

            <div className="cards-grid">
                {playableCards.map(cardKey => {
                    const card = UNITS[cardKey];
                    const cardId = card.id;
                    const level = getCardLevel(cardId);
                    const cost = getLevelUpCost(level);
                    const statBonus = getStatBonus(level);
                    const canAfford = cost && coins >= cost;
                    const isMaxLevel = level >= 10;

                    return (
                        <div
                            key={cardId}
                            className={`card-item ${selectedCard === cardId ? 'selected' : ''}`}
                            onClick={() => setSelectedCard(cardId)}
                        >
                            <div className="card-header">
                                <span className="card-name">{card.name}</span>
                                <span className="card-cost">{card.cost} 💧</span>
                            </div>

                            <div className="card-level">
                                <span className="level-label">Level</span>
                                <span className="level-value">{level}</span>
                                <div className="level-bar">
                                    <div
                                        className="level-fill"
                                        style={{ width: `${(level / 10) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {statBonus > 0 && (
                                <div className="stat-bonus">
                                    +{statBonus}% HP & Damage
                                </div>
                            )}

                            {isMaxLevel ? (
                                <div className="max-level-badge">
                                    ⭐ MAX LEVEL
                                </div>
                            ) : (
                                <button
                                    className={`upgrade-button ${!canAfford ? 'disabled' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLevelUp(cardId);
                                    }}
                                    disabled={!canAfford}
                                >
                                    {canAfford ? (
                                        <>
                                            <span>⬆️ 업그레이드</span>
                                            <span className="cost">💰 {cost?.toLocaleString()}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>코인 부족</span>
                                            <span className="cost">💰 {cost?.toLocaleString()}</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CardUpgrade;
