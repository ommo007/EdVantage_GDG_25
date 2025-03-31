import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  BarChart, 
  FileText, 
  ArrowLeft, 
  Search, 
  Download,
  AlertCircle,
  Database,
  Layers,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getRecentQueries } from '../../firebase/rag';
import DashboardHeader from '../shared/DashboardHeader';

const RagAnalytics = () => {
  const { classId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [queries, setQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState({
    id: classId,
    name: "Loading class details..."
  });
  
  // Mock data for charts
  const mockQueryCountByDay = [
    { day: 'Mon', count: 24 },
    { day: 'Tue', count: 18 },
    { day: 'Wed', count: 32 },
    { day: 'Thu', count: 26 },
    { day: 'Fri', count: 22 },
    { day: 'Sat', count: 8 },
    { day: 'Sun', count: 6 },
  ];
  
  const mockTopQueries = [
    "What is the formula for calculating velocity?",
    "Explain the concept of gravitational force",
    "How do I solve quadratic equations?",
    "Define Newton's laws of motion",
    "What's the difference between kinetic and potential energy?"
  ];
  
  const mockClassData = {
    id: classId,
    name: "Advanced Physics 301",
    description: "A comprehensive study of classical and quantum mechanics"
  };
  
  useEffect(() => {
    fetchQueries();
    // In a real app, fetch the class details
    setSelectedClass(mockClassData);
  }, [classId]);
  
  const fetchQueries = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, you'd get actual query data
      // const recentQueries = await getRecentQueries(classId, 50);
      
      // For demo, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock query data
      const mockQueries = Array(20).fill(0).map((_, index) => ({
        id: `query-${index}`,
        question: mockTopQueries[index % mockTopQueries.length],
        userId: `user-${Math.floor(Math.random() * 10) + 1}`,
        userRole: "student",
        timestamp: new Date(Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000))
      }));
      
      setQueries(mockQueries);
    } catch (err) {
      setError("Failed to load query analytics. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter queries based on search
  const filteredQueries = searchTerm
    ? queries.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.userId.toLowerCase().includes(searchTerm.toLowerCase()))
    : queries;
  
  // Sort queries by timestamp (most recent first)
  const sortedQueries = [...filteredQueries].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
  
  // Group queries by day for the chart
  const getQueryDistribution = () => {
    return mockQueryCountByDay;
  };
  
  // Get most frequent questions
  const getTopQueries = () => {
    const questionCounts = queries.reduce((acc, query) => {
      acc[query.question] = (acc[query.question] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(questionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([question, count]) => ({ question, count }));
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <DashboardHeader userRole="instructor" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => navigate(`/instructor/study-materials/${classId}`)}
              className="text-indigo-600 hover:text-indigo-800 mb-2 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Study Materials
            </button>
            <h1 className="text-3xl font-bold text-indigo-900">RAG Analytics</h1>
            <p className="text-indigo-600">
              For class: {selectedClass.name}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-md transition duration-300 font-medium flex items-center"
            >
              <Download className="mr-2 h-5 w-5" />
              Export Data
            </button>
            <Link
              to={`/instructor/study-materials/${classId}`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 font-medium flex items-center"
            >
              <Database className="mr-2 h-5 w-5" />
              Manage Materials
            </Link>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}
        
        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg mr-4">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-medium text-indigo-900">Indexed Materials</h3>
                <p className="text-3xl font-bold text-indigo-600">7</p>
              </div>
            </div>
            <div className="h-1 w-full bg-indigo-100 rounded-full">
              <div className="h-1 bg-indigo-600 rounded-full" style={{ width: '70%' }}></div>
            </div>
            <p className="text-xs text-indigo-500 mt-1">7 of 10 materials indexed</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-teal-100 rounded-lg mr-4">
                <Layers className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-medium text-indigo-900">Total Queries</h3>
                <p className="text-3xl font-bold text-teal-600">{queries.length}</p>
              </div>
            </div>
            <div className="h-1 w-full bg-teal-100 rounded-full">
              <div className="h-1 bg-teal-600 rounded-full" style={{ width: '60%' }}></div>
            </div>
            <p className="text-xs text-teal-500 mt-1">Last 7 days</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-indigo-900">Active Users</h3>
                <p className="text-3xl font-bold text-purple-600">12</p>
              </div>
            </div>
            <div className="h-1 w-full bg-purple-100 rounded-full">
              <div className="h-1 bg-purple-600 rounded-full" style={{ width: '80%' }}></div>
            </div>
            <p className="text-xs text-purple-500 mt-1">Out of 15 enrolled students</p>
          </div>
        </div>
        
        {/* Query Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-indigo-900 mb-6 flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-indigo-600" />
            Queries by Day
          </h2>
          
          <div className="h-64 flex items-end justify-between space-x-2">
            {getQueryDistribution().map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center">
                <div className="relative w-full">
                  <div 
                    className="bg-indigo-600 hover:bg-indigo-700 rounded-t transition-all duration-200 w-full"
                    style={{ height: `${(item.count / 35) * 100}%` }}
                  >
                    <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-indigo-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100">
                      {item.count} queries
                    </div>
                  </div>
                </div>
                <div className="text-xs text-indigo-600 mt-2">{item.day}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Top Queries */}
          <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
            <h2 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center">
              <Database className="h-5 w-5 mr-2 text-indigo-600" />
              Top Questions
            </h2>
            
            <div className="space-y-4">
              {getTopQueries().map((item, index) => (
                <div key={index} className="border-b border-indigo-50 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <p className="text-indigo-800 font-medium">{item.question}</p>
                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
                      {item.count || 1} {(item.count || 1) === 1 ? 'query' : 'queries'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Query Success Rate */}
          <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
            <h2 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-indigo-600" />
              Query Success Rate
            </h2>
            
            <div className="flex items-center mb-8">
              <div className="relative w-44 h-44">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e0e7ff"
                    strokeWidth="15"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="15"
                    strokeDasharray="251.2"
                    strokeDashoffset="50.24"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold text-indigo-700">80%</span>
                  <span className="text-xs text-indigo-500">Success Rate</span>
                </div>
              </div>
              <div className="ml-6 space-y-3 flex-1">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-indigo-700 font-medium">Answered with source</span>
                    <span className="text-indigo-700">64%</span>
                  </div>
                  <div className="h-2 bg-indigo-100 rounded-full">
                    <div className="h-2 bg-indigo-600 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-indigo-700 font-medium">Answered from model</span>
                    <span className="text-indigo-700">16%</span>
                  </div>
                  <div className="h-2 bg-indigo-100 rounded-full">
                    <div className="h-2 bg-indigo-400 rounded-full" style={{ width: '16%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-indigo-700 font-medium">No answer found</span>
                    <span className="text-indigo-700">20%</span>
                  </div>
                  <div className="h-2 bg-indigo-100 rounded-full">
                    <div className="h-2 bg-gray-400 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Queries List */}
        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
          <div className="p-6 border-b border-indigo-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-indigo-900">Recent Student Queries</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search queries..."
                className="w-full pl-9 pr-4 py-2 border border-indigo-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : sortedQueries.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-indigo-900 mb-2">No queries found</h3>
              <p className="text-indigo-600">Students haven't asked any questions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-indigo-100">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">Query</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-indigo-100">
                  {sortedQueries.map((query) => (
                    <tr key={query.id} className="hover:bg-indigo-50">
                      <td className="px-6 py-4">
                        <p className="text-indigo-800">{query.question}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                        {query.userId.replace('user-', 'Student ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                        {new Date(query.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RagAnalytics;
