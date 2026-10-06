import React from 'react';
import MovieCard from './MovieCard';
import { Sparkles } from 'lucide-react';

export default function RecommendationRow({ title, subtitle, items = [], onRated, loading = false }) {
  if (loading) {
    return (
      <div style={{ marginBottom: '40px' }}>
        <div className="skeleton" style={{ width: '220px', height: '28px', marginBottom: '16px' }} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton" style={{ height: '360px', borderRadius: '14px' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: '44px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#818cf8" />
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
        gap: '22px'
      }}>
        {items.map((movie) => (
          <MovieCard
            key={movie.movie_id}
            movie={movie}
            onRated={onRated}
          />
        ))}
      </div>
    </div>
  );
}
