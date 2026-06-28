import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import ConfirmModal from '../components/ConfirmModal';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

const REPORT_REASONS = {
  false_information: 'Thông tin sai sự thật',
  scam: 'Lừa đảo',
  spam: 'Spam',
  inappropriate: 'Nội dung không phù hợp',
  other: 'Lý do khác',
};

const REPORT_STATUSES = {
  pending: 'Chờ xử lý',
  resolved: 'Đã xử lý (Vi phạm)',
  rejected: 'Từ chối (Bỏ qua)',
};

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState(''); // Client-side filter

  // Modals state
  const [actionModal, setActionModal] = useState({ isOpen: false, type: '', report: null, data: null });
  const [detailModal, setDetailModal] = useState({ isOpen: false, report: null });

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('report_status', statusFilter);
      
      const response = await apiClient.get(`/admin/reports?${params.toString()}`);
      setReports(response.data);
    } catch (err) {
      setError('Không thể tải danh sách báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const openActionModal = (report, action) => {
    setActionModal({
      isOpen: true,
      type: 'action',
      report,
      data: action // 'resolved' or 'rejected'
    });
  };

  const confirmAction = async () => {
    const { report, data } = actionModal;

    try {
      await apiClient.put(`/admin/reports/${report.id}/status`, { status: data });
      setReports(reports.map(r => r.id === report.id ? { ...r, status: data } : r));
    } catch (err) {
      const msg = err.response?.data?.detail || 'Có lỗi xảy ra, vui lòng thử lại.';
      alert(msg);
      fetchReports();
    } finally {
      setActionModal({ isOpen: false, type: '', report: null, data: null });
    }
  };

  // Lọc client-side cho lý do (Backend chỉ hỗ trợ filter status)
  const filteredReports = reasonFilter 
    ? reports.filter(r => r.reason === reasonFilter)
    : reports;

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 style={{ margin: 0 }}>Danh sách Báo cáo</h3>
          <div className="filter-bar">
            <select
              className="form-control"
              value={reasonFilter}
              onChange={e => setReasonFilter(e.target.value)}
            >
              <option value="">Tất cả lý do (Client-filter)</option>
              {Object.entries(REPORT_REASONS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>

            <select
              className="form-control"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(REPORT_STATUSES).map(([val, label]) => (
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
                <th>Người Báo Cáo</th>
                <th>Bài Đăng Bị Báo Cáo</th>
                <th>Lý Do</th>
                <th>Trạng Thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                    Không tìm thấy báo cáo nào
                  </td>
                </tr>
              ) : (
                filteredReports.map(report => (
                  <tr key={report.id}>
                    <td>#{report.id}</td>
                    <td>User #{report.user_id}</td>
                    <td>
                      <Link to="/posts" style={{ color: 'var(--info)', textDecoration: 'none', fontWeight: 500 }}>
                        Post #{report.post_id}
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{REPORT_REASONS[report.reason] || report.reason}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {report.description || 'Không có mô tả'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${report.status === 'resolved' ? 'active' : report.status === 'rejected' ? 'inactive' : 'locked'}`}>
                        {REPORT_STATUSES[report.status] || report.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="action-btn"
                          title="Xem chi tiết"
                          onClick={() => setDetailModal({ isOpen: true, report })}
                        >
                          <Eye size={18} className="text-primary" />
                        </button>
                        
                        {/* Chỉ hiện nút thao tác nếu chưa xử lý */}
                        {report.status === 'pending' && (
                          <>
                            <button
                              className="action-btn"
                              title="Xác nhận vi phạm"
                              onClick={() => openActionModal(report, 'resolved')}
                            >
                              <CheckCircle size={18} className="text-danger" />
                            </button>
                            <button
                              className="action-btn"
                              title="Từ chối báo cáo"
                              onClick={() => openActionModal(report, 'rejected')}
                            >
                              <XCircle size={18} style={{ color: 'var(--text-secondary)' }} />
                            </button>
                          </>
                        )}
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
        title={actionModal.data === 'resolved' ? 'Xác nhận vi phạm' : 'Từ chối báo cáo'}
        message={
          actionModal.data === 'resolved'
            ? `Bạn xác nhận Bài đăng #${actionModal.report?.post_id} đã vi phạm và Đóng báo cáo #${actionModal.report?.id}? (Lưu ý: API không tự động xóa bài viết, Admin phải tự xóa nếu cần).`
            : `Từ chối báo cáo #${actionModal.report?.id} này?`
        }
        confirmText={actionModal.data === 'resolved' ? 'Xác nhận vi phạm' : 'Từ chối'}
        isDanger={actionModal.data === 'resolved'}
        onConfirm={confirmAction}
        onCancel={() => setActionModal({ isOpen: false, type: '', report: null, data: null })}
      />

      {/* Detail Modal */}
      {detailModal.isOpen && detailModal.report && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 className="modal-title" style={{ margin: 0 }}>Chi tiết Báo cáo #{detailModal.report.id}</h3>
              <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => setDetailModal({ isOpen: false, report: null })}>Đóng</button>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Trạng thái:</span>
                <span className={`badge badge-${detailModal.report.status === 'resolved' ? 'active' : detailModal.report.status === 'rejected' ? 'inactive' : 'locked'}`}>
                  {REPORT_STATUSES[detailModal.report.status] || detailModal.report.status}
                </span>
              </div>
              <p><strong>Người báo cáo:</strong> ID #{detailModal.report.user_id}</p>
              <p>
                <strong>Bài đăng liên quan:</strong> ID #{detailModal.report.post_id}{' '}
                <Link to="/posts" style={{ color: 'var(--info)' }}>(Đi tới danh sách bài)</Link>
              </p>
              <p><strong>Lý do:</strong> {REPORT_REASONS[detailModal.report.reason] || detailModal.report.reason}</p>
            </div>
            
            <div>
              <strong>Mô tả chi tiết:</strong>
              <div style={{ padding: 12, backgroundColor: 'var(--background)', borderRadius: 8, marginTop: 8, whiteSpace: 'pre-wrap', minHeight: 60 }}>
                {detailModal.report.description || 'Không có mô tả chi tiết từ người dùng.'}
              </div>
            </div>
            
            {detailModal.report.status === 'pending' && (
              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    setDetailModal({ isOpen: false, report: null });
                    openActionModal(detailModal.report, 'rejected');
                  }}
                >
                  Từ chối
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => {
                    setDetailModal({ isOpen: false, report: null });
                    openActionModal(detailModal.report, 'resolved');
                  }}
                >
                  Xác nhận vi phạm
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
