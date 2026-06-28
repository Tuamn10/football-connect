import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import ConfirmModal from '../components/ConfirmModal';
import { Search, Lock, Unlock, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [actionModal, setActionModal] = useState({ isOpen: false, type: '', user: null, data: null });

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('user_status', statusFilter);
      
      const response = await apiClient.get(`/admin/users?${params.toString()}`);
      setUsers(response.data);
    } catch (err) {
      setError('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'field_owner': return 'Chủ sân';
      case 'user': return 'Người dùng';
      default: return role;
    }
  };

  const openStatusModal = (user) => {
    if (user.id === currentUser.id) {
      alert('Bạn không thể khóa tài khoản của chính mình!');
      return;
    }
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setActionModal({
      isOpen: true,
      type: 'status',
      user,
      data: newStatus
    });
  };

  const openRoleModal = (user, newRole) => {
    if (user.id === currentUser.id) {
      alert('Bạn không thể thay đổi vai trò của chính mình!');
      // Reset select UI value
      fetchUsers();
      return;
    }
    if (user.role === newRole) return;
    
    setActionModal({
      isOpen: true,
      type: 'role',
      user,
      data: newRole
    });
  };

  const confirmAction = async () => {
    const { type, user, data } = actionModal;
    
    try {
      if (type === 'status') {
        await apiClient.put(`/admin/users/${user.id}/status`, { status: data });
      } else if (type === 'role') {
        await apiClient.put(`/admin/users/${user.id}/role`, { role: data });
      }
      
      // Update local state to avoid full refetch if not needed
      setUsers(users.map(u => {
        if (u.id === user.id) {
          return type === 'status' ? { ...u, status: data } : { ...u, role: data };
        }
        return u;
      }));
      
    } catch (err) {
      const msg = err.response?.data?.detail || 'Có lỗi xảy ra, vui lòng thử lại.';
      alert(msg);
      // Re-fetch to ensure sync with server
      fetchUsers();
    } finally {
      setActionModal({ isOpen: false, type: '', user: null, data: null });
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
                placeholder="Tìm kiếm tên, email, sđt..." 
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
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="">Tất cả vai trò</option>
              <option value="user">Người dùng</option>
              <option value="field_owner">Chủ sân</option>
              <option value="admin">Quản trị viên</option>
            </select>
            
            <select 
              className="form-control" 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Đã khóa</option>
            </select>
          </div>
        </div>

        {error && <div className="alert alert-danger" style={{ margin: 20 }}>{error}</div>}

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Người dùng</th>
                <th>Vai trò</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td>
                      <div className="user-cell">
                        <div className="avatar">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{user.name || 'Chưa cập nhật'}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select 
                        className="form-control" 
                        value={user.role}
                        onChange={(e) => openRoleModal(user, e.target.value)}
                        style={{ padding: '6px 30px 6px 12px', width: 'auto', fontSize: 13 }}
                        disabled={user.id === currentUser.id}
                      >
                        <option value="user">Người dùng</option>
                        <option value="field_owner">Chủ sân</option>
                        <option value="admin">Quản trị viên</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge badge-${user.status}`}>
                        {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                        <button 
                          className="action-btn"
                          title={user.status === 'active' ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                          onClick={() => openStatusModal(user)}
                          disabled={user.id === currentUser.id}
                          style={{ opacity: user.id === currentUser.id ? 0.3 : 1 }}
                        >
                          {user.status === 'active' ? (
                            <Lock size={18} className="text-danger" />
                          ) : (
                            <Unlock size={18} className="text-primary" />
                          )}
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

      <ConfirmModal 
        isOpen={actionModal.isOpen}
        title={actionModal.type === 'status' ? 'Xác nhận thay đổi trạng thái' : 'Xác nhận đổi vai trò'}
        message={
          actionModal.type === 'status'
            ? `Bạn có chắc chắn muốn ${actionModal.data === 'active' ? 'mở khóa' : 'khóa'} tài khoản của ${actionModal.user?.name || actionModal.user?.email}?`
            : `Bạn có chắc chắn muốn đổi vai trò của ${actionModal.user?.name || actionModal.user?.email} thành ${getRoleLabel(actionModal.data)}?`
        }
        confirmText="Xác nhận"
        isDanger={actionModal.type === 'status' && actionModal.data === 'inactive'}
        onConfirm={confirmAction}
        onCancel={() => setActionModal({ isOpen: false, type: '', user: null, data: null })}
      />
    </div>
  );
};

export default UsersPage;
