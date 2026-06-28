import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: 100 }}>
      <h1 style={{ fontSize: 72, color: 'var(--primary)', marginBottom: 16 }}>404</h1>
      <h2 style={{ marginBottom: 24 }}>Không tìm thấy trang</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>
        Về trang chủ
      </Link>
    </div>
  );
};

export default NotFoundPage;
