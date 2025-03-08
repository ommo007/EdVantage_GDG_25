
"use client"

import { useState } from "react"
import { User, Lock } from "lucide-react"
import Background from "../../components/Background";
import Logo from "../../components/Logo";
import { Link } from "react-router-dom"

const userRoles = [
  { value: "admin", label: "Admin", description: "Manage the entire system and oversee instructors" },
  { value: "instructor", label: "Instructor", description: "Create and manage lessons for students" },
]

export default function SignupPage() {
  const [formData, setFormData] = useState({
    userType: "admin",
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2

  const validateForm = () => {
    const newErrors = {}
    if (currentStep === 2) {
      if (!formData.email) newErrors.email = "Email is required"
      if (formData.password && formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters"
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleNext = () => {
    if (validateForm()) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      console.log("Signup data:", formData)
      alert("Account created successfully!")
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <Background />

      <div className="relative z-10 bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <Link to="/" className="absolute top-4 left-4 text-indigo-600 hover:underline">
          &larr; Back
        </Link>

        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <h1 className="text-2xl font-bold text-center text-indigo-900 mb-6">Create Your Account</h1>

        <div className="mb-6 flex justify-center">
          {[...Array(totalSteps)].map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full mx-1 ${index + 1 <= currentStep ? "bg-indigo-600" : "bg-indigo-200"}`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {currentStep === 1 && (
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-indigo-700">
                I am a...
              </label>
              <div className="mt-2 space-y-2">
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
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-indigo-900">{role.label}</h3>
                        <p className="text-sm text-indigo-600 mt-1">{role.description}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          formData.userType === role.value ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-indigo-700">
                  Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-indigo-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 px-3 py-2 bg-indigo-50 border rounded-md text-indigo-900 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.email ? "border-red-300" : "border-indigo-300"
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-indigo-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-indigo-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 px-3 py-2 bg-indigo-50 border rounded-md text-indigo-900 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.password ? "border-red-300" : "border-indigo-300"
                    }`}
                    placeholder="Create your password"
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
            </>
          )}

          <div className="flex justify-between space-x-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-indigo-100 text-indigo-600 py-2 px-4 rounded-md font-semibold hover:bg-indigo-200 transition duration-300"
              >
                Back
              </button>
            )}
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-indigo-700 transition duration-300"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-indigo-700 transition duration-300"
              >
                Create Account
              </button>
            )}
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-indigo-600">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}


