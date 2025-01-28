import React from 'react';

function UnsubCard({ 
  sender, 
  onCardClick, 
  onUnsubscribe, 
  onDelete, 
  onInfo 
}) {
  return (
    <div
      className="bg-white rounded-lg p-4 shadow-sm flex justify-between cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onCardClick(sender)}
    >
      {/* Left side - Stacked information */}
      <div className="flex flex-col justify-center min-w-0">
        <h3 className="text-lg font-medium truncate">{sender.name}</h3>
        <p className="text-gray-600 text-sm truncate">{sender.email}</p>
        <p className="text-navy-DEFAULT font-medium mt-1">
          {sender.count} emails
        </p>
      </div>

      {/* Right side - Stacked buttons */}
      <div className="flex flex-col justify-center gap-2 min-w-[100px] ml-4">
        {sender.unsubscribeUrl ? (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnsubscribe(sender);
              }}
              className="w-full py-1.5 bg-coral-light text-white rounded-lg hover:bg-coral-DEFAULT/90 transition-colors text-sm"
            >
              UNSUB
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(sender.email);
              }}
              className="w-full py-1.5 bg-navy-light text-white rounded-lg hover:bg-navy-DEFAULT/90 transition-colors text-sm"
            >
              DELETE
            </button>
          </>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInfo(sender);
            }}
            className="w-full py-1.5 bg-coral-light text-white rounded-lg hover:bg-coral-DEFAULT/90 transition-colors text-sm"
          >
            INFO
          </button>
        )}
      </div>
    </div>
  );
}

export default UnsubCard; 