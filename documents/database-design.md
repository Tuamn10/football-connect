# Thiết kế cơ sở dữ liệu

## 1. Danh sách bảng

| STT | Tên bảng | Chức năng |
|---|---|---|
| 1 | users | Lưu thông tin người dùng |
| 2 | football_fields | Lưu thông tin sân bóng |
| 3 | posts | Lưu bài đăng tìm kèo bóng đá |
| 4 | match_participants | Lưu thông tin người tham gia trận đấu |
| 5 | saved_posts | Lưu bài đăng người dùng quan tâm |
| 6 | reports | Lưu báo cáo vi phạm |
| 7 | reviews | Lưu đánh giá sân bóng |
| 8 | notifications | Lưu thông báo người dùng |

## 2. Quan hệ chính

- Một người dùng có thể tạo nhiều bài đăng.
- Một người dùng có thể tham gia nhiều trận đấu.
- Một bài đăng có thể có nhiều người tham gia.
- Một sân bóng có thể có nhiều bài đăng.
- Một sân bóng có thể có nhiều đánh giá.
- Một người dùng có thể lưu nhiều bài đăng.
- Một bài đăng có thể bị báo cáo nhiều lần.

## 3. Phân quyền

| Quyền | Mô tả |
|---|---|
| user | Người chơi bóng đá thông thường |
| field_owner | Chủ sân bóng |
| admin | Quản trị viên hệ thống |