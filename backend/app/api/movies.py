from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.db.database import get_db
from app.db import crud
from app.models.user import User
from app.core.dependencies import get_optional_current_user
from app.schemas.movie import MovieResponse, MovieListResponse

router = APIRouter(prefix="/api/movies", tags=["Movies & Web Series"])

def format_movie_response(movie, user_id: Optional[int] = None, db: Optional[Session] = None) -> MovieResponse:
    genres_list = [g.strip() for g in movie.genres.split("|")] if movie.genres else []
    user_rating = None
    if user_id and db:
        r = crud.get_user_rating_for_movie(db, user_id=user_id, movie_id=movie.movie_id)
        if r:
            user_rating = r.rating

    return MovieResponse(
        id=movie.id,
        movie_id=movie.movie_id,
        title=movie.title,
        genres=movie.genres,
        genres_list=genres_list,
        poster_url=movie.poster_url,
        overview=movie.overview,
        vote_average=movie.vote_average,
        user_rating=user_rating
    )

@router.get("", response_model=MovieListResponse)
def list_movies(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    genre: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    skip = (page - 1) * limit
    total, items = crud.get_movies(db, skip=skip, limit=limit, genre=genre, search=search)
    user_id = current_user.id if current_user else None
    
    formatted_items = [format_movie_response(m, user_id, db) for m in items]
    return MovieListResponse(
        total=total,
        page=page,
        limit=limit,
        items=formatted_items
    )

@router.get("/search", response_model=MovieListResponse)
def search_movies(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    skip = (page - 1) * limit
    total, items = crud.get_movies(db, skip=skip, limit=limit, search=q)
    user_id = current_user.id if current_user else None
    formatted_items = [format_movie_response(m, user_id, db) for m in items]
    return MovieListResponse(
        total=total,
        page=page,
        limit=limit,
        items=formatted_items
    )

@router.get("/genres", response_model=List[str])
def list_genres():
    return [
        "Action", "Adventure", "Animation", "Comedy", "Crime",
        "Documentary", "Drama", "Fantasy", "Film-Noir", "Horror",
        "Musical", "Mystery", "Romance", "Sci-Fi", "Thriller",
        "War", "Western"
    ]

@router.get("/{movie_id}", response_model=MovieResponse)
def get_movie(
    movie_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    movie = crud.get_movie_by_movie_id(db, movie_id=movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    user_id = current_user.id if current_user else None
    return format_movie_response(movie, user_id, db)
