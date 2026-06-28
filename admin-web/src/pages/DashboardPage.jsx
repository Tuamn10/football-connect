import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import StatCard from '../components/StatCard';
import { Users, FileText, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/admin/overview');
      setStats(response.data);
    } catch (err) {
      setError('Không thể tải dữ liệu tổng quan. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="loading-container" style={{ height: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'space-between' }}>
        {error}
        <button onClick={fetchStats} className="btn btn-outline" style={{ padding: '4px 8px', borderColor: 'currentColor', color: 'inherit' }}>Thử lại</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button className="btn btn-outline" onClick={fetchStats} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> 
          Làm mới
        </button>
      </div>

      <div className="stat-grid">
        <a href="/users" style={{ textDecoration: 'none', color: 'inherit' }}>
          <StatCard 
            title="Tổng người dùng" 
            value={stats?.total_users || 0} 
            icon={Users} 
            colorClass="text-primary" 
          />
        </a>
        <a href="/posts" style={{ textDecoration: 'none', color: 'inherit' }}>
          <StatCard 
            title="Tổng bài đăng" 
            value={stats?.total_posts || 0} 
            icon={FileText} 
          />
        </a>
        <a href="/fields" style={{ textDecoration: 'none', color: 'inherit' }}>
          <StatCard 
            title="Tổng sân bóng" 
            value={stats?.total_fields || 0} 
            icon={MapPin} 
          />
        </a>
        <a href="/reports" style={{ textDecoration: 'none', color: 'inherit' }}>
          <StatCard 
            title="Báo cáo chờ xử lý" 
            value={stats?.pending_reports || 0} 
            icon={AlertTriangle} 
            colorClass="text-danger" 
          />
        </a>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Chi tiết hoạt động</h3>
        </div>
        <div style={{ padding: 24 }}>
          <p><strong>Người dùng đang hoạt động:</strong> {stats?.total_users || 0}</p>
          <p><strong>Bài đăng đang mở:</strong> {stats?.open_posts || 0}</p>
          <p><strong>Sân bóng đang hoạt động:</strong> {stats?.active_fields || 0}</p>
          <p><strong>Tổng báo cáo:</strong> {stats?.total_reports || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
