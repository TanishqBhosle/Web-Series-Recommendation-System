from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class RatingCreate(BaseModel):
    movie_id: int
    rating: float = Field(..., ge=0.5, le=5.0, description="Rating from 0.5 to 5.0")

class RatingResponse(BaseModel):
    id: int
    user_id: int
    movie_id: int
    rating: float
    created_at: datetime
    movie_title: Optional[str] = None

    class Config:
        from_attributes = True
