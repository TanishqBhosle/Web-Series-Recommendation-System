from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from app.db.database import get_db
from app.db import crud
from app.models.user import User
from app.models.movie import Movie
from app.models.rating import Rating
from app.services.model_loader import model_store
from app.services.recommendation_service import recommendation_service

router = APIRouter(prefix="/api/admin", tags=["Admin & Data Science"])

@router.get("/overview")
def get_dataset_overview(db: Session = Depends(get_db)):
    """
    Overview of dataset and system statistics
    """
    db_movie_count = db.query(Movie).count()
    db_user_count = db.query(User).count()
    db_rating_count = db.query(Rating).count()

    # Precomputed training dataset statistics from model store
    trained_movies_count = len(model_store.movie_id_to_index) if model_store.movie_id_to_index else (len(model_store.movies_df) if model_store.movies_df is not None else db_movie_count)
    trained_users_count = len(model_store.user_rating_counts) if model_store.user_rating_counts else db_user_count
    trained_ratings_count = sum(model_store.rating_counts.values()) if model_store.rating_counts else db_rating_count

    return {
        "success": True,
        "database": {
            "movies_count": db_movie_count,
            "users_count": db_user_count,
            "ratings_count": db_rating_count
        },
        "training_dataset": {
            "movies_count": trained_movies_count,
            "users_count": trained_users_count,
            "ratings_count": trained_ratings_count,
            "tags_count": "Calculated in Colab TF-IDF vectorizer" if model_store.is_loaded else "Awaiting artifacts"
        }
    }

@router.get("/model-info")
def get_model_info():
    """
    Model configuration, methodology, and hyper-parameters
    """
    return {
        "success": True,
        "model_loaded": model_store.is_loaded,
        "model_name": "Hybrid Web Series Recommendation Engine",
        "method": "Hybrid Content-Based Filtering (CBF) + Collaborative Filtering (CF)",
        "similarity_metric": "Pearson Correlation Similarity",
        "weighting_formula": "FinalScore = α × ContentSimilarity + (1 − α) × CollaborativeSimilarity",
        "parameters": {
            "alpha": model_store.config.get("alpha", 0.5),
            "top_n_candidates": model_store.config.get("top_n", 50),
            "recommendation_k": model_store.config.get("recommendation_k", 5),
            "user_cold_start_threshold": model_store.config.get("user_cold_start_threshold", 3),
            "item_cold_start_threshold": model_store.config.get("item_cold_start_threshold", 5),
            "relevant_rating_threshold": model_store.config.get("relevant_rating_threshold", 4.0)
        },
        "cold_start_policy": {
            "new_user": "If user ratings < 3, switch α to 1.0 (pure Content-Based Filtering)",
            "new_item": "If seed movie ratings < 5, switch α to 1.0 (pure Content-Based Filtering)"
        }
    }

@router.get("/metrics")
def get_evaluation_metrics():
    """
    Offline evaluation metrics exported from Google Colab.
    Returns 'Not available' if metric is not present.
    """
    raw_metrics = model_store.metrics if model_store.metrics else {}
    
    return {
        "success": True,
        "artifacts_loaded": model_store.is_loaded,
        "metrics": {
            "MAE": raw_metrics.get("MAE", "Not available"),
            "RMSE": raw_metrics.get("RMSE", "Not available"),
            "Precision@5": raw_metrics.get("Precision@5", "Not available"),
            "Recall@5": raw_metrics.get("Recall@5", "Not available")
        },
        "metadata": {
            "alpha": raw_metrics.get("alpha", 0.5),
            "evaluated_on": "Google Colab 80/20 train/test split with Pearson CF rating predictor"
        }
    }

@router.get("/artifacts")
def get_artifact_status():
    """
    Verifies all 12 expected artifacts from Google Colab
    """
    return {
        "success": True,
        "artifact_directory": model_store.artifact_dir,
        "all_loaded": model_store.is_loaded,
        "artifacts": model_store.artifact_status
    }

@router.post("/simulate")
def simulate_recommendation(
    user_id: int = Query(..., description="User ID to simulate"),
    seed_movie_id: int = Query(..., description="Seed Movie ID"),
    top_n: int = Query(5, ge=1, le=20),
    override_alpha: Optional[float] = Query(None, ge=0.0, le=1.0),
    db: Session = Depends(get_db)
):
    """
    Interactive recommendation simulator for Data Scientists.
    Allows testing inference and observing candidate generation step-by-step.
    """
    if not model_store.is_loaded:
        return {
            "success": False,
            "message": "Model artifacts not loaded in backend/artifacts/"
        }

    cbf_candidates = recommendation_service.get_cbf_candidates(seed_movie_id, top_n=10)
    cf_candidates = recommendation_service.get_cf_candidates(seed_movie_id, top_n=10)

    # Standard hybrid recommend
    result = recommendation_service.hybrid_recommend(
        user_id=user_id,
        seed_movie_id=seed_movie_id,
        top_n=top_n
    )

    seed_movie = crud.get_movie_by_movie_id(db, seed_movie_id)

    return {
        "success": True,
        "simulation": {
            "user_id": user_id,
            "seed_movie_id": seed_movie_id,
            "seed_movie_title": seed_movie.title if seed_movie else f"Movie {seed_movie_id}",
            "cbf_top_sample": [{"movie_id": m, "score": s} for m, s in cbf_candidates[:5]],
            "cf_top_sample": [{"movie_id": m, "score": s} for m, s in cf_candidates[:5]],
            "hybrid_output": result["recommendations"],
            "meta": result["meta"]
        }
    }
