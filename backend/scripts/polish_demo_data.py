import os
import sys

# Get app directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.post import Post
from app.models.user import User

def main(dry_run=True):
    db: Session = SessionLocal()
    try:
        print(f"--- RUNNING DEMO DATA POLISH (Dry Run: {dry_run}) ---")
        
        # 1. Update users
        user_mappings = {
            "ML Demo User 1": "Nguyễn Minh Đức",
            "ML Demo User 2": "Trần Quốc Anh",
            "ML Demo User 3": "Lê Hoàng Nam",
            "ML Demo User 4": "Phạm Đức Huy",
            "ML Demo User 5": "Nguyễn Tuấn Anh",
            "ML Demo User 6": "Đỗ Minh Quân",
            "ML Demo User 7": "Bùi Quốc Việt",
            "ML Demo User 8": "Trần Đức Long",
            "ML Demo User 9": "Nguyễn Thành Công",
        }
        
        users_updated = 0
        users = db.query(User).filter(User.name.like('ML Demo User%')).all()
        for user in users:
            new_name = user_mappings.get(user.name)
            if new_name:
                print(f"[User {user.id}] {user.name} -> {new_name}")
                if not dry_run:
                    user.name = new_name
                users_updated += 1

        # 2. Update posts
        posts = db.query(Post).filter(Post.title.like('[ML DEMO]%')).all()
        posts_updated = 0
        
        for post in posts:
            new_title = post.title
            if 'find_player' in post.title:
                new_title = new_title.replace('[ML DEMO] Kèo find_player tại ', f'Cần thêm cầu thủ đá sân {post.field_type} tại ')
            elif 'find_opponent' in post.title:
                new_title = new_title.replace('[ML DEMO] Kèo find_opponent tại ', 'Tìm đội giao hữu tại ')
            elif 'pass_field' in post.title:
                new_title = new_title.replace('[ML DEMO] Kèo pass_field tại ', 'Pass sân cỏ nhân tạo tại ')
            elif 'find_field' in post.title:
                new_title = new_title.replace('[ML DEMO] Kèo find_field tại ', 'Cần tìm sân đá tại ')
            
            # fallback if exact matches didn't hit
            if '[ML DEMO]' in new_title:
                new_title = new_title.replace('[ML DEMO] ', '')
                
            new_description = "Kèo giao hữu vui vẻ, trình độ trung bình, ưu tiên người tham gia đúng giờ."
            
            print(f"[Post {post.id}] {post.title} -> {new_title}")
            print(f"  Desc: {post.description} -> {new_description}")
            
            if not dry_run:
                post.title = new_title
                post.description = new_description
            
            posts_updated += 1
            
        if not dry_run:
            db.commit()
            print("--- CHANGES COMMITTED ---")
            
        print(f"Users updated: {users_updated}")
        print(f"Posts updated: {posts_updated}")
        
    finally:
        db.close()

if __name__ == "__main__":
    dry_run = "--apply" not in sys.argv
    main(dry_run)
