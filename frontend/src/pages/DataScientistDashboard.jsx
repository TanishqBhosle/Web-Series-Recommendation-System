import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Activity, Database, Cpu, FileCheck, CheckCircle2, XCircle, Play, BarChart3, AlertCircle } from 'lucide-react';

export default function DataScientistDashboard() {
  const [overview, setOverview] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [artifacts, setArtifacts] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulation inputs
  const [simUserId, setSimUserId] = useState(1);
  const [simMovieId, setSimMovieId] = useState(1);
  const [simAlpha, setSimAlpha] = useState(0.5);
  const [simResults, setSimResults] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ovRes, miRes, mtRes, artRes] = await Promise.all([
        api.getAdminOverview(),
        api.getModelInfo(),
        api.getMetrics(),
        api.getArtifactStatus()
      ]);
      setOverview(ovRes);
      setModelInfo(miRes);
      setMetrics(mtRes);
      setArtifacts(artRes);
    } catch (err) {
      console.error("Failed to load Data Scientist metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSimulate = async (e) => {
    e.preventDefault();
    try {
      setSimulating(true);
      const res = await api.simulateRecommendation(simUserId, simMovieId, 5, simAlpha);
      setSimResults(res.simulation || null);
    } catch (err) {
      alert("Simulation failed: " + err.message);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px' }}>
        <div className="skeleton" style={{ height: '180px', borderRadius: '16px', marginBottom: '24px' }} />
        <div className="skeleton" style={{ height: '320px', borderRadius: '16px' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 24px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            padding: '8px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#a5b4fc'
          }}>
            <Activity size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
              Data Scientist & Architecture Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Inspect Google Colab model artifacts, validation metrics, dataset distribution, and inference mathematics.
            </p>
          </div>
        </div>
      </div>

      {/* Artifact Status Banner */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        marginBottom: '32px',
        border: `1px solid ${artifacts?.all_loaded ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
        background: artifacts?.all_loaded
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)'
          : 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {artifacts?.all_loaded ? (
              <CheckCircle2 size={28} color="#34d399" />
            ) : (
              <AlertCircle size={28} color="#fbbf24" />
            )}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: artifacts?.all_loaded ? '#6ee7b7' : '#fde047' }}>
                {artifacts?.all_loaded ? "All Google Colab Artifacts Successfully Loaded" : "Artifacts Ready to be Imported"}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Artifact Target Directory: <code>{artifacts?.artifact_directory}</code>
              </p>
            </div>
          </div>
          <button onClick={fetchDashboardData} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            Re-verify Artifacts
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '36px'
      }}>
        <div className="glass-panel" style={{ padding: '22px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>SERIES & MOVIES</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            {overview?.training_dataset?.movies_count?.toLocaleString() || overview?.database?.movies_count || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#a5b4fc' }}>Indexed for TF-IDF Vectorization</span>
        </div>

        <div className="glass-panel" style={{ padding: '22px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>USERS</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            {overview?.training_dataset?.users_count?.toLocaleString() || overview?.database?.users_count || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#818cf8' }}>User-Item Rating Profiles</span>
        </div>

        <div className="glass-panel" style={{ padding: '22px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>TOTAL RATINGS</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            {overview?.training_dataset?.ratings_count?.toLocaleString() || overview?.database?.ratings_count || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Item-Item Co-occurrence Pairs</span>
        </div>

        <div className="glass-panel" style={{ padding: '22px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>SIMILARITY METRIC</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>
            Pearson Correlation
          </div>
          <span style={{ fontSize: '0.75rem', color: '#fcd34d' }}>Mean-Centered Cosine Normalization</span>
        </div>
      </div>

      {/* Grid: Model Info & Evaluation Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '26px',
        marginBottom: '40px'
      }}>
        {/* Model Info */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Cpu size={20} color="#818cf8" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Model Specifications</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Architecture:</span>
              <strong style={{ color: '#e2e8f0' }}>{modelInfo?.method}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Similarity Metric:</span>
              <strong style={{ color: '#e2e8f0' }}>{modelInfo?.similarity_metric}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Default Hybrid Weight (α):</span>
              <strong style={{ color: '#818cf8' }}>{modelInfo?.parameters?.alpha} (50% CBF / 50% CF)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Candidate Neighborhood (Top-N):</span>
              <strong style={{ color: '#e2e8f0' }}>{modelInfo?.parameters?.top_n_candidates} candidates</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>User Cold-Start Threshold:</span>
              <strong style={{ color: '#fcd34d' }}>&lt; {modelInfo?.parameters?.user_cold_start_threshold} ratings (Switches α = 1.0)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Item Cold-Start Threshold:</span>
              <strong style={{ color: '#6ee7b7' }}>&lt; {modelInfo?.parameters?.item_cold_start_threshold} ratings (Switches α = 1.0)</strong>
            </div>
          </div>
        </div>

        {/* Evaluation Metrics */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BarChart3 size={20} color="#34d399" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Colab Evaluation Metrics</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ background: 'rgba(7, 10, 18, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>MAE (Mean Absolute Error)</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                {metrics?.metrics?.MAE !== "Not available" && typeof metrics?.metrics?.MAE === 'number'
                  ? metrics?.metrics?.MAE.toFixed(4)
                  : String(metrics?.metrics?.MAE || 'Not available')}
              </div>
            </div>

            <div style={{ background: 'rgba(7, 10, 18, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>RMSE (Root Mean Squared Error)</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#818cf8', marginTop: '4px' }}>
                {metrics?.metrics?.RMSE !== "Not available" && typeof metrics?.metrics?.RMSE === 'number'
                  ? metrics?.metrics?.RMSE.toFixed(4)
                  : String(metrics?.metrics?.RMSE || 'Not available')}
              </div>
            </div>

            <div style={{ background: 'rgba(7, 10, 18, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>PRECISION@5</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                {metrics?.metrics?.['Precision@5'] !== "Not available" && typeof metrics?.metrics?.['Precision@5'] === 'number'
                  ? metrics?.metrics?.['Precision@5'].toFixed(4)
                  : String(metrics?.metrics?.['Precision@5'] || 'Not available')}
              </div>
            </div>

            <div style={{ background: 'rgba(7, 10, 18, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>RECALL@5</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fcd34d', marginTop: '4px' }}>
                {metrics?.metrics?.['Recall@5'] !== "Not available" && typeof metrics?.metrics?.['Recall@5'] === 'number'
                  ? metrics?.metrics?.['Recall@5'].toFixed(4)
                  : String(metrics?.metrics?.['Recall@5'] || 'Not available')}
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            * Note: Values loaded directly from <code>metrics.json</code> produced during 80/20 train/test evaluation in Google Colab.
          </p>
        </div>
      </div>

      {/* Artifacts Checklist */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <FileCheck size={20} color="#a5b4fc" />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Google Colab Artifact Manifest (12 Files)</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px'
        }}>
          {artifacts?.artifacts && Object.entries(artifacts.artifacts).map(([fname, info]) => (
            <div key={fname} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(7, 10, 18, 0.5)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem'
            }}>
              <span style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>{fname}</span>
              {info.exists ? (
                <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
                  <CheckCircle2 size={15} /> {(info.size_bytes / 1024).toFixed(1)} KB
                </span>
              ) : (
                <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
                  <XCircle size={15} /> Awaiting File
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Inference Simulator */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Play size={20} color="#818cf8" />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Interactive Inference Simulator</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
          Simulate hybrid inference and inspect raw intermediate candidate scores between CBF and CF.
        </p>

        <form onSubmit={handleSimulate} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          alignItems: 'end',
          marginBottom: '24px'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              User ID
            </label>
            <input
              type="number"
              min="1"
              value={simUserId}
              onChange={(e) => setSimUserId(parseInt(e.target.value) || 1)}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'rgba(7, 10, 18, 0.6)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: '#ffffff'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Seed Movie ID
            </label>
            <input
              type="number"
              min="1"
              value={simMovieId}
              onChange={(e) => setSimMovieId(parseInt(e.target.value) || 1)}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'rgba(7, 10, 18, 0.6)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: '#ffffff'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Override Alpha (α: {simAlpha})
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={simAlpha}
              onChange={(e) => setSimAlpha(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <button
            type="submit"
            disabled={simulating}
            className="btn-primary"
            style={{ padding: '10px 20px', justifyContent: 'center' }}
          >
            {simulating ? 'Computing...' : 'Run Simulation'}
          </button>
        </form>

        {simResults && (
          <div style={{
            background: 'rgba(7, 10, 18, 0.7)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#a5b4fc' }}>
              Simulation Results for {simResults.seed_movie_title} (Seed #{simResults.seed_movie_id})
            </h4>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-dim)' }}>
                    <th style={{ padding: '8px' }}>Movie ID</th>
                    <th style={{ padding: '8px' }}>CBF Pearson Score</th>
                    <th style={{ padding: '8px' }}>CF Pearson Score</th>
                    <th style={{ padding: '8px' }}>Weighted Final Score</th>
                  </tr>
                </thead>
                <tbody>
                  {simResults.hybrid_output?.map((row) => (
                    <tr key={row.movie_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '8px', fontWeight: 600 }}>#{row.movie_id}</td>
                      <td style={{ padding: '8px', color: '#818cf8' }}>{row.cbf_score.toFixed(4)}</td>
                      <td style={{ padding: '8px', color: '#34d399' }}>{row.cf_score.toFixed(4)}</td>
                      <td style={{ padding: '8px', color: '#fcd34d', fontWeight: 700 }}>{row.final_score.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
