from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.db import crud
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.rating import RatingCreate, RatingResponse

router = APIRouter(prefix="/api/ratings", tags=["Ratings"])

@router.post("", response_model=RatingResponse, status_code=status.HTTP_201_CREATED)
def submit_rating(
    rating_in: RatingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    movie = crud.get_movie_by_movie_id(db, rating_in.movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    rating_obj = crud.create_or_update_rating(
        db,
        user_id=current_user.id,
        movie_id=rating_in.movie_id,
        rating_value=rating_in.rating
    )

    return RatingResponse(
        id=rating_obj.id,
        user_id=rating_obj.user_id,
        movie_id=rating_obj.movie_id,
        rating=rating_obj.rating,
        created_at=rating_obj.created_at,
        movie_title=movie.title
    )

@router.get("/me", response_model=List[RatingResponse])
def get_my_ratings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ratings = crud.get_user_ratings(db, current_user.id)
    res = []
    for r in ratings:
        movie = crud.get_movie_by_movie_id(db, r.movie_id)
        res.append(
            RatingResponse(
                id=r.id,
                user_id=r.user_id,
                movie_id=r.movie_id,
                rating=r.rating,
                created_at=r.created_at,
                movie_title=movie.title if movie else f"Movie {r.movie_id}"
            )
        )
    return res

@router.get("/count")
def get_my_rating_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = crud.count_user_ratings(db, current_user.id)
    return {
        "user_id": current_user.id,
        "rating_count": count,
        "is_cold_start": count < 3,
        "threshold": 3
    }
