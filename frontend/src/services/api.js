const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),

  // Movies
  getMovies: (page = 1, limit = 20, genre = '', search = '') => {
    const params = new URLSearchParams({ page, limit });
    if (genre) params.append('genre', genre);
    if (search) params.append('search', search);
    return request(`/movies?${params.toString()}`);
  },
  searchMovies: (q, page = 1, limit = 20) => {
    const params = new URLSearchParams({ q, page, limit });
    return request(`/movies/search?${params.toString()}`);
  },
  getMovieById: (movieId) => request(`/movies/${movieId}`),
  getGenres: () => request('/movies/genres'),

  // Ratings
  submitRating: (movieId, rating) => request('/ratings', {
    method: 'POST',
    body: JSON.stringify({ movie_id: movieId, rating })
  }),
  getMyRatings: () => request('/ratings/me'),
  getMyRatingCount: () => request('/ratings/count'),

  // Recommendations
  getRecommendations: (topN = 8, seedId = null) => {
    const params = new URLSearchParams({ top_n: topN });
    if (seedId) params.append('seed_id', seedId);
    return request(`/recommendations?${params.toString()}`);
  },
  getSimilarTitles: (movieId, topN = 6) => request(`/recommendations/${movieId}?top_n=${topN}`),

  // Admin / Data Scientist
  getAdminOverview: () => request('/admin/overview'),
  getModelInfo: () => request('/admin/model-info'),
  getMetrics: () => request('/admin/metrics'),
  getArtifactStatus: () => request('/admin/artifacts'),
  simulateRecommendation: (userId, seedMovieId, topN = 5, overrideAlpha = null) => {
    const params = new URLSearchParams({
      user_id: userId,
      seed_movie_id: seedMovieId,
      top_n: topN
    });
    if (overrideAlpha !== null) params.append('override_alpha', overrideAlpha);
    return request(`/admin/simulate?${params.toString()}`, { method: 'POST' });
  }
};
