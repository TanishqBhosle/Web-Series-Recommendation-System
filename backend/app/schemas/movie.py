from pydantic import BaseModel
from typing import List, Optional

class MovieBase(BaseModel):
    movie_id: int
    title: str
    genres: Optional[str] = None
    poster_url: Optional[str] = None
    overview: Optional[str] = None
    vote_average: Optional[float] = 0.0

class MovieResponse(MovieBase):
    id: Optional[int] = None
    genres_list: List[str] = []
    user_rating: Optional[float] = None

    class Config:
        from_attributes = True

class MovieListResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: List[MovieResponse]
