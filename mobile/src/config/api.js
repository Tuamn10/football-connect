// Địa chỉ máy tính đang chạy FastAPI.
//
// Điện thoại thật:
// dùng IPv4 của máy tính, ví dụ http://192.168.1.12:8000
//
// Android Emulator:
// có thể dùng http://10.0.2.2:8000
//
// Không dùng 127.0.0.1 trên điện thoại thật.

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.2.197:8000";

export const API_TIMEOUT = 12000;