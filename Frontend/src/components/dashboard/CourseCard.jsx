import { Calendar, ArrowRight } from 'lucide-react';

const CourseCard = ({ course, onClick }) => {
  return (
    <button
      onClick={() => onClick(course.id)}
      className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 hover:border-indigo-300 transition-all duration-300 text-left group w-full"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-indigo-900">{course.name}</h3>
          <p className="text-indigo-600 mt-1">{course.subject}</p>
          <p className="text-sm text-gray-500 mt-2">Instructor: {course.instructor}</p>
          
          {course.progress !== undefined && (
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-indigo-600">Progress</span>
                <span className="text-sm font-medium text-indigo-800">{course.progress}%</span>
              </div>
              <div className="w-full bg-indigo-100 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full" 
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {course.nextClass && (
            <div className="flex items-center mt-4 text-sm text-indigo-500">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Next: {course.nextClass}</span>
            </div>
          )}

          {course.studentCount !== undefined && (
            <div className="flex items-center mt-4 text-sm text-indigo-500">
              <span>Students: {course.studentCount}</span>
            </div>
          )}

          {course.schedule && (
            <div className="flex items-center mt-2 text-sm text-indigo-500">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{course.schedule}</span>
            </div>
          )}
        </div>
        <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
};

export default CourseCard;
