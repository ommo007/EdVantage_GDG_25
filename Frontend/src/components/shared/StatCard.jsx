const StatCard = ({ icon, title, value, subtitle, color = "indigo", bgColor, textColor }) => {
  // Color mapping for different themes
  const colorMap = {
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      border: "border-blue-100"
    },
    purple: {
      bg: "bg-purple-100", 
      text: "text-purple-600",
      border: "border-purple-100"
    },
    emerald: {
      bg: "bg-emerald-100",
      text: "text-emerald-600", 
      border: "border-emerald-100"
    },
    indigo: {
      bg: "bg-indigo-100",
      text: "text-indigo-600",
      border: "border-indigo-100"
    }
  };

  const colors = colorMap[color] || colorMap.indigo;
  const finalBgColor = bgColor || colors.bg;
  const finalTextColor = textColor || colors.text;
  const borderColor = colors.border;

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border ${borderColor}`}>
      <div className="flex items-center">
        <div className={`p-3 ${finalBgColor} rounded-lg`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-indigo-900">{title}</h3>
          <p className={`text-3xl font-bold ${finalTextColor}`}>{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
