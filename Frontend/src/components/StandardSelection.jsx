"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  School,
  ChevronRight,
  Users,
  Layers
} from "lucide-react";

import DashboardHeader from "./shared/DashboardHeader";
import SearchBar from "./dashboard/SearchBar";

const mockClasses = [
  { id: 1, name: "Jr. KG", totalDivisions: 2, totalStudents: 50 },
  { id: 2, name: "Sr. KG", totalDivisions: 2, totalStudents: 55 },
  { id: 3, name: "1st Std", totalDivisions: 3, totalStudents: 60 },
  { id: 4, name: "2nd Std", totalDivisions: 3, totalStudents: 65 },
  { id: 5, name: "3rd Std", totalDivisions: 3, totalStudents: 70 },
  { id: 6, name: "4th Std", totalDivisions: 3, totalStudents: 75 },
  { id: 7, name: "5th Std", totalDivisions: 3, totalStudents: 80 },
  { id: 8, name: "6th Std", totalDivisions: 3, totalStudents: 85 },
  { id: 9, name: "7th Std", totalDivisions: 3, totalStudents: 90 },
  { id: 10, name: "8th Std", totalDivisions: 3, totalStudents: 95 },
  { id: 11, name: "9th Std", totalDivisions: 3, totalStudents: 100 },
  { id: 12, name: "10th Std", totalDivisions: 3, totalStudents: 110 },
];

const ClassSelection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay
      setClasses(mockClasses);
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassSelect = (standardId) => {
    navigate(`/admin/${standardId}`);
  };

  const filteredClasses = classes.filter(
    cls => cls.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <DashboardHeader userRole="admin" />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900">Manage Classes</h1>
            <p className="text-indigo-600 mt-2">Select a class to manage divisions, students, and teachers</p>
          </div>
          <div className="flex items-center">
            <SearchBar 
              placeholder="Search classes..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => (
              <div 
                key={cls.id}
                className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6 hover:shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => handleClassSelect(cls.id)}
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-indigo-100 rounded-lg mr-4">
                    <School className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-indigo-900">{cls.name}</h2>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center">
                    <Layers className="h-4 w-4 text-indigo-500 mr-2" />
                    <span className="text-indigo-700">{cls.totalDivisions} Divisions</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-indigo-500 mr-2" />
                    <span className="text-indigo-700">{cls.totalStudents} Students</span>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <div 
                    className="flex items-center text-indigo-600 font-medium cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the card's onClick from triggering
                      handleClassSelect(cls.id);
                    }}
                  >
                    Manage Class
                    <ChevronRight className="ml-1 h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClassSelection;