import React, { useEffect, useState } from 'react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import { BiUnlink } from 'react-icons/bi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import EmailModal from './EmailModal';
import InfoModal from './InfoModal';
import UnsubscribeModal from './UnsubscribeModal';
import UnsubCard from './UnsubCard';

function Dashboard() {
  const [senderStats, setSenderStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSender, setSelectedSender] = useState(null);
  const [senderEmails, setSenderEmails] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [infoSender, setInfoSender] = useState(null);
  const [unsubscribeSender, setUnsubscribeSender] = useState(null);
  const [sortBy, setSortBy] = useState('date');

  const filteredStats = senderStats.filter(stat => {
    const query = searchQuery.toLowerCase();
    return (
      stat.name.toLowerCase().includes(query) ||
      stat.email.toLowerCase().includes(query)
    );
  });

  const handleCardClick = async (sender) => {
    setSelectedSender(sender);
    setModalLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/emails/from/${encodeURIComponent(sender.email)}`,
        { credentials: 'include' }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch sender emails');
      }
      const data = await response.json();
      setSenderEmails(data);
    } catch (err) {
      console.error('Error fetching sender emails:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUnsubscribe = async (includeDelete) => {
    try {
      if (includeDelete) {
        await handleDeleteEmails(unsubscribeSender.email);
      }
      window.open(unsubscribeSender.unsubscribeUrl, '_blank');
    } catch (err) {
      console.error('Error during unsubscribe process:', err);
      alert('Failed to complete the unsubscribe process');
    }
  };

  const handleDeleteEmails = async (email) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/emails/delete/${encodeURIComponent(email)}`,
        { method: 'POST', credentials: 'include' }
      );
      if (!response.ok) {
        throw new Error('Failed to delete emails');
      }
      alert('Successfully deleted emails from sender');
    } catch (err) {
      console.error('Error deleting emails:', err);
      alert('Failed to delete emails');
    }
  };

  useEffect(() => {
    const fetchEmailStats = async () => {
      try {
        console.log('Fetching email stats from:', `${process.env.REACT_APP_BACKEND_URL}/api/emails/recent`);
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/emails/recent`,
          { credentials: 'include' }
        );
        console.log('Response status:', response.status);
        const responseData = await response.json();
        
        if (!response.ok) {
          console.error('Failed to fetch emails:', {
            status: response.status,
            statusText: response.statusText,
            data: responseData
          });
          throw new Error('Failed to fetch email statistics');
        }
        setSenderStats(responseData);
      } catch (err) {
        console.error('Dashboard error:', {
          message: err.message,
          stack: err.stack,
          type: err.name
        });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmailStats();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6B7DB3] border-t-transparent"></div>
    </div>
  );
  
  if (error) return (
    <div className="p-6">
      <div className="bg-red-100 text-red-700 p-4 rounded">Error: {error}</div>
    </div>
  );

  return (
    <div className="pr-4">
      {/* Search and Filter Bar */}
      <div className="flex gap-4 items-center">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="SEARCH..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-[#F0F0F0] rounded-lg focus:outline-none placeholder-gray-500"
          />
        </div>

        {/* Sort By Dropdown */}
        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white">
          <span className="text-gray-600">SORT BY</span>
          <FiChevronDown className="text-gray-600" />
        </button>

        {/* AI Filter */}
        <div className="relative">
          <input
            type="text"
            placeholder="AI FILTER..."
            className="px-4 py-2 bg-[#F7F3F0] rounded-lg focus:outline-none placeholder-gray-500 w-48"
          />
        </div>
      </div>

      {/* Email Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {filteredStats.map((sender, index) => (
          <UnsubCard
            key={index}
            sender={sender}
            onCardClick={handleCardClick}
            onUnsubscribe={setUnsubscribeSender}
            onDelete={handleDeleteEmails}
            onInfo={setInfoSender}
          />
        ))}
      </div>

      {/* Modals */}
      {selectedSender && (
        <EmailModal
          sender={selectedSender}
          loading={modalLoading}
          emails={senderEmails}
          onClose={() => {
            setSelectedSender(null);
            setSenderEmails([]);
          }}
        />
      )}

      {infoSender && (
        <InfoModal
          sender={infoSender}
          onClose={() => setInfoSender(null)}
        />
      )}

      {unsubscribeSender && (
        <UnsubscribeModal
          sender={unsubscribeSender}
          onClose={() => setUnsubscribeSender(null)}
          onConfirm={handleUnsubscribe}
        />
      )}
    </div>
  );
}

export default Dashboard; 