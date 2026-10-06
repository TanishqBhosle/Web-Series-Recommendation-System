import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import MovieCard from '../components/MovieCard';
import { Search, Filter, Film, X } from 'lucide-react';

export default function Explore() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await api.getMovies(page, 20, selectedGenre, searchQuery);
      setMovies(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Failed to fetch catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const g = await api.getGenres();
      setGenres(g || []);
    } catch (err) {
      console.error("Failed to load genres:", err);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [page, selectedGenre, searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMovies();
  };

  const clearFilters = () => {
    setSelectedGenre('');
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 24px 80px' }}>
      {/* Title & Description */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '6px' }}>
          Explore Series & Movies
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
          Search across the entire catalog and rate titles to train your taste vectors.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(17, 24, 39, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '8px 16px'
        }}>
          <Search size={20} color="var(--text-dim)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title, genre, keyword (e.g., 'Stranger', 'Sci-Fi', 'Crime')..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '1rem'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </form>

      {/* Genre Filter Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '16px',
        marginBottom: '28px'
      }}>
        <button
          onClick={() => {
            setSelectedGenre('');
            setPage(1);
          }}
          style={{
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: selectedGenre === '' ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
            background: selectedGenre === '' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
            color: selectedGenre === '' ? '#a5b4fc' : 'var(--text-muted)',
            whiteSpace: 'nowrap'
          }}
        >
          All Genres
        </button>

        {genres.map((g) => (
          <button
            key={g}
            onClick={() => {
              setSelectedGenre(g);
              setPage(1);
            }}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedGenre === g ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
              background: selectedGenre === g ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
              color: selectedGenre === g ? '#a5b4fc' : 'var(--text-muted)',
              whiteSpace: 'nowrap'
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Showing <strong>{movies.length}</strong> of <strong>{total}</strong> titles
        </span>
        {(searchQuery || selectedGenre) && (
          <button
            onClick={clearFilters}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#818cf8',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Movie Grid */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: '22px'
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="skeleton" style={{ height: '360px', borderRadius: '14px' }} />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: '22px'
        }}>
          {movies.map((m) => (
            <MovieCard key={m.movie_id} movie={m} />
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '16px' }}>
          <Film size={48} color="var(--text-dim)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>No titles found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Try searching with a different term or clearing your genre filter.
          </p>
          <button onClick={clearFilters} className="btn-secondary">
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
