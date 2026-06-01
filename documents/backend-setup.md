# Hướng dẫn chạy Backend FastAPI

## 1. Di chuyển vào thư mục backend

```bash
cd backend
```

## 2. Tạo môi trường ảo

```bash
python -m venv .venv
```

Nếu dùng Windows và lệnh trên không chạy, dùng:

```bash
py -m venv .venv
```

## 3. Kích hoạt môi trường ảo

### PowerShell

```powershell
.venv\Scripts\Activate.ps1
```

Nếu PowerShell chặn quyền chạy script, dùng:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.venv\Scripts\Activate.ps1
```

### Git Bash

```bash
source .venv/Scripts/activate
```

## 4. Cài thư viện

```bash
pip install -r requirements.txt
```

## 5. Chạy server FastAPI

```bash
uvicorn app.main:app --reload
```

## 6. Kiểm tra API

API gốc:

```text
http://127.0.0.1:8000
```

Health check:

```text
http://127.0.0.1:8000/api/v1/health
```

Tài liệu API Swagger:

```text
http://127.0.0.1:8000/docs
```

## 7. Kết quả mong đợi

Khi truy cập:

```text
http://127.0.0.1:8000/api/v1/health
```

Kết quả trả về:

```json
{
  "status": "ok",
  "service": "Football Connect API"
}
```