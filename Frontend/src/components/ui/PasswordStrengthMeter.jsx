import { useState, useEffect } from 'react';

const PasswordStrengthMeter = ({ password }) => {
  const [strength, setStrength] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setMessage('');
      return;
    }

    // Calculate password strength
    let strengthScore = 0;
    
    // Length check
    if (password.length >= 8) strengthScore += 1;
    if (password.length >= 12) strengthScore += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strengthScore += 1;  // Has uppercase
    if (/[a-z]/.test(password)) strengthScore += 1;  // Has lowercase
    if (/[0-9]/.test(password)) strengthScore += 1;  // Has number
    if (/[^A-Za-z0-9]/.test(password)) strengthScore += 1;  // Has special char
    
    // Final strength score (0-5)
    let finalStrength = Math.min(5, Math.floor(strengthScore / 1.2));
    setStrength(finalStrength);
    
    // Set appropriate message
    switch(finalStrength) {
      case 0:
      case 1:
        setMessage('Weak');
        break;
      case 2:
      case 3:
        setMessage('Fair');
        break;
      case 4:
        setMessage('Good');
        break;
      case 5:
        setMessage('Strong');
        break;
      default:
        setMessage('');
    }
  }, [password]);

  // Don't render anything if no password
  if (!password) return null;

  const getBarColor = (index) => {
    if (index >= strength) return 'bg-gray-200';
    
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-green-400';
    return 'bg-green-500';
  };

  return (
    <div className="mt-2 mb-3">
      <div className="flex w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`transition-all duration-300 ease-in-out h-full flex-1 ${getBarColor(i)} ${i > 0 ? 'ml-0.5' : ''}`}
          />
        ))}
      </div>
      
      <div className="mt-1 flex justify-between">
        <p className="text-xs text-gray-600">Password strength</p>
        <p className={`text-xs font-medium ${
          strength <= 2 ? 'text-red-500' : 
          strength <= 3 ? 'text-yellow-500' : 
          'text-green-500'
        }`}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
