import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Search, Activity, Flame } from 'lucide-react';

export default function Navbar() {
  const { ratingCount } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(7, 10, 18, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '12px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(99, 102, 241, 0.5)'
        }}>
          <Sparkles size={22} color="#ffffff" />
        </div>
        <div>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Recom<span style={{ color: '#818cf8' }}>Fusion</span>
          </span>
          <span style={{
            fontSize: '0.65rem',
            marginLeft: '6px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#a5b4fc',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            verticalAlign: 'middle',
            fontWeight: 700
          }}>
            HYBRID AI
          </span>
        </div>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: isActive('/dashboard') ? '#a5b4fc' : 'var(--text-muted)',
            transition: 'color 0.2s'
          }}
        >
          <Flame size={18} /> For You
        </Link>

        <Link
          to="/explore"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: isActive('/explore') ? '#a5b4fc' : 'var(--text-muted)',
            transition: 'color 0.2s'
          }}
        >
          <Search size={18} /> Search & Catalog
        </Link>

        <Link
          to="/data-scientist"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: isActive('/data-scientist') ? '#a5b4fc' : 'var(--text-muted)',
            transition: 'color 0.2s'
          }}
        >
          <Activity size={18} /> ML Studio / Admin
        </Link>
      </div>

      {/* Mode Status Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '20px',
          background: ratingCount < 3 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
          border: `1px solid ${ratingCount < 3 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
          fontSize: '0.8rem',
          fontWeight: 600,
          color: ratingCount < 3 ? '#fcd34d' : '#6ee7b7'
        }} title={ratingCount < 3 ? "Cold-Start user: rate 3 titles to unlock CF" : "Full Hybrid Collaborative Filtering active"}>
          <span>{ratingCount < 3 ? `Cold-Start (${ratingCount}/3 rated)` : `Hybrid Active (${ratingCount} rated)`}</span>
        </div>

        <Link to="/explore" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
          Explore
        </Link>
      </div>
    </nav>
  );
}
