// import { useState, useEffect } from 'react';
// import { AlertCircle, WifiOff, RefreshCw } from 'lucide-react';
// import { onConnectionStatusChange, checkFirebaseConnection } from '../services/ConnectionStatus';

// const ConnectionStatusBanner = () => {
//   const [status, setStatus] = useState({ internet: true, firebase: { status: 'unknown' } });
//   const [visible, setVisible] = useState(false);
  
//   useEffect(() => {
//     const unsubscribe = onConnectionStatusChange((newStatus) => {
//       console.log('[ConnectionStatusBanner] New status:', newStatus);
//       setStatus(newStatus);
      
//       // Show banner immediately if issues exist
//       if (!newStatus.internet || newStatus.firebase.status === 'error') {
//         setVisible(true);
//       } else if (newStatus.firebase.status === 'connected' && newStatus.internet) {
//         // Auto-hide after 3 seconds when connection is restored
//         setTimeout(() => {
//           setVisible(false);
//         }, 3000);
//       }
//     });
    
//     // When there is an error, check more often (every 10 seconds)
//     const intervalMs = (status.firebase.status === 'error') ? 10000 : 30000;
//     const interval = setInterval(() => {
//       console.log('[ConnectionStatusBanner] Retrying connection check...');
//       checkFirebaseConnection();
//     }, intervalMs);
    
//     return () => {
//       unsubscribe();
//       clearInterval(interval);
//     };
//   }, [status.firebase.status]);
  
//   const handleRetry = () => {
//     console.log('[ConnectionStatusBanner] Retry button clicked');
//     checkFirebaseConnection();
//     // Optionally, force a full reload if internet is offline.
//     if (!status.internet) {
//       window.location.reload();
//     }
//   };
  
//   if (!visible) return null;
  
//   const isOffline = !status.internet;
//   const hasFirebaseError = status.firebase.status === 'error';
//   const bgColor = (isOffline || hasFirebaseError) ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200';
//   const textColor = (isOffline || hasFirebaseError) ? 'text-red-700' : 'text-yellow-700';
  
//   return (
//     <div className={`fixed top-0 left-0 right-0 z-50 ${bgColor} border-b p-2 text-sm flex items-center justify-between`}>
//       <div className="flex items-center">
//         {isOffline ? (
//           <WifiOff className={`h-4 w-4 mr-2 ${textColor}`} />
//         ) : hasFirebaseError ? (
//           <AlertCircle className={`h-4 w-4 mr-2 ${textColor}`} />
//         ) : (
//           <RefreshCw className={`h-4 w-4 mr-2 ${textColor} animate-spin`} />
//         )}
//         <span className={textColor}>
//           {isOffline
//             ? "You're offline. Please check your internet connection."
//             : hasFirebaseError
//             ? "Connection issue with Firebase. Some features may not work properly."
//             : "Connecting to services..."}
//         </span>
//       </div>
//       <button
//         onClick={handleRetry}
//         className={`px-2 py-1 ml-2 rounded-md border ${textColor} text-xs`}
//       >
//         Retry
//       </button>
//     </div>
//   );
// };

// export default ConnectionStatusBanner;

import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

const ConnectionStatusBanner = () => {
  const [status, setStatus] = useState({ internet: true });
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Check only for internet connectivity
    const checkConnection = () => {
      const isOnline = navigator.onLine;
      setStatus({ internet: isOnline });
      setVisible(!isOnline);
    };

    // Set up event listeners for online/offline status
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
    
    // Initial check
    checkConnection();
    
    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);
  
  const handleRetry = () => {
    if (!status.internet) {
      window.location.reload();
    }
  };
  
  if (!visible) return null;
  
  const isOffline = !status.internet;
  const bgColor = isOffline ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200';
  const textColor = isOffline ? 'text-red-700' : 'text-yellow-700';
  
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${bgColor} border-b p-2 text-sm flex items-center justify-between`}>
      <div className="flex items-center">
        {isOffline ? (
          <WifiOff className={`h-4 w-4 mr-2 ${textColor}`} />
        ) : (
          <RefreshCw className={`h-4 w-4 mr-2 ${textColor} animate-spin`} />
        )}
        <span className={textColor}>
          {isOffline
            ? "You're offline. Please check your internet connection."
            : "Checking connection..."}
        </span>
      </div>
      <button
        onClick={handleRetry}
        className={`px-2 py-1 ml-2 rounded-md border ${textColor} text-xs`}
      >
        Retry
      </button>
    </div>
  );
};

export default ConnectionStatusBanner;
