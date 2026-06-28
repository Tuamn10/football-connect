# -*- coding: utf-8 -*-
import sys
from pathlib import Path

base_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(base_dir))
from app.core.config import settings
from sqlalchemy import create_engine, text

engine = create_engine(str(settings.DATABASE_URL))

def check():
    with engine.begin() as conn:
        print('--- TỔNG SỐ BÀI ĐĂNG ---')
        total = conn.execute(text('SELECT COUNT(*) FROM posts;')).fetchone()[0]
        print(f'Tổng số bài: {total}\n')

        queries = {
            "Mô tả chứa từ khóa máy móc": """
                SELECT id, title, description
                FROM posts
                WHERE description ILIKE '%mã bài%'
                   OR description ILIKE '%mã ngẫu nhiên%'
                   OR description ILIKE '%ID bài%'
                   OR description ~ '#[0-9]+';
            """,
            "Tiêu đề có hậu tố số": """
                SELECT id, title
                FROM posts
                WHERE title ~ '\([0-9]+\)$';
            """,
            "Mô tả chứa lại số điện thoại của bài": """
                SELECT id, title, description, contact_phone
                FROM posts
                WHERE contact_phone IS NOT NULL
                  AND description IS NOT NULL
                  AND description LIKE '%' || contact_phone || '%';
            """,
            "Mô tả trùng quá nhiều (>3 lần)": """
                SELECT description, COUNT(*) AS total
                FROM posts
                WHERE description IS NOT NULL
                GROUP BY description
                HAVING COUNT(*) > 3;
            """,
            "Bài quá hạn còn mở": """
                SELECT id, title, match_time, status
                FROM posts
                WHERE match_time < NOW()
                  AND status = 'open';
            """
        }

        print('--- KẾT QUẢ KIỂM TRA CHUYÊN SÂU ---')
        has_errors = False
        for name, query in queries.items():
            res = conn.execute(text(query)).fetchall()
            print(f'[{name}]: {len(res)} bản ghi lỗi')
            if len(res) > 0:
                has_errors = True
                for row in res:
                    print("   ->", row)
        print()

        if has_errors:
            print("CÒN LỖI! Vui lòng kiểm tra lại.")
        else:
            print("HOÀN HẢO! Nội dung hoàn toàn sạch sẽ, không có dấu vết máy móc.")

if __name__ == "__main__":
    check()
