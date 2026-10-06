from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.models.user import User
from app.models.movie import Movie
from app.models.rating import Rating
from app.core.security import get_password_hash

# ----------------- USERS -----------------
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.lower()).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, name: str, email: str, password: str, is_admin: bool = False) -> User:
    hashed_pwd = get_password_hash(password)
    user = User(
        name=name,
        email=email.lower(),
        password_hash=hashed_pwd,
        is_admin=is_admin
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# ----------------- MOVIES -----------------
def get_movie_by_movie_id(db: Session, movie_id: int) -> Optional[Movie]:
    return db.query(Movie).filter(Movie.movie_id == movie_id).first()

def get_movies(db: Session, skip: int = 0, limit: int = 20, genre: Optional[str] = None, search: Optional[str] = None) -> Tuple[int, List[Movie]]:
    query = db.query(Movie)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(or_(Movie.title.ilike(search_filter), Movie.genres.ilike(search_filter)))
    if genre:
        query = query.filter(Movie.genres.ilike(f"%{genre}%"))
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return total, items

# ----------------- RATINGS -----------------
def get_user_rating_for_movie(db: Session, user_id: int, movie_id: int) -> Optional[Rating]:
    return db.query(Rating).filter(Rating.user_id == user_id, Rating.movie_id == movie_id).first()

def get_user_ratings(db: Session, user_id: int) -> List[Rating]:
    return db.query(Rating).filter(Rating.user_id == user_id).order_by(desc(Rating.created_at)).all()

def count_user_ratings(db: Session, user_id: int) -> int:
    return db.query(Rating).filter(Rating.user_id == user_id).count()

def create_or_update_rating(db: Session, user_id: int, movie_id: int, rating_value: float) -> Rating:
    existing = get_user_rating_for_movie(db, user_id, movie_id)
    if existing:
        existing.rating = rating_value
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_rating = Rating(user_id=user_id, movie_id=movie_id, rating=rating_value)
        db.add(new_rating)
        db.commit()
        db.refresh(new_rating)
        return new_rating
