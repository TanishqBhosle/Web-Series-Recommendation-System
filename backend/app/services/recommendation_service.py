import logging
from typing import List, Dict, Any, Optional, Tuple
from app.services.model_loader import model_store

logger = logging.getLogger(__name__)

class RecommendationService:
    def __init__(self):
        pass

    def get_cbf_candidates(self, movie_id: int, top_n: int = 50) -> List[Tuple[int, float]]:
        """
        Exact implementation from Cell 26 of Web_Series_Recommendation_System.ipynb
        """
        if not model_store.is_loaded or movie_id not in model_store.movie_id_to_index:
            return []

        idx = model_store.movie_id_to_index[movie_id]
        candidates = []
        for movie_idx, score in zip(model_store.cbf_indices[idx], model_store.cbf_scores[idx]):
            target_movie_id = model_store.index_to_movie_id[int(movie_idx)]
            # Filter out self-recommendation if present
            if target_movie_id != movie_id:
                candidates.append((target_movie_id, float(score)))

        return candidates[:top_n]

    def get_cf_candidates(self, movie_id: int, top_n: int = 50) -> List[Tuple[int, float]]:
        """
        Exact implementation from Cell 27 of Web_Series_Recommendation_System.ipynb
        """
        if not model_store.is_loaded or movie_id not in model_store.movie_id_to_index:
            return []

        idx = model_store.movie_id_to_index[movie_id]
        candidates = []
        for movie_idx, score in zip(model_store.cf_indices[idx], model_store.cf_scores[idx]):
            target_movie_id = model_store.index_to_movie_id[int(movie_idx)]
            if target_movie_id != movie_id:
                candidates.append((target_movie_id, float(score)))

        return candidates[:top_n]

    def hybrid_recommend(
        self,
        user_id: int,
        seed_movie_id: int,
        top_n: int = 5,
        user_live_ratings_count: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Exact hybrid recommendation logic from Cell 28 of Web_Series_Recommendation_System.ipynb
        Combined with real-time user ratings count and cold-start detection.
        """
        if not model_store.is_loaded:
            return {
                "success": False,
                "message": "Model artifacts not loaded. Please download artifacts from Google Colab into backend/artifacts/.",
                "recommendations": [],
                "meta": None
            }

        default_alpha = model_store.config.get("alpha", 0.5)
        top_n_candidates = model_store.config.get("top_n", 50)
        user_threshold = model_store.config.get("user_cold_start_threshold", 3)
        item_threshold = model_store.config.get("item_cold_start_threshold", 5)

        alpha = default_alpha
        cold_start_applied = False
        cold_start_reasons = []

        # 1. User cold start check
        # Combine notebook's precomputed user rating count with live DB rating count
        stored_user_count = model_store.user_rating_counts.get(user_id, 0)
        total_user_count = (user_live_ratings_count if user_live_ratings_count is not None else stored_user_count)
        
        if total_user_count < user_threshold:
            alpha = 1.0
            cold_start_applied = True
            cold_start_reasons.append(f"User has only {total_user_count} ratings (threshold: < {user_threshold})")

        # 2. Item cold start check
        seed_rating_count = model_store.rating_counts.get(seed_movie_id, 0)
        if seed_rating_count < item_threshold:
            alpha = 1.0
            cold_start_applied = True
            cold_start_reasons.append(f"Seed item has only {seed_rating_count} ratings (threshold: < {item_threshold})")

        # 3. Retrieve CBF and CF candidates
        cbf = dict(self.get_cbf_candidates(seed_movie_id, top_n=top_n_candidates))
        cf = dict(self.get_cf_candidates(seed_movie_id, top_n=top_n_candidates))

        candidate_movies = set(cbf.keys()) | set(cf.keys())

        results = []
        for mid in candidate_movies:
            cbf_score = cbf.get(mid, 0.0)
            cf_score = cf.get(mid, 0.0)
            final_score = (alpha * cbf_score) + ((1.0 - alpha) * cf_score)

            results.append({
                "movie_id": int(mid),
                "final_score": float(final_score),
                "cbf_score": float(cbf_score),
                "cf_score": float(cf_score)
            })

        # Sort descending by final score
        results.sort(key=lambda x: x["final_score"], reverse=True)
        top_recommendations = results[:top_n]

        reason_str = "; ".join(cold_start_reasons) if cold_start_applied else None

        return {
            "success": True,
            "recommendations": top_recommendations,
            "meta": {
                "user_id": user_id,
                "seed_movie_id": seed_movie_id,
                "alpha": alpha,
                "cold_start_applied": cold_start_applied,
                "cold_start_reason": reason_str,
                "total_candidates": len(candidate_movies)
            }
        }

recommendation_service = RecommendationService()
