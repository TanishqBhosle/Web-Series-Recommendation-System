# Hybrid Web Series Recommendation System

A full-stack machine learning application implementing a hybrid recommendation engine that combines Content-Based Filtering (CBF) and Item-Item Collaborative Filtering (CF) using Pearson Correlation similarity metrics.

The system utilizes an offline-trained model pipeline developed in Google Colab, integrated with a high-performance Python FastAPI backend and a modern React Vite frontend.

---

## 1. Executive Summary

Recommender systems commonly suffer from two fundamental problems:
1. **Cold-Start Problem**: Collaborative filtering fails when a user or item has insufficient historical interaction.
2. **Over-Specialization**: Content-based filtering tends to suggest items too similar to what the user already consumed, lacking serendipity.

This platform resolves both issues through a weighted hybrid formulation:
- **Warm Users & Items**: Evaluates a balanced combination of metadata similarities and community rating co-occurrences.
- **Cold-Start Users & Items**: Dynamically shifts to pure content-based filtering based on interaction volume thresholds.

---

## 2. System Architecture

Model training and matrix computations are conducted offline in Google Colab. The production application serves low-latency inference by loading precomputed artifact matrices directly into memory.

```text
+----------------------------------------------------------------+
|                     Google Colab Notebook                      |
| (Data Preprocessing, TF-IDF, Centered Pearson Matrix Creation) |
+----------------------------------------------------------------+
                               |
                               | Exports 12 Model Artifacts
                               v
+----------------------------------------------------------------+
|                       backend/artifacts/                       |
|   (.npy matrices, .pkl dictionaries, .csv metadata, .json)     |
+----------------------------------------------------------------+
                               |
                               | Loaded into memory on startup
                               v
+----------------------------------------------------------------+
|                     FastAPI Backend Engine                     |
|  - In-Memory Model Store & Pearson Nearest Neighbors Lookups   |
|  - Dynamic Cold-Start Threshold Evaluator                      |
|  - REST API Layer with SQLite Relational Persistence           |
+----------------------------------------------------------------+
                               |
                               | JSON over HTTP (< 50ms)
                               v
+----------------------------------------------------------------+
|                     React Vite Frontend                        |
|  - For You (Personalized Recommendations Dashboard)            |
|  - Catalog Search & Multi-Genre Filtering                      |
|  - Item Details with Similar Titles Breakdown                  |
|  - Data Scientist Studio & Real Evaluation Metrics             |
+----------------------------------------------------------------+
```

---

## 3. Machine Learning Methodology

### 3.1 Content-Based Filtering (CBF)
- Combines genre labels and user-generated tags into composite text strings.
- Converts text into numerical vectors using sublinear term-frequency inverse document frequency (TF-IDF) with unigrams and bigrams.
- Normalizes and centers vectors to compute pairwise Pearson correlation similarities across item embeddings.

### 3.2 Collaborative Filtering (CF)
- Constructs a sparse user-item interaction matrix from historical ratings.
- Applies user-mean centering to eliminate individual user rating bias.
- Computes item-item similarity vectors using Pearson correlation over co-rated titles.

### 3.3 Hybrid Fusion Formula
Candidate recommendations from both pipelines are merged using a convex linear combination:

$$\text{FinalScore}(s) = \alpha \times \text{Sim}_{\text{CBF}}(s_{\text{seed}}, s) + (1 - \alpha) \times \text{Sim}_{\text{CF}}(s_{\text{seed}}, s)$$

Where:
- $\text{Sim}_{\text{CBF}}$ is the Content-Based Pearson similarity score.
- $\text{Sim}_{\text{CF}}$ is the Collaborative Pearson similarity score.
- $\alpha$ is the weighting parameter (Default: $\alpha = 0.5$).
- $s_{\text{seed}}$ is the reference title.
- $s$ is the candidate title.

### 3.4 Cold-Start Strategy
- **New User**: If a user has submitted fewer than 3 ratings, $\alpha$ is set to $1.0$ (100% Content-Based Filtering).
- **New Item**: If a seed title has received fewer than 5 ratings, $\alpha$ is set to $1.0$ (100% Content-Based Filtering).

---

## 4. Dataset

The system is developed on the MovieLens Latest Small benchmark dataset:
- **movies.csv**: Title identifier, release title, and genre classifications.
- **ratings.csv**: User identifier, movie identifier, rating value (scale 0.5 to 5.0), and timestamp.
- **tags.csv**: User identifier, movie identifier, tag descriptors, and timestamp.

---

## 5. Offline Evaluation Metrics

Evaluation metrics were computed during offline 80/20 train/test evaluation in Google Colab and loaded directly from `metrics.json`:

| Metric | Measured Value | Description |
| :--- | :--- | :--- |
| **MAE** | 0.7386 | Mean Absolute Error on rating prediction |
| **RMSE** | 0.9497 | Root Mean Squared Error on rating prediction |
| **Precision@5** | 0.0060 | Ratio of relevant titles in top-5 recommendations |
| **Recall@5** | 0.0007 | Coverage of user-relevant titles retrieved in top-5 |

---

## 6. Project Directory Structure

```text
Web-Series-Recommendation-System/
|-- backend/
|   |-- app/
|   |   |-- api/
|   |   |   |-- admin.py              # Studio metrics and candidate simulation
|   |   |   |-- auth.py               # Authentication utility endpoints
|   |   |   |-- movies.py             # Catalog search and genre endpoints
|   |   |   |-- ratings.py            # User rating submissions and counts
|   |   |   `-- recommendations.py    # Hybrid recommendation endpoints
|   |   |-- core/
|   |   |   |-- config.py             # Application settings and environment parsing
|   |   |   |-- dependencies.py       # Session resolution dependencies
|   |   |   `-- security.py           # Cryptographic hashing utilities
|   |   |-- db/
|   |   |   |-- crud.py               # Database query operations
|   |   |   `-- database.py           # SQLAlchemy engine and session setup
|   |   |-- models/
|   |   |   |-- movie.py              # Movie database model
|   |   |   |-- rating.py             # Rating interaction model
|   |   |   `-- user.py               # User account model
|   |   |-- schemas/
|   |   |   |-- auth.py               # Auth schemas
|   |   |   |-- movie.py              # Catalog schemas
|   |   |   |-- rating.py             # Rating schemas
|   |   |   `-- recommendation.py     # Recommendation response schemas
|   |   |-- services/
|   |   |   |-- model_loader.py       # In-memory artifact store loader
|   |   |   |-- movie_service.py      # Catalog synchronization and poster metadata
|   |   |   `-- recommendation_service.py # Inference and scoring engine
|   |   `-- main.py                   # FastAPI application initialization
|   |-- artifacts/                    # Exported model matrices and configs
|   |-- requirements.txt              # Python package dependencies
|   `-- .env.example                  # Environment configuration template
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |   |-- MovieCard.jsx         # Card component with match score and rating
|   |   |   |-- Navbar.jsx            # Application navigation
|   |   |   |-- RatingStars.jsx       # 0.5 to 5.0 star rating input
|   |   |   `-- RecommendationRow.jsx # Responsive horizontal catalog row
|   |   |-- context/
|   |   |   `-- AuthContext.jsx       # Active session and rating count state
|   |   |-- pages/
|   |   |   |-- Dashboard.jsx         # Personalized recommendations page
|   |   |   |-- DataScientistDashboard.jsx # ML studio and artifact validator
|   |   |   |-- Explore.jsx           # Catalog search and genre filtering
|   |   |   |-- Landing.jsx           # System presentation and methodology
|   |   |   `-- MovieDetails.jsx      # Title overview and similar items
|   |   |-- services/
|   |   |   `-- api.js                # HTTP client interface
|   |   |-- App.jsx                   # Application routing
|   |   |-- index.css                 # Styling tokens and layout rules
|   |   `-- main.jsx                  # React application entrypoint
|   `-- package.json                  # Frontend dependencies and scripts
|-- Web_Series_Recommendation_System.ipynb # Source Google Colab notebook
|-- prd.md                            # Product Requirements Document
|-- .gitignore                        # Git exclusion rules
`-- README.md                         # Project documentation
```

---

## 7. Model Artifact Manifest

The backend verifies the presence of 12 artifact files in `backend/artifacts/`:

1. `cbf_indices.npy`: Precomputed nearest neighbors for content-based similarity.
2. `cbf_scores.npy`: Precomputed content-based Pearson correlation coefficients.
3. `cf_indices.npy`: Precomputed nearest neighbors for collaborative filtering.
4. `cf_scores.npy`: Precomputed item-item collaborative Pearson correlation values.
5. `tfidf_vectorizer.pkl`: Trained TF-IDF transformer.
6. `movie_id_to_index.pkl`: Movie ID to matrix row index lookup dictionary.
7. `index_to_movie_id.pkl`: Matrix row index to Movie ID lookup dictionary.
8. `rating_counts.pkl`: Item rating frequencies for item cold-start detection.
9. `user_rating_counts.pkl`: User rating frequencies for user cold-start detection.
10. `movies.csv`: Processed catalog metadata.
11. `metrics.json`: Offline model validation metrics.
12. `config.json`: Hyperparameter configuration dictionary.

---

## 8. Installation and Execution

### 8.1 Prerequisites
- Python 3.11 or later
- Node.js 18.0 or later (with npm)

### 8.2 Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On Linux / macOS:
source .venv/bin/activate

# Install required packages
pip install -r requirements.txt

# Start backend server
python -m uvicorn app.main:app --reload --port 8000
```

- API Base URL: `http://localhost:8000`
- Interactive OpenAPI Documentation: `http://localhost:8000/docs`

### 8.3 Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install package dependencies
npm install

# Start development server
npm run dev
```

- Application URL: `http://localhost:5173`

---

## 9. API Reference

### 9.1 Recommendations
- `GET /api/recommendations?top_n=8&seed_id={id}`: Generates top-N hybrid recommendations based on the user's latest interaction or provided seed title.
- `GET /api/recommendations/{movie_id}?top_n=6`: Returns similar titles for a specific item with content and collaborative score breakdowns.

### 9.2 Movies and Catalog
- `GET /api/movies?page=1&limit=20&genre={genre}&search={query}`: Returns paginated catalog items with optional filtering.
- `GET /api/movies/{movie_id}`: Returns metadata for a specific item.
- `GET /api/movies/search?q={query}`: Full-text search endpoint.
- `GET /api/movies/genres`: List of unique genre classifications.

### 9.3 Ratings
- `POST /api/ratings`: Submits a user rating (0.5 to 5.0) and updates the user's cold-start state.
- `GET /api/ratings/me`: Returns rating history for the current session.
- `GET /api/ratings/count`: Returns total submitted ratings and active cold-start status.

### 9.4 Data Science Studio
- `GET /api/admin/overview`: Dataset volume statistics (movies, users, ratings).
- `GET /api/admin/model-info`: Active model specifications, weighting parameter, and thresholds.
- `GET /api/admin/metrics`: Offline evaluation metrics loaded from `metrics.json`.
- `GET /api/admin/artifacts`: Manifest verification of the 12 Colab artifact files.
- `POST /api/admin/simulate`: Interactive candidate scoring simulator for any user and seed item.

---

## 10. Performance Characteristics

- **In-Memory Inference**: Model matrices are kept resident in memory, providing recommendation latency between 20ms and 50ms per request.
- **Lazy Seeding**: Catalog metadata is synchronized to SQLite on first startup, avoiding repetitive CSV parsing.
- **Zero Retraining Overhead**: All matrix computations remain strictly decoupled from the web application lifecycle.
