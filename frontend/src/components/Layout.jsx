import React from 'react';
import Sidebar from './Sidebar';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-cream">
      <div className="fixed top-0 left-0 right-0 p-4">
        <h1 className="text-2xl font-bold text-navy">
          flux
        </h1>
      </div>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pl-72 pt-24">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout; 