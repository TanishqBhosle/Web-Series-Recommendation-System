import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import RecommendationRow from '../components/RecommendationRow';
import { Sparkles, Flame, CheckCircle, Info, RefreshCw, Zap } from 'lucide-react';

export default function Dashboard() {
  const { user, ratingCount } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [recMeta, setRecMeta] = useState(null);
  const [popularSeries, setPopularSeries] = useState([]);
  const [seedSeries, setSeedSeries] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Time of day greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const loadRecommendations = async (seedId = null) => {
    try {
      setLoadingRecs(true);
      const res = await api.getRecommendations(8, seedId);
      setRecommendations(res.recommendations || []);
      setRecMeta(res.meta || null);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
    } finally {
      setLoadingRecs(false);
      setRefreshing(false);
    }
  };

  const loadPopular = async () => {
    try {
      setLoadingPopular(true);
      const res = await api.getMovies(1, 8);
      setPopularSeries(res.items || []);
    } catch (err) {
      console.error("Failed to load popular movies:", err);
    } finally {
      setLoadingPopular(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
    loadPopular();
  }, [user]);

  const handleRated = (movieId, val) => {
    // Refresh recommendations after rating
    loadRecommendations(movieId);
  };

  const isColdStart = ratingCount < 3;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 24px 80px' }}>
      {/* Welcome Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '6px' }}>
            {getGreeting()}, <span className="gradient-text">{user?.name || 'Explorer'}</span> 👋
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
            Your tailored stream powered by Content-Based & Collaborative Pearson similarity.
          </p>
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            loadRecommendations();
          }}
          className="btn-secondary"
          style={{ fontSize: '0.88rem', padding: '8px 16px' }}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh Recommendations
        </button>
      </div>

      {/* Cold-Start Progress or Hybrid Status Banner */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        marginBottom: '36px',
        background: isColdStart 
          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(17, 24, 39, 0.8) 100%)'
          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(17, 24, 39, 0.8) 100%)',
        border: `1px solid ${isColdStart ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: isColdStart ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isColdStart ? '#fbbf24' : '#34d399'
            }}>
              {isColdStart ? <Info size={22} /> : <Zap size={22} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: isColdStart ? '#fef08a' : '#a7f3d0' }}>
                {isColdStart
                  ? `Cold-Start Mode Active (${ratingCount} / 3 ratings completed)`
                  : 'Full Hybrid Recommender Engaged'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {isColdStart
                  ? 'Currently applying pure Content-Based Filtering (α = 1.0). Rate 3 titles below to unlock Collaborative Filtering.'
                  : `Balanced 50/50 weighting active (α = ${recMeta?.alpha ?? 0.5}). Using Pearson item-item collaborative matrices.`}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ minWidth: '180px' }}>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min((ratingCount / 3) * 100, 100)}%`,
                background: isColdStart ? '#fbbf24' : '#10b981',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recommended For You Section */}
      <RecommendationRow
        title="Recommended For You"
        subtitle={recMeta?.seed_movie_title ? `Tuned to your engagement with "${recMeta.seed_movie_title}"` : "Top recommendations selected by RecomFusion AI"}
        items={recommendations}
        onRated={handleRated}
        loading={loadingRecs}
      />

      {/* Trending / Featured Titles Row */}
      <RecommendationRow
        title="Trending & Popular Series"
        subtitle="Highly rated web series from the global catalogue"
        items={popularSeries}
        onRated={handleRated}
        loading={loadingPopular}
      />
    </div>
  );
}
