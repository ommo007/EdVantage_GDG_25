import { BookOpen } from 'lucide-react';
//logo for darkbackgrounds
const DLogo = () => {
  return (
    <div className="flex items-center space-x-2">
    <BookOpen className="h-6 w-6 text-white" />
    <div className="text-2xl font-bold text-indigo-200">
      Edva<span className="text-purple-300">ntage</span>
    </div>
  </div>
  
  );
};

export default DLogo;