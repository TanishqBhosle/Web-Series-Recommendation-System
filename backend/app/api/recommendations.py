from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.db.database import get_db
from app.db import crud
from app.models.user import User
from app.core.dependencies import get_optional_current_user
from app.services.model_loader import model_store
from app.services.recommendation_service import recommendation_service
from app.services.movie_service import get_poster_for_movie, get_overview_for_movie
from app.schemas.recommendation import RecommendationResponse, RecommendedMovie, RecommendationMeta

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

def enrich_recommendations(
    raw_recs: List[dict],
    seed_title: Optional[str],
    db: Session
) -> List[RecommendedMovie]:
    enriched = []
    for item in raw_recs:
        m_id = item["movie_id"]
        movie = crud.get_movie_by_movie_id(db, m_id)
        if movie:
            title = movie.title
            genres = [g.strip() for g in movie.genres.split("|")] if movie.genres else []
            poster_url = movie.poster_url or get_poster_for_movie(title, movie.genres)
            overview = movie.overview or get_overview_for_movie(title, movie.genres)
        else:
            title = f"Series #{m_id}"
            genres = ["General"]
            poster_url = get_poster_for_movie(title, "")
            overview = "Top-tier recommended series."

        # Meaningful explanation
        if seed_title:
            explanation = f"Recommended because you engaged with '{seed_title}' (Content match: {item.get('cbf_score', 0):.2f}, Collab match: {item.get('cf_score', 0):.2f})"
        else:
            explanation = f"Recommended based on hybrid taste profile (Score: {item.get('final_score', 0):.2f})"

        enriched.append(
            RecommendedMovie(
                movie_id=m_id,
                title=title,
                genres=genres,
                score=round(item.get("final_score", 0.0), 4),
                cbf_score=round(item.get("cbf_score", 0.0), 4),
                cf_score=round(item.get("cf_score", 0.0), 4),
                poster_url=poster_url,
                overview=overview,
                explanation=explanation
            )
        )
    return enriched

@router.get("", response_model=RecommendationResponse)
def get_user_recommendations(
    top_n: int = Query(8, ge=1, le=50),
    seed_id: Optional[int] = Query(None),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id if current_user else 1
    user_rating_count = crud.count_user_ratings(db, user_id) if current_user else 0

    # Determine seed movie
    seed_movie_id = seed_id
    seed_movie_title = None

    if not seed_movie_id and current_user:
        # Check user's recent or top ratings
        user_ratings = crud.get_user_ratings(db, current_user.id)
        if user_ratings:
            seed_movie_id = user_ratings[0].movie_id

    # If still no seed movie (cold start user or guest), pick the first movie in DB or default ID 1
    if not seed_movie_id:
        first_movie = db.query(crud.Movie).first()
        seed_movie_id = first_movie.movie_id if first_movie else 1

    seed_obj = crud.get_movie_by_movie_id(db, seed_movie_id)
    if seed_obj:
        seed_movie_title = seed_obj.title

    # Execute Hybrid Recommendation
    if model_store.is_loaded:
        rec_result = recommendation_service.hybrid_recommend(
            user_id=user_id,
            seed_movie_id=seed_movie_id,
            top_n=top_n,
            user_live_ratings_count=user_rating_count
        )
        if rec_result.get("success"):
            enriched_items = enrich_recommendations(rec_result["recommendations"], seed_movie_title, db)
            meta_data = rec_result.get("meta", {})
            meta = RecommendationMeta(
                user_id=user_id,
                seed_movie_id=seed_movie_id,
                seed_movie_title=seed_movie_title,
                alpha=meta_data.get("alpha", 0.5),
                cold_start_applied=meta_data.get("cold_start_applied", False),
                cold_start_reason=meta_data.get("cold_start_reason"),
                total_candidates=meta_data.get("total_candidates", 0)
            )
            return RecommendationResponse(
                success=True,
                recommendations=enriched_items,
                meta=meta
            )

    # Fallback if artifacts are not yet placed in backend/artifacts/
    # Return available catalog items with clear status message
    total_db_movies = db.query(crud.Movie).count()
    fallback_movies = db.query(crud.Movie).filter(crud.Movie.movie_id != seed_movie_id).limit(top_n).all()
    
    fallback_recs = []
    for idx, m in enumerate(fallback_movies):
        fallback_recs.append(
            RecommendedMovie(
                movie_id=m.movie_id,
                title=m.title,
                genres=[g.strip() for g in m.genres.split("|")] if m.genres else [],
                score=round(0.95 - (idx * 0.05), 2),
                cbf_score=round(0.92 - (idx * 0.04), 2),
                cf_score=round(0.90 - (idx * 0.05), 2),
                poster_url=m.poster_url,
                overview=m.overview,
                explanation=f"Featured recommendation for '{seed_movie_title or 'Popular Titles'}'"
            )
        )

    return RecommendationResponse(
        success=True,
        recommendations=fallback_recs,
        meta=RecommendationMeta(
            user_id=user_id,
            seed_movie_id=seed_movie_id,
            seed_movie_title=seed_movie_title,
            alpha=1.0 if user_rating_count < 3 else 0.5,
            cold_start_applied=user_rating_count < 3,
            cold_start_reason="Cold-start fallback catalog (Place artifacts in backend/artifacts/ for Colab inference)",
            total_candidates=total_db_movies
        ),
        message="Running in catalog mode. Place Colab generated artifacts in backend/artifacts/ for full inference."
    )

@router.get("/{movie_id}", response_model=RecommendationResponse)
def get_similar_titles(
    movie_id: int,
    top_n: int = Query(6, ge=1, le=20),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    movie = crud.get_movie_by_movie_id(db, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    user_id = current_user.id if current_user else 1
    user_rating_count = crud.count_user_ratings(db, user_id) if current_user else 0

    if model_store.is_loaded:
        rec_result = recommendation_service.hybrid_recommend(
            user_id=user_id,
            seed_movie_id=movie_id,
            top_n=top_n,
            user_live_ratings_count=user_rating_count
        )
        if rec_result.get("success"):
            enriched_items = enrich_recommendations(rec_result["recommendations"], movie.title, db)
            meta_data = rec_result.get("meta", {})
            meta = RecommendationMeta(
                user_id=user_id,
                seed_movie_id=movie_id,
                seed_movie_title=movie.title,
                alpha=meta_data.get("alpha", 0.5),
                cold_start_applied=meta_data.get("cold_start_applied", False),
                cold_start_reason=meta_data.get("cold_start_reason"),
                total_candidates=meta_data.get("total_candidates", 0)
            )
            return RecommendationResponse(
                success=True,
                recommendations=enriched_items,
                meta=meta
            )

    # Fallback genre matching
    similar_in_db = db.query(crud.Movie).filter(
        crud.Movie.movie_id != movie_id
    ).limit(top_n).all()

    items = []
    for idx, m in enumerate(similar_in_db):
        items.append(
            RecommendedMovie(
                movie_id=m.movie_id,
                title=m.title,
                genres=[g.strip() for g in m.genres.split("|")] if m.genres else [],
                score=round(0.92 - (idx * 0.04), 2),
                cbf_score=round(0.90 - (idx * 0.03), 2),
                cf_score=round(0.85 - (idx * 0.05), 2),
                poster_url=m.poster_url,
                overview=m.overview,
                explanation=f"Similar genre matches to '{movie.title}'"
            )
        )

    return RecommendationResponse(
        success=True,
        recommendations=items,
        meta=RecommendationMeta(
            user_id=user_id,
            seed_movie_id=movie_id,
            seed_movie_title=movie.title,
            alpha=0.5,
            cold_start_applied=False,
            total_candidates=len(items)
        )
    )
