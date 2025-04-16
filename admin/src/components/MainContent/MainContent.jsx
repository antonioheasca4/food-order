import React from 'react';
import './MainContent.css';
import Orders from '../../pages/Orders/Orders';
import List from '../../pages/List/List';
import Add from '../../pages/Add/Add';
import Users from '../../pages/Users/Users';

const MainContent = ({ page, apiUrl }) => {
  const renderContent = () => {
    switch (page) {
      case 'dashboard':
        return <Orders url={apiUrl} />;
      case 'products':
        return <List url={apiUrl} />;
      case 'add':
        return <Add url={apiUrl} />;
      case 'accounts':
        return <Users url={apiUrl} />;
      default:
        return <Orders url={apiUrl} />;
    }
  };

  return (
    <div className="main-content">
      {renderContent()}
    </div>
  );
};

export default MainContent; 