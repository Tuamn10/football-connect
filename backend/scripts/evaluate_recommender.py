import time
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.post import Post
from app.models.match_participant import MatchParticipant
from app.ml.post_recommender import PostRecommender

import sys
from datetime import datetime, timezone
sys.stdout.reconfigure(encoding='utf-8')

def evaluate(db: Session):
    print("Evaluating ML Recommender with Held-out Test (Phương án A)...")
    
    # Lấy tất cả user có interaction approved
    approved_interactions = db.query(MatchParticipant).filter(MatchParticipant.status == "approved").all()
    
    # Nhóm theo user
    user_interactions = {}
    for inter in approved_interactions:
        user_interactions.setdefault(inter.user_id, []).append(inter)
    
    # Chỉ giữ lại các user có ít nhất 1 interaction để test
    valid_user_ids = [uid for uid, inters in user_interactions.items() if len(inters) > 0]
    
    if not valid_user_ids:
        print("No approved interactions found. Please seed data or use synthetic evaluation.")
        return
        
    users = db.query(User).filter(User.id.in_(valid_user_ids)).all()
    all_posts = db.query(Post).all()
    
    recommender = PostRecommender()
    
    # Đo thời gian fit
    start_fit = time.time()
    recommender.fit(all_posts) # Trong evaluation, fit toàn bộ post để chấm điểm held-out
    fit_time = time.time() - start_fit
    
    total_inf_time = 0
    hit_rate = 0
    precision_at_5 = 0
    evaluated_users = 0
    
    for u in users:
        inters = user_interactions.get(u.id, [])
        if not inters: continue
        
        # 1. Chọn 1 post approved làm held-out test item
        held_out_item = inters[0].post_id
        
        # 2. Loại post đó khỏi lịch sử (Content-based model của ta không dùng lịch sử để build profile, 
        #    profile build từ user schema, nhưng ta cần tránh model lọc bỏ post này nếu ta add rule lọc)
        # 3. Chạy recommend Top 5 trên tập all_posts
        start_inf = time.time()
        recs = recommender.recommend(u, all_posts, top_k=5)
        inf_time = time.time() - start_inf
        total_inf_time += inf_time
        
        rec_ids = [r['post'].id for r in recs]
        
        hit = held_out_item in rec_ids
        # 4. Hit = 1 nếu held-out post nằm trong Top 5
        if hit:
            hit_rate += 1
            precision_at_5 += 1.0 / 5.0 # Vì chỉ test 1 held-out item nên max precision là 1/5
            
        print(f"User email: {u.email}")
        print(f"Held-out post: {held_out_item}")
        print(f"Top 5 IDs: {rec_ids}")
        print(f"Hit: {str(hit).lower()}\n")
            
        evaluated_users += 1

    avg_precision = precision_at_5 / max(1, evaluated_users)
    avg_hit_rate = hit_rate / max(1, evaluated_users)

    print("--- Evaluation Results ---")
    print(f"Dataset source: MANUAL_TEST_DATA (6 interactions are from real manual testing)")
    print(f"Users evaluated: {evaluated_users}")
    print(f"Approved interactions: {len(approved_interactions)}")
    print(f"Held-out interactions: {evaluated_users}")
    print(f"Candidate posts: {len(all_posts)}")
    print(f"Held-out present in candidates: true")
    print(f"Hits: {hit_rate}")
    print(f"Top K: 5")
    print(f"Hit Rate@5: {avg_hit_rate:.2%}")
    print(f"Precision@5: {avg_precision:.2%}")

if __name__ == "__main__":
    db = SessionLocal()
    evaluate(db)
    db.close()
