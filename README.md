# Football Connect - Ứng dụng kết nối cộng đồng bóng đá phong trào

## 1. Giới thiệu

Football Connect là ứng dụng hỗ trợ cộng đồng bóng đá phong trào trong việc tìm kiếm trận đấu, tìm đối giao lưu, tìm người chơi, tìm sân bóng và quản lý lịch tham gia trận đấu.

Hệ thống cho phép người dùng đăng bài tìm kèo, tham gia trận đấu, lưu bài quan tâm, xem sân bóng trên bản đồ, đánh giá sân bóng và báo cáo bài viết vi phạm. Ngoài ra, hệ thống có trang quản trị giúp admin quản lý người dùng, bài đăng, sân bóng, báo cáo và thống kê hoạt động.

## 2. Mục tiêu đề tài

- Xây dựng hệ thống giúp người chơi bóng đá phong trào dễ dàng tìm trận đấu phù hợp.
- Hỗ trợ người dùng đăng bài tìm đối, tìm người chơi, pass sân hoặc tìm sân.
- Hỗ trợ quản lý thông tin sân bóng và hiển thị sân trên bản đồ.
- Hỗ trợ người dùng tham gia trận đấu và quản lý lịch cá nhân.
- Xây dựng trang quản trị để quản lý người dùng, bài đăng, sân bóng và báo cáo vi phạm.

## 3. Đối tượng sử dụng

- Người chơi bóng đá phong trào.
- Chủ sân bóng.
- Quản trị viên hệ thống.

## 4. Công nghệ sử dụng

- Mobile App: React Native Expo
- Backend: FastAPI
- Database: PostgreSQL + PostGIS
- Map: OpenStreetMap
- Routing: OSRM
- AI: KNN, NLP, LLM
- Ngôn ngữ lập trình: Python, JavaScript, SQL
- Version Control: GitHub

## 5. Chức năng chính

### Người dùng

- Đăng ký, đăng nhập.
- Cập nhật hồ sơ cá nhân.
- Xem danh sách kèo bóng đá.
- Tạo bài đăng tìm kèo.
- Tìm kiếm và lọc bài đăng.
- Xem chi tiết bài đăng.
- Tham gia trận đấu.
- Lưu bài quan tâm.
- Xem lịch trận của tôi.
- Xem sân bóng trên bản đồ.
- Báo cáo bài viết vi phạm.
- Đánh giá sân bóng.

### Chủ sân

- Quản lý thông tin sân bóng.
- Thêm, sửa, xóa sân bóng.
- Cập nhật giá sân, địa chỉ, loại sân và hình ảnh.

### Admin

- Quản lý người dùng.
- Quản lý bài đăng.
- Quản lý sân bóng.
- Quản lý báo cáo vi phạm.
- Xem thống kê hệ thống.

## 6. Cấu trúc thư mục

football-connect/
├── backend/
├── mobile/
├── documents/
└── README.md