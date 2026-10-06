import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import MovieCard from '../components/MovieCard';
import { Star, Sparkles, Layers, Users, Zap, ArrowLeft, Check } from 'lucide-react';

export default function MovieDetails() {
  const { id } = useParams();
  const { user, incrementRatingCount } = useAuth();
  const [movie, setMovie] = useState(null);
  const [similarTitles, setSimilarTitles] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const movieRes = await api.getMovieById(id);
      setMovie(movieRes);
      setUserRating(movieRes.user_rating || 0);

      // Fetch similar titles from hybrid recommender
      const recsRes = await api.getSimilarTitles(id, 6);
      setSimilarTitles(recsRes.recommendations || []);
      setMeta(recsRes.meta || null);
    } catch (err) {
      console.error("Failed to load movie details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const handleRate = async (val) => {
    try {
      await api.submitRating(id, val);
      setUserRating(val);
      setRatingSuccess(true);
      incrementRatingCount();
      setTimeout(() => setRatingSuccess(false), 3000);
    } catch (err) {
      alert(err.message || "Failed to submit rating.");
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px' }}>
        <div className="skeleton" style={{ height: '400px', borderRadius: '20px', marginBottom: '40px' }} />
        <div className="skeleton" style={{ height: '40px', width: '250px', marginBottom: '20px' }} />
      </div>
    );
  }

  if (!movie) {
    return (
      <div style={{ maxWidth: '800px', margin: '80px auto', textAlign: 'center', padding: '24px' }}>
        <h2>Title Not Found</h2>
        <Link to="/explore" className="btn-primary" style={{ marginTop: '16px' }}>
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 24px 80px' }}>
      {/* Back button */}
      <Link
        to="/explore"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          marginBottom: '20px'
        }}
      >
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      {/* Main Hero Card */}
      <div className="glass-panel" style={{
        padding: '36px',
        borderRadius: '20px',
        marginBottom: '50px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '40px',
        alignItems: 'center'
      }}>
        {/* Left: Poster */}
        <div style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          maxHeight: '480px'
        }}>
          <img
            src={movie.poster_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80"}
            alt={movie.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Right: Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-primary">ID #{movie.movie_id}</span>
              {meta?.cold_start_applied ? (
                <span className="badge badge-amber">Cold-Start CBF Applied</span>
              ) : (
                <span className="badge badge-success">Hybrid Fusion Active</span>
              )}
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2 }}>
              {movie.title}
            </h1>
          </div>

          {/* Genres */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {movie.genres_list?.map((g, i) => (
              <span key={i} style={{
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                {g}
              </span>
            ))}
          </div>

          {/* Overview */}
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            {movie.overview || "An exceptional web series featured in the recommendation catalog."}
          </p>

          {/* Interactive Rating Section */}
          <div style={{
            background: 'rgba(7, 10, 18, 0.5)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginTop: '8px'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Rate this Web Series:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <RatingStars
                initialRating={userRating}
                onRate={handleRate}
                size={22}
              />
              {ratingSuccess && (
                <span style={{ color: '#6ee7b7', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={16} /> Rating recorded!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Titles Section */}
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={24} color="#818cf8" />
            Similar Titles Recommended by Hybrid Engine
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '4px' }}>
            Computed via 50% Content TF-IDF + 50% Collaborative Pearson Correlation (or dynamic cold-start override).
          </p>
        </div>

        {similarTitles.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
            gap: '22px'
          }}>
            {similarTitles.map((sim) => (
              <MovieCard
                key={sim.movie_id}
                movie={sim}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No immediate similar titles found. Place your Google Colab artifacts in backend/artifacts/ to enable full matrix calculations.
          </div>
        )}
      </div>
    </div>
  );
}
