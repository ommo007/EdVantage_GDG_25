import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const NetworkStatusAlert = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  
  useEffect(() => {
    // Handlers for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Show reconnected message briefly
      setShowOfflineMessage(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Don't render anything if online
  if (isOnline && !showOfflineMessage) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 left-0 right-0 mx-auto w-auto max-w-md z-50">
      <div className={`flex items-center p-3 rounded-md shadow-md ${
        isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {!isOnline && <WifiOff className="w-5 h-5 mr-2" />}
        <p>
          {isOnline 
            ? 'You are back online! Reconnecting services...' 
            : 'You are currently offline. Some features may be unavailable.'}
        </p>
      </div>
    </div>
  );
};

export default NetworkStatusAlert;
