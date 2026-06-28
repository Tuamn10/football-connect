import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, MapPin, FileText, AlertTriangle, Star, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        Football Connect
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          Tổng quan
        </NavLink>
        <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          Người dùng
        </NavLink>
        <NavLink to="/fields" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <MapPin size={20} />
          Sân bóng
        </NavLink>
        <NavLink to="/posts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText size={20} />
          Bài đăng
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <AlertTriangle size={20} />
          Báo cáo vi phạm
        </NavLink>
        <NavLink to="/reviews" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Star size={20} />
          Đánh giá sân
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <LogOut size={20} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
