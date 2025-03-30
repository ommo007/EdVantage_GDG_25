import { Link } from 'react-router-dom';
import { Brain, LineChart, Users, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Background from "../../components/Background";
import Logo from "../../components/Logo";

export default function LandingPage() {
  const { currentUser, userRole } = useAuth() || {};

  return (
    <div className="min-h-screen relative">
      <Background />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        <header className="flex justify-between items-center mb-16">
          <Logo />
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <Link
                to={`/${userRole || 'student'}`}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-md hover:bg-indigo-700 transition duration-300 font-medium flex items-center"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-indigo-600 px-6 py-2.5 hover:text-indigo-800 transition duration-300 font-medium flex items-center"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-md hover:bg-indigo-700 transition duration-300 font-medium flex items-center"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </header>

        <main className="text-center">
          <h1 className="text-5xl font-bold text-indigo-900 mb-6 leading-tight">
            Empowering Education for All with AI
          </h1>

          <p className="text-xl text-indigo-700 mb-12 max-w-2xl mx-auto">
            Bridging gaps in education with personalized AI-driven learning for curious minds of all ages.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <FeatureCard
              icon={<Brain className="w-6 h-6 text-indigo-500" />}
              title="Personalized Learning Paths"
              description="Tailored lessons to meet the unique needs of every student."
            />
            <FeatureCard
              icon={<LineChart className="w-6 h-6 text-indigo-500" />}
              title="Real-Time Performance Insights"
              description="Get insights into your learning journey with AI-driven analytics."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6 text-indigo-500" />}
              title="AI Assistance & Mentorship"
              description="Leverage AI bots for instant help and expert resources."
            />
          </div>
        </main>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-indigo-100 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-indigo-800 ml-2">{title}</h3>
      </div>
      <p className="text-indigo-600">{description}</p>
    </div>
  )
}
