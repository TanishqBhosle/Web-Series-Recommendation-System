# RecomFusion — Hybrid Web Series Recommendation System

A modern, high-performance web platform combining **Content-Based Filtering (CBF)** and **Collaborative Filtering (CF)** with **Pearson Correlation** similarity metrics for web series and movies.

---

## Architecture Overview

RecomFusion unites:
1. **Content-Based Filtering**: TF-IDF n-gram vectorization on genres, descriptions, and user tags, centered and normalized to calculate Pearson correlation similarities.
2. **Collaborative Filtering**: User-item interaction matrices centered around user mean ratings, computing item-item Pearson correlation co-occurrences.
3. **Hybrid Inference Equation**:
   $$\text{FinalScore} = \alpha \times \text{ContentSimilarity} + (1 - \alpha) \times \text{CollaborativeSimilarity}$$
   - **Default**: $\alpha = 0.5$ (balanced 50% content / 50% collaborative)
   - **User Cold Start**: If user rating count $< 3 \rightarrow \alpha = 1.0$ (pure Content-Based)
   - **Item Cold Start**: If seed title rating count $< 5 \rightarrow \alpha = 1.0$ (pure Content-Based)

```text
       Google Colab Notebook (Offline Training)
                        │
                        ▼ (Export 12 Artifacts)
              backend/artifacts/
                        │
                        ▼ (Loads once on startup into memory)
      FastAPI Backend (Authentication, DB, Inference)
                        ▲
                        │ (REST API / JWT)
                        ▼
      React + Vite Frontend (Interactive SaaS Dashboard)
```

---

## Project Structure

```text
Web-Series-Recommendation-System/
├── backend/
│   ├── app/
│   │   ├── api/               # API endpoints (auth, movies, ratings, recommendations, admin)
│   │   ├── core/              # Config, security (bcrypt & JWT), dependencies
│   │   ├── db/                # Database connection and CRUD operations
│   │   ├── models/            # SQLAlchemy database models (User, Movie, Rating)
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── services/          # Recommendation service, model loader, movie service
│   │   └── main.py            # FastAPI application entrypoint & lifespan
│   ├── artifacts/             # Google Colab exported model artifacts (.npy, .pkl, .json)
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Backend environment variables
│   └── Dockerfile             # Container definition for backend
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, MovieCard, RatingStars, RecommendationRow
│   │   ├── context/           # AuthContext (JWT session state & rating counts)
│   │   ├── pages/             # Landing, Login, Register, Dashboard, Explore, Details, DataScientist
│   │   ├── services/          # API client
│   │   ├── App.jsx            # Routing and layout
│   │   ├── main.jsx           # React root
│   │   └── index.css          # Modern dark-mode styling and design tokens
│   ├── package.json           # Frontend dependencies
│   └── Dockerfile             # Container definition for frontend
├── Web_Series_Recommendation_System.ipynb # Source Google Colab training notebook
├── prd.md                     # Product Requirements Document
├── docker-compose.yml         # Container orchestration
└── README.md                  # System documentation
```

---

## Model Artifact Setup

Artifacts are produced by executing `Web_Series_Recommendation_System.ipynb` in Google Colab:

```text
Google Colab
     ↓
Run all training & evaluation cells
     ↓
Outputs generated in hybrid_recommender_artifacts/
     ↓
Place files in backend/artifacts/:
  - cbf_indices.npy
  - cbf_scores.npy
  - cf_indices.npy
  - cf_scores.npy
  - tfidf_vectorizer.pkl
  - movie_id_to_index.pkl
  - index_to_movie_id.pkl
  - rating_counts.pkl
  - user_rating_counts.pkl
  - movies.csv
  - metrics.json
  - config.json
     ↓
FastAPI backend loads artifacts into in-memory ModelStore
     ↓
Sub-50ms hybrid inference served to React frontend
```

---

## Quick Start (Local Setup)

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
- API Docs available at: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
- Application available at: `http://localhost:5173`

---

## Running with Docker Compose

```bash
docker-compose up --build
```

---

## Key Features

- **Personalized Dashboard**: "Recommended For You", "Because You Liked [Seed]", and cold-start progress indicator.
- **Interactive Rating System**: 0.5 to 5.0 star ratings with live database persistence and model re-ranking.
- **Instant Search & Explore**: Filter catalog by title, genre, and metadata tags.
- **Item Details & Similar Titles**: Comprehensive view with mathematical similarity breakdowns.
- **Data Scientist & Admin Studio**: Inspect offline evaluation metrics (MAE, RMSE, Precision@5, Recall@5), artifact manifest verification, and interactive candidate generation simulation.
