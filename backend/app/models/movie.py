from sqlalchemy import Column, Integer, String, Text, Float
from sqlalchemy.orm import relationship
from app.db.database import Base

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)  # internal ID
    movie_id = Column(Integer, unique=True, index=True, nullable=False)  # MovieLens / Dataset movieId
    title = Column(String(300), nullable=False, index=True)
    genres = Column(String(200), nullable=True, index=True)
    overview = Column(Text, nullable=True)
    poster_url = Column(String(500), nullable=True)
    vote_average = Column(Float, nullable=True, default=0.0)
    vote_count = Column(Integer, nullable=True, default=0)

    ratings = relationship("Rating", back_populates="movie", cascade="all, delete-orphan")
