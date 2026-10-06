import os
import json
import logging
from typing import Dict, Any, Optional, List, Tuple
import numpy as np
import pandas as pd
import joblib

from app.core.config import settings

logger = logging.getLogger(__name__)

class ModelStore:
    """
    Singleton in-memory cache for all Colab-generated model artifacts.
    Loads once on startup and serves rapid inference (< 50ms).
    """
    def __init__(self):
        self.is_loaded: bool = False
        self.artifact_dir: str = settings.MODEL_ARTIFACT_PATH
        
        # In-memory ML objects
        self.cbf_indices: Optional[np.ndarray] = None
        self.cbf_scores: Optional[np.ndarray] = None
        self.cf_indices: Optional[np.ndarray] = None
        self.cf_scores: Optional[np.ndarray] = None
        self.tfidf_vectorizer = None
        
        self.movie_id_to_index: Dict[int, int] = {}
        self.index_to_movie_id: Dict[int, int] = {}
        self.rating_counts: Dict[int, int] = {}
        self.user_rating_counts: Dict[int, int] = {}
        
        self.movies_df: Optional[pd.DataFrame] = None
        self.metrics: Dict[str, Any] = {}
        self.config: Dict[str, Any] = {
            "alpha": 0.5,
            "top_n": 50,
            "recommendation_k": 5,
            "user_cold_start_threshold": 3,
            "item_cold_start_threshold": 5,
            "relevant_rating_threshold": 4.0,
            "method": "Hybrid CBF + CF",
            "similarity": "Pearson Correlation"
        }
        
        self.artifact_status: Dict[str, Dict[str, Any]] = {}

    def _resolve_artifact_dir(self) -> str:
        # Check configured path, then ./artifacts, then ../hybrid_recommender_artifacts
        candidates = [
            settings.MODEL_ARTIFACT_PATH,
            os.path.join(os.path.dirname(__file__), "..", "..", "artifacts"),
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "hybrid_recommender_artifacts"),
            "artifacts",
            "hybrid_recommender_artifacts"
        ]
        for c in candidates:
            if os.path.exists(c) and os.path.isdir(c):
                return os.path.abspath(c)
        return os.path.abspath(settings.MODEL_ARTIFACT_PATH)

    def load_artifacts(self) -> bool:
        target_dir = self._resolve_artifact_dir()
        self.artifact_dir = target_dir
        logger.info(f"Attempting to load model artifacts from: {target_dir}")

        expected_files = [
            "cbf_indices.npy",
            "cbf_scores.npy",
            "cf_indices.npy",
            "cf_scores.npy",
            "tfidf_vectorizer.pkl",
            "movie_id_to_index.pkl",
            "index_to_movie_id.pkl",
            "rating_counts.pkl",
            "user_rating_counts.pkl",
            "movies.csv",
            "metrics.json",
            "config.json"
        ]

        self.artifact_status = {}
        all_present = True

        for fname in expected_files:
            fpath = os.path.join(target_dir, fname)
            exists = os.path.exists(fpath)
            size = os.path.getsize(fpath) if exists else 0
            self.artifact_status[fname] = {
                "exists": exists,
                "size_bytes": size,
                "path": fpath
            }
            if not exists:
                all_present = False

        if not all_present:
            logger.warning(
                f"Some Colab model artifacts are missing in {target_dir}. "
                f"Present files: {[k for k, v in self.artifact_status.items() if v['exists']]}"
            )
            # Load whatever files exist (e.g. movies.csv or metrics.json)
            self._load_partial_artifacts(target_dir)
            self.is_loaded = False
            return False

        try:
            # 1. Load numpy arrays
            self.cbf_indices = np.load(os.path.join(target_dir, "cbf_indices.npy"))
            self.cbf_scores = np.load(os.path.join(target_dir, "cbf_scores.npy"))
            self.cf_indices = np.load(os.path.join(target_dir, "cf_indices.npy"))
            self.cf_scores = np.load(os.path.join(target_dir, "cf_scores.npy"))

            # 2. Load joblib dictionaries and vectorizer
            self.movie_id_to_index = joblib.load(os.path.join(target_dir, "movie_id_to_index.pkl"))
            self.index_to_movie_id = joblib.load(os.path.join(target_dir, "index_to_movie_id.pkl"))
            self.rating_counts = joblib.load(os.path.join(target_dir, "rating_counts.pkl"))
            self.user_rating_counts = joblib.load(os.path.join(target_dir, "user_rating_counts.pkl"))
            
            tfidf_path = os.path.join(target_dir, "tfidf_vectorizer.pkl")
            if os.path.exists(tfidf_path):
                self.tfidf_vectorizer = joblib.load(tfidf_path)

            # 3. Load movies DataFrame and fast metadata map
            self.movies_df = pd.read_csv(os.path.join(target_dir, "movies.csv"))
            self.movie_meta = {
                int(row["movieId"]): {
                    "title": str(row["title"]),
                    "genres": str(row.get("genres", ""))
                }
                for _, row in self.movies_df.iterrows()
            }

            # 4. Load JSON metadata
            with open(os.path.join(target_dir, "metrics.json"), "r", encoding="utf-8") as f:
                self.metrics = json.load(f)

            with open(os.path.join(target_dir, "config.json"), "r", encoding="utf-8") as f:
                self.config = json.load(f)

            self.is_loaded = True
            logger.info("Successfully loaded all Google Colab model artifacts into memory.")
            return True

        except Exception as e:
            logger.error(f"Error loading model artifacts: {e}", exc_info=True)
            self.is_loaded = False
            return False

    def _load_partial_artifacts(self, target_dir: str):
        # Gracefully load what is available
        movies_csv = os.path.join(target_dir, "movies.csv")
        if os.path.exists(movies_csv):
            try:
                self.movies_df = pd.read_csv(movies_csv)
            except Exception:
                pass

        metrics_json = os.path.join(target_dir, "metrics.json")
        if os.path.exists(metrics_json):
            try:
                with open(metrics_json, "r", encoding="utf-8") as f:
                    self.metrics = json.load(f)
            except Exception:
                pass

        config_json = os.path.join(target_dir, "config.json")
        if os.path.exists(config_json):
            try:
                with open(config_json, "r", encoding="utf-8") as f:
                    self.config = json.load(f)
            except Exception:
                pass

model_store = ModelStore()
