import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

function UnsubscribeModal({ 
  sender, 
  onClose, 
  onConfirm 
}) {
  const [includeDelete, setIncludeDelete] = useState(false);

  const handleConfirm = () => {
    onConfirm(includeDelete);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-lg font-medium text-gray-800">
            Unsubscribe from {sender.name}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="mb-6 text-gray-700">
            Are you sure you want to unsubscribe from emails from {sender.email}?
          </p>
          
          <label className="flex items-center gap-2 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={includeDelete}
              onChange={(e) => setIncludeDelete(e.target.checked)}
              className="w-4 h-4 accent-[#F3B8A6] rounded"
            />
            <span className="text-gray-700">
              Also delete all existing emails from this sender
            </span>
          </label>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-[#F3B8A6] text-white rounded-lg hover:bg-[#F3B8A6]/90 transition-colors"
            >
              CONFIRM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnsubscribeModal; 