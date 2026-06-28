import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import ConfirmModal from '../components/ConfirmModal';
import { Trash2, Star } from 'lucide-react';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, review: null });

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/admin/field-reviews');
      setReviews(response.data);
    } catch (err) {
      setError('Không thể tải danh sách đánh giá.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openDeleteModal = (review) => {
    setDeleteModal({
      isOpen: true,
      review
    });
  };

  const confirmDelete = async () => {
    const { review } = deleteModal;

    try {
      await apiClient.delete(`/admin/field-reviews/${review.id}`);
      setReviews(reviews.filter(r => r.id !== review.id));
    } catch (err) {
      const msg = err.response?.data?.detail || 'Có lỗi xảy ra, vui lòng thử lại.';
      alert(msg);
    } finally {
      setDeleteModal({ isOpen: false, review: null });
    }
  };

  // Render rating stars
  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '4px', fontWeight: 'bold' }}>{rating}</span>
        <Star size={16} fill="#FACC15" color="#FACC15" />
      </div>
    );
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 style={{ margin: 0 }}>Danh sách Đánh giá Sân</h3>
        </div>

        {error && <div className="alert alert-danger" style={{ margin: '20px 20px 0' }}>{error}</div>}

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Sân bóng</th>
                <th>Người dùng</th>
                <th>Đánh giá</th>
                <th>Nội dung</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">Đang tải dữ liệu...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">Chưa có đánh giá nào.</td>
                </tr>
              ) : (
                reviews.map(review => (
                  <tr key={review.id}>
                    <td>#{review.id}</td>
                    <td>{review.field_name || `Sân #${review.field_id}`}</td>
                    <td>{review.user_name || `User #${review.user_id}`}</td>
                    <td>{renderStars(review.rating)}</td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {review.comment || <span className="text-muted">Không có nhận xét</span>}
                    </td>
                    <td>{new Date(review.created_at).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => openDeleteModal(review)}
                        title="Xóa đánh giá"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Xác nhận xóa đánh giá"
        message={`Bạn có chắc chắn muốn xóa đánh giá của người dùng "${deleteModal.review?.user_name}" cho sân "${deleteModal.review?.field_name}"? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, review: null })}
        confirmText="Xóa"
        type="danger"
      />
    </div>
  );
};

export default ReviewsPage;
