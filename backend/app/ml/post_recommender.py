import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer

LEVEL_MAP = {
    "beginner": 0,
    "average": 1,
    "good": 2,
    "advanced": 3
}

class PostRecommender:
    def __init__(self):
        # Pipeline preprocessing
        self.preprocessor = ColumnTransformer(
            transformers=[
                ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), ['area', 'field_type', 'post_type']),
                ('num', StandardScaler(), ['level_num', 'hours_until_match'])
            ]
        )
        self.model = NearestNeighbors(metric='euclidean', algorithm='auto')
        self.post_ids = []
        self.is_fitted = False

    def _extract_post_features(self, posts):
        import datetime
        now = datetime.datetime.now(datetime.timezone.utc)
        
        data = []
        for p in posts:
            hours = max(0.0, (p.match_time - now).total_seconds() / 3600.0) if p.match_time else 24.0
            
            data.append({
                'id': p.id,
                'area': p.area or "unknown",
                'field_type': str(p.field_type) if p.field_type else "7",
                'post_type': p.post_type or "unknown",
                'level_num': LEVEL_MAP.get(p.required_level, 1),
                'hours_until_match': hours
            })
        return pd.DataFrame(data)

    def _extract_user_features(self, user, posts):
        import statistics
        
        # Candidate medians and modes for missing features (Hướng A / Fallback)
        hours_list = []
        import datetime
        now = datetime.datetime.now(datetime.timezone.utc)
        for p in posts:
            if p.match_time:
                hours_list.append(max(0.0, (p.match_time - now).total_seconds() / 3600.0))
        
        median_hours = statistics.median(hours_list) if hours_list else 24.0
        
        # User defaults target to look for unknown/median if no history
        return pd.DataFrame([{
            'area': user.area or "unknown",
            'field_type': "unknown", # Hướng A fallback for categorical
            'post_type': "unknown", # Hướng A fallback for categorical
            'level_num': LEVEL_MAP.get(user.level, 1),
            'hours_until_match': median_hours
        }])

    def fit(self, posts):
        """Huấn luyện mô hình KNN với danh sách bài đăng"""
        if not posts:
            self.is_fitted = False
            return
            
        df = self._extract_post_features(posts)
        self.post_ids = df['id'].tolist()
        
        # Transform features
        X = self.preprocessor.fit_transform(df[['area', 'field_type', 'post_type', 'level_num', 'hours_until_match']])
        
        # Fit model
        self.model.fit(X)
        self.is_fitted = True

    def recommend(self, user, posts, top_k=10):
        """Đề xuất top K bài đăng cho người dùng"""
        if not self.is_fitted or not posts:
            return []
            
        user_df = self._extract_user_features(user, posts)
        user_vector = self.preprocessor.transform(user_df[['area', 'field_type', 'post_type', 'level_num', 'hours_until_match']])
        
        # Find neighbors
        actual_k = min(top_k, len(self.post_ids))
        distances, indices = self.model.kneighbors(user_vector, n_neighbors=actual_k)
        
        recommendations = []
        post_dict = {p.id: p for p in posts}
        
        for i, idx in enumerate(indices[0]):
            post_id = self.post_ids[idx]
            dist = distances[0][i]
            
            # Tính điểm tương đồng 0-100%
            similarity_score = 1 / (1 + dist)
            match_percentage = round(similarity_score * 100, 2)
            
            p = post_dict.get(post_id)
            if not p:
                continue
                
            # Sinh lý do cơ bản
            reasons = []
            if p.area == user.area and user.area:
                reasons.append("Cùng khu vực")
            if p.required_level == user.level:
                reasons.append("Trình độ phù hợp")
            if p.post_type == "find_player":
                reasons.append("Đúng vị trí tìm kiếm")
                
            if not reasons:
                reasons.append("Có sự tương đồng chung")
                
            recommendations.append({
                "post": p,
                "distance": float(dist),
                "similarity_score": float(similarity_score),
                "match_percentage": float(match_percentage),
                "reasons": reasons
            })
            
        return recommendations
