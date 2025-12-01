import React from 'react';
import { RATING_TIERS } from '../game/constants';

const TierBadge = ({ rating, showName = true, size = 'medium' }) => {
    // Find current tier
    let currentTier = RATING_TIERS[0];
    for (let i = RATING_TIERS.length - 1; i >= 0; i--) {
        if (rating >= RATING_TIERS[i].min) {
            currentTier = RATING_TIERS[i];
            break;
        }
    }

    const sizeStyles = {
        small: { fontSize: '10px', padding: '2px 6px' },
        medium: { fontSize: '12px', padding: '4px 8px' },
        large: { fontSize: '14px', padding: '6px 12px' }
    };

    const style = {
        backgroundColor: currentTier.color,
        color: ['Silver', 'Platinum', 'Diamond'].includes(currentTier.name) ? '#333' : '#fff',
        borderRadius: '12px',
        fontWeight: 'bold',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        textTransform: 'uppercase',
        ...sizeStyles[size]
    };

    // Text shadow for better readability on light colors
    if (['Silver', 'Platinum', 'Diamond'].includes(currentTier.name)) {
        style.textShadow = 'none';
    } else {
        style.textShadow = '0 1px 2px rgba(0,0,0,0.3)';
    }

    return (
        <span className="tier-badge" style={style} title={`Rating: ${rating}`}>
            {showName ? currentTier.name : ''}
        </span>
    );
};

export default TierBadge;
