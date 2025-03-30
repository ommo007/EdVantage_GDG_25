"use client"

import { useState, useEffect } from "react";
import { User, Lock, Eye, EyeOff, LucideLoader2, ChevronLeft, ChevronRight, Check, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, signInWithGoogle } from "../../firebase/auth";
import { useAuth } from "../../contexts/AuthContext";
import Background from "../../components/Background";
import Logo from "../../components/Logo";
import PasswordStrengthMeter from "../../components/ui/PasswordStrengthMeter";

const userRoles = [
  { value: "student", label: "Student", description: "Access courses and learning materials", icon: "👨‍🎓" },
  { value: "instructor", label: "Instructor", description: "Create and manage lessons for students", icon: "👨‍🏫" },
  { value: "admin", label: "Admin", description: "Manage the entire system and oversee instructors", icon: "👨‍💼" }
];

export default function SignupPage() {
  const [formData, setFormData] = useState({
    userType: "student",
    email: "",
    password: "",
    displayName: "",
  });
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const totalSteps = 2;
  const navigate = useNavigate();
  const { setRole, currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate("/redirect");
    }
  }, [currentUser, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (currentStep === 2) {
      if (!formData.email) newErrors.email = "Email is required";
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleGoogleSignUp = async () => {
    setErrors({});
    setIsGoogleLoading(true);

    try {
      const { user, profile } = await signInWithGoogle();

      if (!profile || !profile.role) {
        await setRole(formData.userType, true);
      } else {
        await setRole(profile.role, true);
      }

      navigate(`/redirect`);
    } catch (error) {
      console.error("Google sign-up error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setErrors({ ...errors, general: "Sign-up was cancelled" });
      } else {
        setErrors({ ...errors, general: "Failed to sign up with Google. Please try again." });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { user, profile } = await registerUser(
        formData.email,
        formData.password,
        formData.displayName || null,
        formData.userType
      );

      await setRole(formData.userType, true);
      navigate("/redirect");
    } catch (error) {
      console.error("Signup error:", error);

      if (error.code === "auth/email-already-in-use") {
        setErrors({ ...errors, email: "Email already in use" });
      } else if (error.code === "auth/weak-password") {
        setErrors({ ...errors, password: "Password is too weak" });
      } else if (error.code === "auth/invalid-email") {
        setErrors({ ...errors, email: "Invalid email format" });
      } else {
        setErrors({ ...errors, general: "Failed to create account: " + error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="relative z-10 w-full max-w-xl bg-white rounded-lg shadow-lg overflow-hidden mx-4">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <Logo className="h-8" />
            <Link to="/" className="text-indigo-600 hover:text-indigo-800 transition-colors duration-300 text-sm">
              &larr; Back to home
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {currentStep === 1 ? "Choose your role" : "Create your account"}
            </h2>
            <div className="flex space-x-2">
              {[...Array(totalSteps)].map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-8 rounded-full ${
                    index + 1 <= currentStep ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {currentStep === 1 && (
              <>
                <div className="space-y-3">
                  {userRoles.map((role) => (
                    <div
                      key={role.value}
                      className={`relative rounded-lg border p-4 cursor-pointer transition-all duration-300 ${
                        formData.userType === role.value
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                      onClick={() => setFormData((prev) => ({ ...prev, userType: role.value }))}
                    >
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">{role.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-gray-900">{role.label}</h3>
                          <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                        </div>
                        <div
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                            formData.userType === role.value ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
                          }`}
                        >
                          {formData.userType === role.value && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={isGoogleLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
                >
                  {isGoogleLoading ? (
                    <LucideLoader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      <span className="text-gray-700 font-medium">Sign up with Google</span>
                    </>
                  )}
                </button>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          errors.email ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          errors.password ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Create a password (min. 8 characters)"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {formData.password && <PasswordStrengthMeter password={formData.password} />}
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between space-x-4 pt-2">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 flex items-center justify-center bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-all duration-300"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </button>
              ) : (
                <div className="flex-1"></div> // Empty div to maintain layout on step 1
              )}
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all duration-300"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <LucideLoader2 className="animate-spin mr-2 h-5 w-5" />
                      Creating Account...
                    </span>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


