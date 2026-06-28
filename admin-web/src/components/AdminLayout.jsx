import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Tổng quan hệ thống';
      case '/users': return 'Quản lý Người dùng';
      default: return 'Admin Dashboard';
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Header title={getPageTitle()} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
