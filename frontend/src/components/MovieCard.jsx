import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Info, Zap, Sparkles, Check } from 'lucide-react';
import RatingStars from './RatingStars';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MovieCard({ movie, onRated }) {
  const { user, incrementRatingCount } = useAuth();
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleRate = async (val) => {
    if (!user) {
      alert("Please login to submit ratings.");
      return;
    }
    try {
      setIsSubmitting(true);
      await api.submitRating(movie.movie_id, val);
      setRatingSubmitted(true);
      incrementRatingCount();
      if (onRated) onRated(movie.movie_id, val);
      setTimeout(() => setRatingSubmitted(false), 3000);
    } catch (err) {
      alert(err.message || "Failed to submit rating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Score percentage display (if recommendation score exists)
  const scorePct = movie.score !== undefined ? Math.round(movie.score * 100) : null;

  return (
    <div className="glass-panel" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100%',
      position: 'relative',
      borderRadius: '14px'
    }}>
      {/* Poster Image Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '135%', // 3:4 aspect ratio
        overflow: 'hidden',
        background: '#111827'
      }}>
        <img
          src={!imgError && movie.poster_url ? movie.poster_url : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80"}
          alt={movie.title}
          onError={() => setImgError(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
        />

        {/* Gradient shadow overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60%',
          background: 'linear-gradient(to top, rgba(7, 10, 18, 0.95), transparent)',
          pointerEvents: 'none'
        }} />

        {/* Score Badge */}
        {scorePct !== null && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(7, 10, 18, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(99, 102, 241, 0.5)',
            borderRadius: '20px',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}>
            <Sparkles size={13} color="#818cf8" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#a5b4fc' }}>
              {scorePct}% Match
            </span>
          </div>
        )}

        {/* Vote Average */}
        {movie.vote_average && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(7, 10, 18, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '20px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Star size={12} fill="#fbbf24" color="#fbbf24" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fef08a' }}>
              {movie.vote_average.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          lineHeight: '1.3',
          minHeight: '2.6em',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {movie.title}
        </h3>

        {/* Genres Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {(movie.genres_list || (movie.genres ? movie.genres.split('|') : [])).slice(0, 3).map((g, i) => (
            <span key={i} style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-muted)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {g.trim()}
            </span>
          ))}
        </div>

        {/* Recommendation Explanation */}
        {movie.explanation && (
          <p style={{
            fontSize: '0.78rem',
            color: '#a5b4fc',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '8px',
            padding: '6px 10px',
            lineHeight: '1.4'
          }}>
            <Zap size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
            {movie.explanation}
          </p>
        )}

        {/* Quick Rate & Details Actions */}
        <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>
              Your Rating:
            </span>
            <RatingStars
              initialRating={movie.user_rating || 0}
              onRate={handleRate}
              size={15}
            />
          </div>

          <Link
            to={`/movie/${movie.movie_id}`}
            className="btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              borderRadius: '8px'
            }}
          >
            <Info size={14} /> Details
          </Link>
        </div>

        {/* Toast confirmation */}
        {ratingSubmitted && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.9)',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            justifyContent: 'center',
            marginTop: '4px'
          }}>
            <Check size={14} /> Rating saved! Model updated.
          </div>
        )}
      </div>
    </div>
  );
}
