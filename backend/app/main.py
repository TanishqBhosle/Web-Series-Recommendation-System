import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import engine, Base, SessionLocal
from app.services.model_loader import model_store
from app.services.movie_service import sync_movies_from_artifacts_or_csv
from app.api import auth, movies, ratings, recommendations, admin

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("recomfusion")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize Database Tables
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)

    # 2. Load Model Artifacts
    logger.info("Loading Google Colab model artifacts...")
    artifacts_loaded = model_store.load_artifacts()
    if artifacts_loaded:
        logger.info("Model artifacts successfully loaded and ready for high-speed inference.")
    else:
        logger.warning("Model artifacts not fully present in backend/artifacts/. Ready to receive artifacts.")

    # 3. Synchronize Movies Catalog
    logger.info("Syncing movies catalog into database...")
    db = SessionLocal()
    try:
        count = sync_movies_from_artifacts_or_csv(db)
        logger.info(f"Database contains {count} series/movies.")
    except Exception as e:
        logger.error(f"Catalog sync error: {e}")
    finally:
        db.close()

    yield

    logger.info("Shutting down RecomFusion backend.")

app = FastAPI(
    title="RecomFusion - Hybrid Web Series Recommendation API",
    description="High-performance hybrid recommendation API combining Content-Based and Collaborative Filtering with Pearson Correlation similarity.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(movies.router)
app.include_router(ratings.router)
app.include_router(recommendations.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {
        "app": "RecomFusion API",
        "status": "online",
        "version": "1.0.0",
        "model_loaded": model_store.is_loaded,
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": model_store.is_loaded
    }
