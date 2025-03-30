import { CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const SuccessAnimation = () => {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    // Start animation after a short delay
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-24 w-24 mx-auto">
      {/* Circle background */}
      <div 
        className={`absolute inset-0 rounded-full bg-green-100 transform transition-all duration-700 ease-out ${
          animate ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
      ></div>
      
      {/* Check icon */}
      <div 
        className={`absolute inset-0 flex items-center justify-center transform transition-all duration-500 delay-300 ease-out ${
          animate ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        <CheckCircle 
          className="h-12 w-12 text-green-500" 
          strokeWidth={3}
        />
      </div>
      
      {/* Ripple effect */}
      <div 
        className={`absolute inset-0 rounded-full border-4 border-green-400 transform transition-all duration-1000 delay-200 ${
          animate ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
        }`}
      ></div>
    </div>
  );
};

export default SuccessAnimation;
