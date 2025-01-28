import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';

function App() {
  const handleLogin = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/api/auth/google`;
  };

  const Landing = () => (
    <div className="container mx-auto px-4 max-w-lg">
      <div className="mt-20 flex flex-col items-center bg-white p-8 rounded-lg shadow">
        <h1 className="text-4xl font-bold text-navy-light text-center mb-4">
          Welcome to Flux
        </h1>
        <p className="text-xl text-gray-600 text-center mb-8">
          Supercharge the way you use email.
        </p>
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 px-6 py-3 bg-navy-light text-white rounded-lg text-lg font-medium hover:bg-navy transition-colors"
        >
          <FcGoogle className="text-2xl" />
          Sign in with Google
        </button>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/home" element={<Layout><div className="p-6">Home Page (Coming Soon)</div></Layout>} />
        <Route path="/interact" element={<Layout><div className="p-6">Interact Page (Coming Soon)</div></Layout>} />
        <Route path="/summarize" element={<Layout><div className="p-6">Summarize Page (Coming Soon)</div></Layout>} />
        <Route path="/arrange" element={<Layout><div className="p-6">Arrange Page (Coming Soon)</div></Layout>} />
      </Routes>
    </Router>
  );
}

export default App; 