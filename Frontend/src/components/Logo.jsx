
import { BookOpen } from 'lucide-react';
export default function Logo() {
    return (
      <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <div className="text-2xl font-bold text-indigo-700">
        Edva<span className="text-purple-600">ntage</span>
      </div>
      </div>
    )

  }