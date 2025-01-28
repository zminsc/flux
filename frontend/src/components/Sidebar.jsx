import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const menuItems = [
  { name: 'HOME', path: '/home' },
  { name: 'INTERACT', path: '/interact' },
  { name: 'SUMMARIZE', path: '/summarize' },
  { name: 'ARRANGE', path: '/arrange' },
  { name: 'UNSUB', path: '/dashboard' },
];

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 h-full p-4 pt-24">
      <nav className="w-64 bg-coral-light p-4 rounded-xl">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`
                w-full text-left px-4 py-2 font-medium
                ${location.pathname === item.path 
                  ? 'bg-white text-coral-light rounded' 
                  : 'text-white hover:bg-white/10'
                }
              `}
            >
              {item.name}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default Sidebar; 