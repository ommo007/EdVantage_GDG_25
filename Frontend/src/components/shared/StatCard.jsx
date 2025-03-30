const StatCard = ({ icon, title, value, bgColor = "bg-indigo-100", textColor = "text-indigo-600" }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
      <div className="flex items-center">
        <div className={`p-3 ${bgColor} rounded-lg`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-indigo-900">{title}</h3>
          <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
