import { useState } from 'react';

const ProgressChart = ({ data, title, height = "h-40" }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="progress-chart">
      {title && <h3 className="text-sm font-medium text-indigo-800 mb-3">{title}</h3>}
      
      <div className={`${height} relative flex items-end justify-between space-x-2`}>
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          
          return (
            <div 
              key={index}
              className="h-full flex flex-col justify-end flex-1"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {hoveredIndex === index && (
                <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-indigo-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                  {item.label}: {item.value}
                </div>
              )}
              <div 
                className="bg-indigo-600 hover:bg-indigo-700 rounded-t transition-all duration-200"
                style={{ height: `${percentage}%` }}
              ></div>
              <div className="text-xs text-indigo-600 mt-1 text-center truncate">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressChart;
