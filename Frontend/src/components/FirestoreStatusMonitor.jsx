import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { AlertCircle, Check, RefreshCw } from 'lucide-react';

const FirestoreStatusMonitor = ({ onStatusChange }) => {
  const [status, setStatus] = useState('checking');
  const [errorDetails, setErrorDetails] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const checkFirestoreConnection = async () => {
    try {
      setStatus('checking');
      setErrorDetails(null);
      
      // Try to access the 'users' collection
      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(1));
      await getDocs(q);
      
      setStatus('connected');
      if (onStatusChange) onStatusChange('connected');
      return true;
    } catch (error) {
      console.error('Firestore connection check failed:', error);
      setStatus('error');
      setErrorDetails(error.message);
      if (onStatusChange) onStatusChange('error', error);
      return false;
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await checkFirestoreConnection();
    setIsRetrying(false);
  };

  useEffect(() => {
    checkFirestoreConnection();
    
    // Set up periodic checks
    const interval = setInterval(() => {
      if (status === 'error') {
        checkFirestoreConnection();
      }
    }, 30000); // Check every 30 seconds if there was an error
    
    return () => clearInterval(interval);
  }, []);

  if (status === 'connected') return null; // Don't show anything when connected

  return (
    <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
      status === 'error' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
    }`}>
      <div className="flex items-center">
        {status === 'error' ? (
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
        ) : (
          <RefreshCw className={`h-5 w-5 text-yellow-500 mr-2 ${status === 'checking' ? 'animate-spin' : ''}`} />
        )}
        
        <div className="flex-1">
          {status === 'error' ? (
            <div>
              <p className="font-medium text-red-700">Firestore Connection Error</p>
              {errorDetails && <p className="text-xs text-red-600 mt-1">{errorDetails}</p>}
            </div>
          ) : (
            <p className="font-medium text-yellow-700">Checking Firestore connection...</p>
          )}
        </div>
        
        {status === 'error' && (
          <button 
            onClick={handleRetry} 
            disabled={isRetrying}
            className="ml-3 p-2 bg-white rounded-md border border-red-200 text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {isRetrying ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default FirestoreStatusMonitor;
