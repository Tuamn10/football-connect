# Football Connect - Nền tảng kết nối cộng đồng bóng đá phong trào

## 1. Giới thiệu

Football Connect là nền tảng toàn diện hỗ trợ cộng đồng bóng đá phong trào trong việc tìm kiếm trận đấu, tìm đối giao lưu, ghép đội, tìm sân bóng và quản lý lịch tham gia trận đấu một cách thông minh, nhanh chóng và bảo mật.

## 2. Kiến trúc hệ thống

Dự án được xây dựng theo mô hình hiện đại với 3 phân hệ chính:
- **Backend (FastAPI)**: Xử lý logic nghiệp vụ, quản lý dữ liệu PostgreSQL (PostGIS cho vị trí). Hệ thống tích hợp thuật toán AI (KNN) để gợi ý kèo đấu phù hợp và Gemini để phân tích ý định tìm kiếm ngôn ngữ tự nhiên.
- **Mobile App (React Native Expo)**: Ứng dụng dành cho người chơi bóng đá phong trào (hỗ trợ iOS / Android).
- **Admin Web (React + Vite)**: Trang quản trị dành cho Admin hệ thống, giúp kiểm soát người dùng, bài đăng, sân bóng, các báo cáo vi phạm và thống kê dữ liệu.

## 3. Chức năng chính

### Người chơi (Mobile App)
- Đăng ký, đăng nhập an toàn với JWT và phân quyền.
- Quản lý hồ sơ cá nhân, trình độ, vị trí thi đấu.
- Khám phá các trận đấu trên Feed (có hỗ trợ thuật toán KNN gợi ý bài phù hợp).
- **Tìm kiếm thông minh**: Hỗ trợ tìm kiếm theo từ khóa và Trợ lý AI nhận diện ý định.
- **Tạo 4 loại kèo**: Tìm người, Tìm đối thủ, Pass sân, Tìm sân.
- Xem chi tiết bài, xin tham gia trận đấu, tương tác với chủ bài.
- Bản đồ sân bóng: Xem danh sách sân bóng quanh khu vực, đánh giá chất lượng.
- Quản lý "Lịch trận của tôi" (những kèo đã tạo/tham gia) & Lưu bài viết quan tâm.

### Quản trị viên (Admin Web)
- Quản lý tài khoản người dùng và trạng thái hoạt động.
- Quản lý và duyệt danh sách bài đăng.
- Quản lý hệ thống sân bóng đá (thêm, sửa, xóa, thông tin tọa độ).
- Xử lý các báo cáo (Report) vi phạm cộng đồng.
- Bảng điều khiển (Dashboard) theo dõi thống kê toàn diện.

## 4. Cài đặt và Khởi chạy

### Yêu cầu tiên quyết
- Node.js v18+ & Expo CLI
- Python 3.10+
- PostgreSQL 14+ (cài sẵn PostGIS extension). Đã tạo sẵn database tên `football_connect`.

### 4.1. Chạy Backend (FastAPI)
```bash
cd backend
python -m venv .venv
# Kích hoạt môi trường (Windows): .venv\Scripts\activate
# Kích hoạt môi trường (Mac/Linux): source .venv/bin/activate

pip install -r requirements.txt

# Thiết lập môi trường
cp .env.example .env
# Chỉnh sửa file .env với thông tin kết nối DB và các SECRET_KEY tương ứng.

# Khởi tạo Database (Migration) và Seed dữ liệu mẫu:
python -m app.db.seed_demo_data

# Khởi chạy server:
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation tự động sinh: `http://localhost:8000/docs`

### 4.2. Chạy Mobile App (React Native)
```bash
cd mobile
npm install

# Cấu hình IP máy chủ backend
cp .env.example .env
# Ví dụ: EXPO_PUBLIC_API_URL=http://<IP_MAY_CUA_BAN>:8000

# Khởi động ứng dụng
npx expo start -c
```

### 4.3. Chạy Admin Web (Vite)
```bash
cd admin-web
npm install

# Đảm bảo VITE_API_URL trỏ đúng tới Backend (mặc định localhost:8000).

npm run dev
```

## 5. Cấu trúc thư mục

```text
football-connect/
├── backend/          # Chứa mã nguồn FastAPI, Models, ML, Services
├── mobile/           # Chứa mã nguồn Mobile App (Expo, Navigation, Screens)
├── admin-web/        # Chứa mã nguồn Dashboard (Vite, Pages, Components)
├── docs/             # Chứa tài liệu thiết kế và thuật toán AI/ML
└── README.md
```

## 6. Bảo mật & Lưu ý

- **KHÔNG** đưa mật khẩu, JWT Secret hay các khóa API thật (Gemini/SMTP) lên version control. Luôn sử dụng `.env` để cấu hình trong môi trường cục bộ/triển khai.
- Đảm bảo database đã chạy `CREATE EXTENSION postgis;` trước khi seed dữ liệu để hỗ trợ các chức năng tra cứu tọa độ sân bóng.