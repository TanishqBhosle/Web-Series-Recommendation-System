import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Layers, Cpu, Users, ShieldAlert, Sliders, Database, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '60px 20px 80px',
        position: 'relative'
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '30px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          marginBottom: '24px'
        }}>
          <Sparkles size={16} color="#818cf8" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a5b4fc', letterSpacing: '0.02em' }}>
            Next-Gen Hybrid Recommendation Engine
          </span>
        </div>

        <h1 style={{
          fontSize: '3.6rem',
          fontWeight: 800,
          lineHeight: '1.15',
          marginBottom: '22px',
          maxWidth: '920px',
          margin: '0 auto 22px'
        }}>
          Discover Your Next Obsession with <span className="gradient-text">RecomFusion</span>
        </h1>

        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-muted)',
          maxWidth: '740px',
          margin: '0 auto 36px',
          lineHeight: '1.6'
        }}>
          A mathematically rigorous hybrid recommendation platform fusing <strong>TF-IDF Content-Based Filtering</strong> and <strong>Item-Item Pearson Collaborative Filtering</strong> for laser-precise discovery.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <Link to="/register" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.05rem' }}>
            Get Started Free <ArrowRight size={18} />
          </Link>
          <Link to="/explore" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
            Explore Catalog
          </Link>
        </div>
      </section>

      {/* Mathematical Architecture Showcase Card */}
      <section className="glass-panel" style={{
        padding: '36px',
        marginBottom: '70px',
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            padding: '8px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#a5b4fc'
          }}>
            <Cpu size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>The Hybrid Recommendation Equation</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Balanced weighting dynamically adapted for warm users and cold-start situations
            </p>
          </div>
        </div>

        <div style={{
          background: 'rgba(7, 10, 18, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '24px',
          fontFamily: 'monospace',
          fontSize: '1.2rem',
          textAlign: 'center',
          color: '#e0e7ff',
          letterSpacing: '0.04em',
          marginBottom: '20px'
        }}>
          FinalScore = <span style={{ color: '#818cf8', fontWeight: 'bold' }}>α</span> × ContentSimilarity + (1 − <span style={{ color: '#818cf8', fontWeight: 'bold' }}>α</span>) × CollaborativeSimilarity
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '10px' }}>
            <h4 style={{ color: '#a5b4fc', fontSize: '0.95rem', marginBottom: '6px' }}>Default Warm State</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <strong>α = 0.5</strong> gives 50% weight to metadata & genres and 50% to community rating co-occurrence patterns.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '10px' }}>
            <h4 style={{ color: '#fcd34d', fontSize: '0.95rem', marginBottom: '6px' }}>User Cold-Start Policy</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              If a user has <strong>&lt; 3 ratings</strong>, system sets <strong>α = 1.0</strong> to deliver pure Content-Based recommendations without noise.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '10px' }}>
            <h4 style={{ color: '#6ee7b7', fontSize: '0.95rem', marginBottom: '6px' }}>Item Cold-Start Policy</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              If a seed movie has <strong>&lt; 5 ratings</strong>, system defaults to <strong>α = 1.0</strong> using TF-IDF feature embeddings.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ marginBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>
            How RecomFusion Works
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
            From raw metadata to instantaneous personalized streaming feeds
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '26px' }}>
          {/* Card 1: Content-Based */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
              color: '#818cf8'
            }}>
              <Layers size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>
              1. Content-Based Filtering (CBF)
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '14px' }}>
              Extracts high-dimensional n-gram tokens from genres, plot overviews, and user tags using <strong>TF-IDF</strong>. Centered and cosine-normalized to yield Pearson correlation similarity across title vectors.
            </p>
            <ul style={{ listStyle: 'none', fontSize: '0.82rem', color: '#c7d2fe', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>✓ Multi-field genre & tag unification</li>
              <li>✓ TF-IDF sublinear word frequency weighting</li>
              <li>✓ Zero cold-start latency for new releases</li>
            </ul>
          </div>

          {/* Card 2: Collaborative Filtering */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
              color: '#a78bfa'
            }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>
              2. Collaborative Filtering (CF)
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '14px' }}>
              Builds user-item interaction matrices centered by user rating means. Calculates pairwise item similarities using <strong>Pearson Correlation</strong> to identify titles rated similarly by like-minded audiences.
            </p>
            <ul style={{ listStyle: 'none', fontSize: '0.82rem', color: '#ddd6fe', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>✓ User-mean centered normalization</li>
              <li>✓ Item-item Pearson correlation matrix</li>
              <li>✓ Uncovers serendipitous non-genre connections</li>
            </ul>
          </div>

          {/* Card 3: Hybrid Fusion */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
              color: '#34d399'
            }}>
              <Sliders size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>
              3. Hybrid Fusion & Inference
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '14px' }}>
              Combines candidate neighbor sets from both pipelines. Evaluates the weighted convex sum and serves sub-50ms API responses directly from precomputed in-memory numpy indexes.
            </p>
            <ul style={{ listStyle: 'none', fontSize: '0.82rem', color: '#a7f3d0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>✓ Candidate union ranking</li>
              <li>✓ Real-time user feedback updates</li>
              <li>✓ Sub-200ms API response latency</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#818cf8" />
          <span style={{ fontWeight: 700 }}>RecomFusion</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            © 2026. Google Colab ML Trained Engine.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Link to="/explore">Catalog</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/data-scientist">Data Science Studio</Link>
        </div>
      </footer>
    </div>
  );
}
