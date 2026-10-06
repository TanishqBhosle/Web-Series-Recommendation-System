from pydantic import BaseModel
from typing import List, Optional

class RecommendedMovie(BaseModel):
    movie_id: int
    title: str
    genres: List[str] = []
    score: float
    cbf_score: Optional[float] = 0.0
    cf_score: Optional[float] = 0.0
    poster_url: Optional[str] = None
    overview: Optional[str] = None
    explanation: Optional[str] = None

class RecommendationMeta(BaseModel):
    user_id: Optional[int] = None
    seed_movie_id: Optional[int] = None
    seed_movie_title: Optional[str] = None
    alpha: float
    cold_start_applied: bool = False
    cold_start_reason: Optional[str] = None
    total_candidates: int = 0

class RecommendationResponse(BaseModel):
    success: bool = True
    recommendations: List[RecommendedMovie] = []
    meta: Optional[RecommendationMeta] = None
    message: Optional[str] = None
