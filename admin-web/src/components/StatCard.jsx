import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClass || ''}`}>
        <Icon size={24} />
      </div>
      <div className="stat-info">
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
