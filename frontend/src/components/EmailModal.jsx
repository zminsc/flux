import React from 'react';
import { FiX } from 'react-icons/fi';

function EmailModal({ sender, emails, loading, onClose }) {
  if (!sender) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-lg font-medium text-gray-800">
            Emails from {sender.name}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#F3B8A6] border-t-transparent"></div>
            </div>
          ) : emails.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No emails found from this sender.
            </p>
          ) : (
            <div className="space-y-4">
              {emails.map((email, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <h3 className="font-medium text-gray-800 mb-2">{email.subject}</h3>
                  <p className="text-sm text-gray-500">{email.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmailModal; 