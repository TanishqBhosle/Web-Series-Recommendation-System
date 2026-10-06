import os
import logging
import pandas as pd
from typing import List, Optional, Tuple, Dict
from sqlalchemy.orm import Session

from app.models.movie import Movie
from app.db import crud
from app.services.model_loader import model_store

logger = logging.getLogger(__name__)

# Default posters and overviews for popular series / movies
CURATED_METADATA: Dict[str, Dict[str, str]] = {
    "stranger things": {
        "poster_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        "overview": "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl."
    },
    "breaking bad": {
        "poster_url": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
        "overview": "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine to secure his family's future."
    },
    "game of thrones": {
        "poster_url": "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80",
        "overview": "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia."
    },
    "the dark knight": {
        "poster_url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
        "overview": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability."
    },
    "inception": {
        "poster_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
        "overview": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."
    },
    "interstellar": {
        "poster_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
        "overview": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
    }
}

GENRE_POSTERS: Dict[str, str] = {
    "action": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    "adventure": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    "animation": "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
    "comedy": "https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=600&q=80",
    "crime": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    "drama": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
    "fantasy": "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80",
    "horror": "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80",
    "mystery": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    "romance": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80",
    "sci-fi": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    "thriller": "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80",
    "default": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80"
}

def get_poster_for_movie(title: str, genres: Optional[str]) -> str:
    title_lower = title.lower()
    for key, data in CURATED_METADATA.items():
        if key in title_lower:
            return data["poster_url"]
    if genres:
        for g in genres.lower().split("|"):
            g = g.strip()
            if g in GENRE_POSTERS:
                return GENRE_POSTERS[g]
    return GENRE_POSTERS["default"]

def get_overview_for_movie(title: str, genres: Optional[str]) -> str:
    title_lower = title.lower()
    for key, data in CURATED_METADATA.items():
        if key in title_lower:
            return data["overview"]
    genre_display = genres.replace("|", ", ") if genres else "General"
    return f"A highly acclaimed title categorized under {genre_display}. Recommended based on metadata and user taste profiles."

def sync_movies_from_artifacts_or_csv(db: Session, max_rows: int = 1500) -> int:
    """
    Syncs movie catalog from model_store.movies_df or artifacts/movies.csv into SQLite DB.
    """
    count = db.query(Movie).count()
    if count > 0:
        return count

    df = None
    if model_store.movies_df is not None:
        df = model_store.movies_df
    else:
        # Check if movies.csv exists in artifacts
        art_path = os.path.join(model_store.artifact_dir, "movies.csv")
        if os.path.exists(art_path):
            try:
                df = pd.read_csv(art_path)
            except Exception as e:
                logger.error(f"Failed to read movies.csv: {e}")

    if df is not None and not df.empty:
        logger.info(f"Seeding database with {min(len(df), max_rows)} movies from artifacts...")
        records = []
        for _, row in df.head(max_rows).iterrows():
            m_id = int(row.get("movieId", row.get("movie_id", 0)))
            if m_id == 0:
                continue
            title = str(row.get("title", f"Title {m_id}"))
            genres = str(row.get("genres", ""))
            poster_url = get_poster_for_movie(title, genres)
            overview = get_overview_for_movie(title, genres)

            records.append(
                Movie(
                    movie_id=m_id,
                    title=title,
                    genres=genres,
                    poster_url=poster_url,
                    overview=overview,
                    vote_average=4.2
                )
            )
        db.bulk_save_objects(records)
        db.commit()
        return len(records)
    
    # If no artifacts or CSV found yet, seed a foundational starter set of popular series & movies
    logger.info("Artifacts not yet found. Seeding database with curated web series catalogue...")
    curated_seeds = [
        {"movie_id": 1, "title": "Stranger Things (2016)", "genres": "Drama|Fantasy|Horror|Mystery|Sci-Fi"},
        {"movie_id": 2, "title": "Breaking Bad (2008)", "genres": "Crime|Drama|Thriller"},
        {"movie_id": 3, "title": "Game of Thrones (2011)", "genres": "Action|Adventure|Drama|Fantasy"},
        {"movie_id": 4, "title": "Black Mirror (2011)", "genres": "Drama|Mystery|Sci-Fi|Thriller"},
        {"movie_id": 5, "title": "Chernobyl (2019)", "genres": "Drama|History|Thriller"},
        {"movie_id": 6, "title": "Dark (2017)", "genres": "Crime|Drama|Mystery|Sci-Fi"},
        {"movie_id": 7, "title": "The Boys (2019)", "genres": "Action|Comedy|Crime|Sci-Fi"},
        {"movie_id": 8, "title": "Sherlock (2010)", "genres": "Crime|Drama|Mystery"},
        {"movie_id": 9, "title": "Money Heist (2017)", "genres": "Action|Crime|Drama|Mystery"},
        {"movie_id": 10, "title": "The Crown (2016)", "genres": "Biography|Drama|History"},
        {"movie_id": 11, "title": "True Detective (2014)", "genres": "Crime|Drama|Mystery|Thriller"},
        {"movie_id": 12, "title": "Narcos (2015)", "genres": "Biography|Crime|Drama"},
        {"movie_id": 13, "title": "Fargo (2014)", "genres": "Crime|Drama|Thriller"},
        {"movie_id": 14, "title": "Succession (2018)", "genres": "Drama"},
        {"movie_id": 15, "title": "The Mandalorian (2019)", "genres": "Action|Adventure|Fantasy|Sci-Fi"},
        {"movie_id": 16, "title": "The Witcher (2019)", "genres": "Action|Adventure|Drama|Fantasy"},
        {"movie_id": 17, "title": "Ozark (2017)", "genres": "Crime|Drama|Thriller"},
        {"movie_id": 18, "title": "Mindhunter (2017)", "genres": "Crime|Drama|Mystery|Thriller"},
        {"movie_id": 19, "title": "Better Call Saul (2015)", "genres": "Crime|Drama"},
        {"movie_id": 20, "title": "Severance (2022)", "genres": "Drama|Mystery|Sci-Fi|Thriller"},
        {"movie_id": 21, "title": "Ted Lasso (2020)", "genres": "Comedy|Drama|Sport"},
        {"movie_id": 22, "title": "The Last of Us (2023)", "genres": "Action|Adventure|Drama|Sci-Fi"},
        {"movie_id": 23, "title": "Peaky Blinders (2013)", "genres": "Crime|Drama"},
        {"movie_id": 24, "title": "House of the Dragon (2022)", "genres": "Action|Adventure|Drama|Fantasy"}
    ]
    records = []
    for item in curated_seeds:
        records.append(
            Movie(
                movie_id=item["movie_id"],
                title=item["title"],
                genres=item["genres"],
                poster_url=get_poster_for_movie(item["title"], item["genres"]),
                overview=get_overview_for_movie(item["title"], item["genres"]),
                vote_average=4.5
            )
        )
    db.bulk_save_objects(records)
    db.commit()
    return len(records)
