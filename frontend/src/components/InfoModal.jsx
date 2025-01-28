import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

function InfoModal({ sender, onClose }) {
  const [loading, setLoading] = useState(true);
  const [instructions, setInstructions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/emails/analyze/${encodeURIComponent(sender.email)}`,
          { credentials: 'include' }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch unsubscribe instructions');
        }
        const data = await response.json();
        setInstructions(data.instructions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructions();
  }, [sender.email]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-lg font-medium text-gray-800">
            Finding Unsubscribe Link
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#F3B8A6] border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
              {instructions || 'No methods for unsubscribing found'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InfoModal; 