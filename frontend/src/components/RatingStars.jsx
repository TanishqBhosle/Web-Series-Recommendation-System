import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ initialRating = 0, onRate, readOnly = false, size = 18 }) {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(initialRating);

  const handleClick = (val) => {
    if (readOnly) return;
    setCurrentRating(val);
    if (onRate) onRate(val);
  };

  const displayRating = hoverRating || currentRating;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((starVal) => {
        const isFilled = displayRating >= starVal;
        const isHalf = !isFilled && displayRating >= starVal - 0.5;

        return (
          <button
            key={starVal}
            type="button"
            disabled={readOnly}
            onClick={() => handleClick(starVal)}
            onMouseEnter={() => !readOnly && setHoverRating(starVal)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '2px',
              cursor: readOnly ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isFilled || isHalf ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)',
              transition: 'transform 0.15s ease',
              transform: !readOnly && hoverRating === starVal ? 'scale(1.2)' : 'scale(1)'
            }}
            title={readOnly ? `${currentRating} / 5` : `Rate ${starVal} stars`}
          >
            <Star
              size={size}
              fill={isFilled ? '#fbbf24' : (isHalf ? 'rgba(251, 191, 36, 0.5)' : 'none')}
              strokeWidth={1.8}
            />
          </button>
        );
      })}
      {currentRating > 0 && (
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fbbf24', marginLeft: '4px' }}>
          {currentRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
