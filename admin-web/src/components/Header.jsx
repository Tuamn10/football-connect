import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header-title">{title}</div>
      <div className="header-user">
        <div className="user-info">
          <div className="user-name">{user?.name || 'Admin'}</div>
          <div className="user-role">Quản trị viên</div>
        </div>
        <div className="avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
        </div>
      </div>
    </header>
  );
};

export default Header;
