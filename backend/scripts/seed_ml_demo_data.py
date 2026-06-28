import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.post import Post
from app.core.security import hash_password

AREAS = ["Cầu Giấy", "Hà Đông", "Hoàn Kiếm", "Thanh Xuân", "Đống Đa", "Ba Đình"]
POSITIONS = ["goalkeeper", "defender", "midfielder", "forward", None]
LEVELS = ["beginner", "average", "good", "advanced"]
POST_TYPES = ["find_opponent", "find_player", "pass_field", "find_field"]
FIELD_TYPES = ["5", "7", "11"]

def seed_ml_data(db: Session):
    print("Seeding synthetic users and posts for ML testing...")

    # Create dummy users
    users = []
    for i in range(10):
        email = f"ml_user_{i}@demo.com"
        existing = db.query(User).filter(User.email == email).first()
        if not existing:
            user = User(
                name=f"ML Demo User {i}",
                email=email,
                hashed_password=hash_password("123456"),
                role="user",
                area=random.choice(AREAS),
                position=random.choice(POSITIONS),
                level=random.choice(LEVELS),
            )
            db.add(user)
            users.append(user)
        else:
            users.append(existing)

    db.commit()

    # Check existing ML posts
    existing_posts_count = db.query(Post).filter(Post.title.like('[ML DEMO]%')).count()
    if existing_posts_count >= 20:
        print("Demo posts already exist. Skipping post generation.")
        return

    # Create dummy posts
    now = datetime.now(timezone.utc)
    for i in range(20):
        # We ensure some posts match some users exactly
        u = random.choice(users)
        ptype = random.choice(POST_TYPES)
        
        post = Post(
            user_id=u.id,
            title=f"[ML DEMO] Kèo {ptype} tại {u.area}",
            post_type=ptype,
            match_time=now + timedelta(days=random.randint(1, 10), hours=random.randint(1, 24)),
            area=u.area,
            field_type=random.choice(FIELD_TYPES),
            needed_players=random.randint(1, 5),
            required_level=u.level,
            description="Dữ liệu demo cho Machine Learning",
            status="open"
        )
        db.add(post)

    db.commit()
    print("Seeding complete.")

if __name__ == "__main__":
    db = SessionLocal()
    seed_ml_data(db)
    db.close()
