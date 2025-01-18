import React from 'react';
import logo from '../assets/Images/MediLink.svg';

const Header: React.FC = () => {
  return (
    <header style={{ position: 'fixed', top: 0, left: 0, width: '100%', backgroundColor: '#fff', padding: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <img src={logo} alt="MediLink Logo" style={{ height: '40px' }} />
    </header>
  );
};

export default Header;
