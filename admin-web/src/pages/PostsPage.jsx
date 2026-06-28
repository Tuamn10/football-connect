import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import ConfirmModal from '../components/ConfirmModal';
import { Search, Eye, Trash2, Calendar, MapPin, Users, Edit3 } from 'lucide-react';

const POST_TYPES = {
  find_player: 'Tìm người',
  find_opponent: 'Tìm đối thủ',
  pass_field: 'Pass sân',
  find_field: 'Tìm sân',
};

const POST_STATUSES = {
  open: 'Đang mở',
  full: 'Đã đủ người',
  cancelled: 'Đã hủy',
  expired: 'Đã hết hạn',
};

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals state
  const [actionModal, setActionModal] = useState({ isOpen: false, type: '', post: null, data: null });
  const [detailModal, setDetailModal] = useState({ isOpen: false, post: null });

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (statusFilter) params.append('post_status', statusFilter);
      if (typeFilter) params.append('post_type', typeFilter);

      const response = await apiClient.get(`/admin/posts?${params.toString()}`);
      setPosts(response.data);
    } catch (err) {
      setError('Không thể tải danh sách bài đăng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, typeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  const openStatusModal = (post, newStatus) => {
    if (post.status === newStatus) return;
    setActionModal({
      isOpen: true,
      type: 'status',
      post,
      data: newStatus
    });
  };

  const openDeleteModal = (post) => {
    setActionModal({
      isOpen: true,
      type: 'delete',
      post,
      data: null
    });
  };

  const confirmAction = async () => {
    const { type, post, data } = actionModal;

    try {
      if (type === 'status') {
        await apiClient.put(`/admin/posts/${post.id}/status`, { status: data });
        setPosts(posts.map(p => p.id === post.id ? { ...p, status: data } : p));
      } else if (type === 'delete') {
        await apiClient.delete(`/admin/posts/${post.id}`);
        setPosts(posts.filter(p => p.id !== post.id));
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Có lỗi xảy ra, vui lòng thử lại.';
      alert(msg);
      fetchPosts();
    } finally {
      setActionModal({ isOpen: false, type: '', post: null, data: null });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleString('vi-VN');
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div style={{ position: 'relative', maxWidth: 300, flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm tiêu đề, mô tả..."
                style={{ paddingLeft: 36 }}
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Tìm</button>
          </form>

          <div className="filter-bar">
            <select
              className="form-control"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="">Tất cả loại bài</option>
              {Object.entries(POST_TYPES).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>

            <select
              className="form-control"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(POST_STATUSES).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="alert alert-danger" style={{ margin: 20 }}>{error}</div>}

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Thông tin</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                    Không tìm thấy bài đăng nào
                  </td>
                </tr>
              ) : (
                posts.map(post => (
                  <tr key={post.id}>
                    <td>#{post.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{post.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        User ID: {post.user_id}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, marginBottom: 4 }}>
                        <span style={{ fontWeight: 500 }}>Loại:</span> {POST_TYPES[post.post_type] || post.post_type}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} /> {formatDate(post.match_time)}
                      </div>
                    </td>
                    <td>
                      <select
                        className="form-control"
                        value={post.status}
                        onChange={(e) => openStatusModal(post, e.target.value)}
                        style={{ padding: '6px 30px 6px 12px', width: 'auto', fontSize: 13 }}
                      >
                        {Object.entries(POST_STATUSES).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="action-btn"
                          title="Xem chi tiết"
                          onClick={() => setDetailModal({ isOpen: true, post })}
                        >
                          <Eye size={18} className="text-primary" />
                        </button>
                        <button
                          className="action-btn"
                          title="Xóa bài đăng"
                          onClick={() => openDeleteModal(post)}
                        >
                          <Trash2 size={18} className="text-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={actionModal.isOpen}
        title={actionModal.type === 'status' ? 'Xác nhận đổi trạng thái' : 'Xác nhận xóa bài đăng'}
        message={
          actionModal.type === 'status'
            ? `Đổi trạng thái bài "${actionModal.post?.title}" thành ${POST_STATUSES[actionModal.data]}?`
            : `Cảnh báo: Hành động này sẽ xóa vĩnh viễn bài đăng "${actionModal.post?.title}" và không thể khôi phục. Bạn có chắc chắn?`
        }
        confirmText={actionModal.type === 'status' ? 'Lưu' : 'Xóa vĩnh viễn'}
        isDanger={actionModal.type === 'delete'}
        onConfirm={confirmAction}
        onCancel={() => setActionModal({ isOpen: false, type: '', post: null, data: null })}
      />

      {/* Detail Modal */}
      {detailModal.isOpen && detailModal.post && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 className="modal-title" style={{ margin: 0 }}>Chi tiết bài đăng #{detailModal.post.id}</h3>
              <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => setDetailModal({ isOpen: false, post: null })}>Đóng</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p><strong>Tiêu đề:</strong> {detailModal.post.title}</p>
                <p><strong>Loại bài:</strong> {POST_TYPES[detailModal.post.post_type]}</p>
                <p><strong>Trạng thái:</strong> {POST_STATUSES[detailModal.post.status]}</p>
                <p><strong>User ID:</strong> {detailModal.post.user_id}</p>
                <p><strong>Loại sân:</strong> Sân {detailModal.post.field_type}</p>
              </div>
              <div>
                <p><strong>Khu vực:</strong> {detailModal.post.area || 'Không rõ'}</p>
                <p><strong>Thời gian:</strong> {formatDate(detailModal.post.match_time)}</p>
                <p><strong>Trình độ:</strong> {detailModal.post.required_level}</p>
                <p><strong>Số người cần:</strong> {detailModal.post.needed_players}</p>
                <p><strong>Chi phí:</strong> {detailModal.post.cost ? `${detailModal.post.cost.toLocaleString('vi-VN')} VND` : 'Miễn phí'}</p>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <strong>Mô tả:</strong>
              <div style={{ padding: 12, backgroundColor: 'var(--background)', borderRadius: 8, marginTop: 8, whiteSpace: 'pre-wrap' }}>
                {detailModal.post.description || 'Không có mô tả'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsPage;
