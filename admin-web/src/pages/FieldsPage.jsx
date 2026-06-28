import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import ConfirmModal from '../components/ConfirmModal';
import { Search, Eye, Trash2, MapPin, DollarSign, Clock } from 'lucide-react';

const FIELD_TYPES = {
  '5': 'Sân 5 người',
  '7': 'Sân 7 người',
  '11': 'Sân 11 người',
};

const FIELD_STATUSES = {
  active: 'Hoạt động',
  inactive: 'Tạm ngưng',
};

const FieldsPage = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals state
  const [actionModal, setActionModal] = useState({ isOpen: false, type: '', field: null, data: null });
  const [detailModal, setDetailModal] = useState({ isOpen: false, field: null });

  const fetchFields = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (statusFilter) params.append('field_status', statusFilter);
      if (typeFilter) params.append('field_type', typeFilter);

      const response = await apiClient.get(`/admin/fields?${params.toString()}`);
      setFields(response.data);
    } catch (err) {
      setError('Không thể tải danh sách sân bóng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, [statusFilter, typeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFields();
  };

  const openStatusModal = (field, newStatus) => {
    if (field.status === newStatus) return;
    setActionModal({
      isOpen: true,
      type: 'status',
      field,
      data: newStatus
    });
  };

  const openDeleteModal = (field) => {
    setActionModal({
      isOpen: true,
      type: 'delete',
      field,
      data: null
    });
  };

  const confirmAction = async () => {
    const { type, field, data } = actionModal;

    try {
      if (type === 'status') {
        await apiClient.put(`/admin/fields/${field.id}/status`, { status: data });
        setFields(fields.map(f => f.id === field.id ? { ...f, status: data } : f));
      } else if (type === 'delete') {
        await apiClient.delete(`/admin/fields/${field.id}`);
        setFields(fields.filter(f => f.id !== field.id));
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Có lỗi xảy ra, vui lòng thử lại.';
      alert(msg);
      fetchFields();
    } finally {
      setActionModal({ isOpen: false, type: '', field: null, data: null });
    }
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
                placeholder="Tìm kiếm tên sân, địa chỉ, sđt..."
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
              <option value="">Tất cả loại sân</option>
              {Object.entries(FIELD_TYPES).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>

            <select
              className="form-control"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(FIELD_STATUSES).map(([val, label]) => (
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
                <th>Sân bóng</th>
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
              ) : fields.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                    Không tìm thấy sân bóng nào
                  </td>
                </tr>
              ) : (
                fields.map(field => (
                  <tr key={field.id}>
                    <td>#{field.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{field.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        Owner ID: {field.owner_id || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, marginBottom: 4 }}>
                        <span style={{ fontWeight: 500 }}>Loại:</span> {FIELD_TYPES[field.field_type] || field.field_type}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        <DollarSign size={12} /> {field.price_per_hour ? `${field.price_per_hour.toLocaleString('vi-VN')} đ/h` : 'Chưa cập nhật'}
                      </div>
                    </td>
                    <td>
                      <select
                        className="form-control"
                        value={field.status}
                        onChange={(e) => openStatusModal(field, e.target.value)}
                        style={{ padding: '6px 30px 6px 12px', width: 'auto', fontSize: 13 }}
                      >
                        {Object.entries(FIELD_STATUSES).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="action-btn"
                          title="Xem chi tiết"
                          onClick={() => setDetailModal({ isOpen: true, field })}
                        >
                          <Eye size={18} className="text-primary" />
                        </button>
                        <button
                          className="action-btn"
                          title="Xóa sân bóng"
                          onClick={() => openDeleteModal(field)}
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
        title={actionModal.type === 'status' ? 'Xác nhận đổi trạng thái' : 'Xác nhận xóa sân'}
        message={
          actionModal.type === 'status'
            ? `Đổi trạng thái sân "${actionModal.field?.name}" thành ${FIELD_STATUSES[actionModal.data]}?`
            : `Cảnh báo: Hành động này sẽ xóa vĩnh viễn sân bóng "${actionModal.field?.name}" cùng mọi dữ liệu liên quan. Bạn có chắc chắn?`
        }
        confirmText={actionModal.type === 'status' ? 'Lưu' : 'Xóa vĩnh viễn'}
        isDanger={actionModal.type === 'delete'}
        onConfirm={confirmAction}
        onCancel={() => setActionModal({ isOpen: false, type: '', field: null, data: null })}
      />

      {/* Detail Modal */}
      {detailModal.isOpen && detailModal.field && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 className="modal-title" style={{ margin: 0 }}>Chi tiết Sân #{detailModal.field.id}</h3>
              <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => setDetailModal({ isOpen: false, field: null })}>Đóng</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p><strong>Tên sân:</strong> {detailModal.field.name}</p>
                <p><strong>Loại sân:</strong> {FIELD_TYPES[detailModal.field.field_type]}</p>
                <p><strong>Trạng thái:</strong> {FIELD_STATUSES[detailModal.field.status]}</p>
                <p><strong>Owner ID:</strong> {detailModal.field.owner_id}</p>
                <p><strong>SĐT:</strong> {detailModal.field.phone || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p><strong>Khu vực:</strong> {detailModal.field.area || 'Không rõ'}</p>
                <p><strong>Giá thuê:</strong> {detailModal.field.price_per_hour ? `${detailModal.field.price_per_hour.toLocaleString('vi-VN')} VND/h` : 'N/A'}</p>
                <p><strong>Giờ mở cửa:</strong> {detailModal.field.open_time || 'N/A'}</p>
                <p><strong>Giờ đóng cửa:</strong> {detailModal.field.close_time || 'N/A'}</p>
                <p><strong>Tọa độ:</strong> {detailModal.field.latitude}, {detailModal.field.longitude}</p>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <strong>Địa chỉ:</strong>
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--background)', borderRadius: 8, marginTop: 4 }}>
                {detailModal.field.address}
              </div>
            </div>
            {detailModal.field.description && (
              <div style={{ marginTop: 16 }}>
                <strong>Mô tả:</strong>
                <div style={{ padding: 12, backgroundColor: 'var(--background)', borderRadius: 8, marginTop: 8, whiteSpace: 'pre-wrap' }}>
                  {detailModal.field.description}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldsPage;
