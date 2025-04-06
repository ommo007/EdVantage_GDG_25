import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, BookOpen, Users, Monitor, Github, Twitter, Linkedin, Instagram, LogIn } from 'lucide-react';

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  
  const textArray = [
    "Empowering Education with AI",
    "Transform Your Learning Journey",
    "Succeed with Smart Tools"
  ];
  
  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Typing effect
  useEffect(() => {
    const text = textArray[currentTextIndex];
    
    if (!isDeleting && typedText === text) {
      // Once full text is typed, wait before deleting
      setTimeout(() => setIsDeleting(true), 1500);
      return;
    }
    
    if (isDeleting && typedText === '') {
      // Once deleted, move to next text in array
      setIsDeleting(false);
      setCurrentTextIndex((currentTextIndex + 1) % textArray.length);
      setTypingSpeed(150);
      return;
    }
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        setTypedText(text.substring(0, typedText.length + 1));
      } else {
        // Deleting
        setTypedText(text.substring(0, typedText.length - 1));
        setTypingSpeed(50);
      }
    }, typingSpeed);
    
    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, currentTextIndex, typingSpeed]);
  
  // Features data
  const features = [
    {
      icon: <BookOpen size={24} />,
      title: "AI Chatbot Assistance",
      description: "Get instant help with your studies using AI-powered chat that understands your learning style."
    },
    {
      icon: <Monitor size={24} />,
      title: "📖 Multilingual Learning Support",
      description: "Break language barriers with support for Hindi, Marathi, and English — making education accessible for everyone."
    },
    {
      icon: <Users size={24} />,
      title: "📚 Smart Study Space",
      description: "Experience a simplified MATLAB-like interface where lectures, assignments, quizzes, and AI tools are all in one place."
    }
  ];
  
  // SDGs data
  const sdgs = [
    {
      number: 4,
      title: "Quality Education",
      description: "Our AI-powered platform provides equitable access to high-quality educational resources and personalized learning experiences for students regardless of their location or background.",
      color: "bg-red-600"
    },
    {
      number: 3,
      title: "Good Health and Well-being",
      description: "We promote mental well-being through stress-reduction features and support systems that help students balance academic demands with personal wellness.",
      color: "bg-green-600"
    },
    {
      number: 10,
      title: "Reduced Inequalities",
      description: "Our multilingual support and accessibility features help bridge educational gaps for marginalized communities and differently-abled learners.",
      color: "bg-purple-600"
    },
    {
      number: 9,
      title: "Industry, Innovation, and Infrastructure",
      description: "By integrating cutting-edge AI technology into education, we're fostering innovation and building resilient educational infrastructure for the future.",
      color: "bg-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Navbar */}
      <nav className={`fixed w-full z-10 transition-all duration-300 backdrop-blur-lg bg-white/30 ${scrolled ? 'shadow-md py-3' : 'py-4'}`}>        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className={`text-2xl font-bold ml-2 ${scrolled ? 'text-blue-600' : 'text-white'}`}>EdVantage</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#" className={`${scrolled ? 'text-gray-700' : 'text-white'} hover:text-blue-400 transition`}>Home</a>
            <a href="#features" className={`${scrolled ? 'text-gray-700' : 'text-white'} hover:text-blue-400 transition`}>Features</a>
            <a href="#sdgs" className={`${scrolled ? 'text-gray-700' : 'text-white'} hover:text-blue-400 transition`}>SDGs</a>
            <Link
              to="/login"
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition ${
                scrolled ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-blue-600 hover:bg-gray-100'
              }`}
            >
              <LogIn className="w-5 h-5" />
              <span>Sign In</span>
            </Link>
          </div>
          
          <button className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </nav>
      
      {/* Hero Section */}
      <header className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 bg-gradient-to-r from-blue-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-pattern"></div>
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto opacity-0 animate-fade-in">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight min-h-16">
            <span>{typedText}</span>
            <span className="inline-block w-1 h-8 bg-white ml-1 animate-blink"></span>
          </h2>
          <p className="text-lg md:text-xl mt-6 max-w-2xl mx-auto opacity-90">
            Learn, collaborate, and grow with AI-powered tools designed to enhance your educational journey and unlock your full potential.
          </p>
          <Link to="/login" className="mt-8 inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-full shadow-lg text-lg font-medium hover:bg-gray-100 transition transform hover:scale-105">
            Get Started
            <ChevronRight className="ml-2" size={20} />
          </Link>
          
          <div className="mt-10 flex justify-center space-x-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="font-bold text-2xl">10K+</span>
              <p className="text-sm">Active Users</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="font-bold text-2xl">500+</span>
              <p className="text-sm">Courses</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="font-bold text-2xl">98%</span>
              <p className="text-sm">Satisfaction</p>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 w-full overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full" fill="white">
            <path d="M0,224L48,213.3C96,203,192,181,288,170.7C384,160,480,160,576,176C672,192,768,224,864,213.3C960,203,1056,149,1152,138.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-blue-600 font-semibold mb-2">POWERFUL FEATURES</h3>
            <h2 className="text-3xl md:text-4xl font-bold">Tools That Empower Education</h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto mt-4"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition border border-gray-100 transform hover:-translate-y-2"
              >
                <div className="inline-block p-3 bg-blue-100 text-blue-600 rounded-lg mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                <a href="#" className="mt-4 inline-flex items-center text-blue-600 font-medium hover:text-blue-800">
                  Learn more <ChevronRight size={16} className="ml-1" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* SDGs Section */}
      <section id="sdgs" className="py-20 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-blue-600 font-semibold mb-2">SUSTAINABILITY</h3>
            <h2 className="text-3xl md:text-4xl font-bold">UN Sustainable Development Goals (SDGs) We Support</h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto mt-4"></div>
            <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
              At EdVantage, we're committed to making a positive impact on society and the planet through our educational platform. Here's how we're contributing to key UN Sustainable Development Goals:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sdgs.map((sdg, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-start"
              >
                <div className={`flex-shrink-0 w-12 h-12 ${sdg.color} text-white rounded-full flex items-center justify-center text-xl font-bold mr-4`}>
                  {sdg.number}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Goal {sdg.number}: {sdg.title}</h3>
                  <p className="text-gray-600">{sdg.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <a href="https://sdgs.un.org/goals" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
              Learn More About UN SDGs
              <ChevronRight className="ml-2" size={20} />
            </a>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Learning Experience?</h2>
          <p className="text-lg mb-8 opacity-90">Join thousands of students who have already improved their educational journey with EdVantage.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/login" className="px-8 py-3 bg-white text-blue-600 rounded-lg shadow-lg hover:bg-gray-100 transition font-medium">
              Go to Classroom
            </Link>
            <Link to="/demo" className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition font-medium">
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BookOpen className="w-8 h-8 text-blue-500" />
                <h3 className="text-xl font-bold ml-2 text-white">EdVantage</h3>
              </div>
              <p className="mb-4">Empowering students and educators with innovative AI-driven learning tools.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <Github size={20} />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-400 transition">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Press</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-400 transition">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Community</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Stay Updated</h4>
              <p className="mb-4">Subscribe to our newsletter for the latest updates.</p>
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-4 py-2 w-full rounded-l-lg focus:outline-none text-gray-800"
                />
                <button 
                  type="submit" 
                  className="bg-blue-600 px-4 py-2 rounded-r-lg hover:bg-blue-700 transition"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; 2025 EdVantage. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-4">
              <a href="#" className="hover:text-blue-400 transition">Terms of Service</a>
              <a href="#" className="hover:text-blue-400 transition">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        
        .animate-blink {
          animation: blink 0.8s infinite;
        }
        
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
};

export default Landing;