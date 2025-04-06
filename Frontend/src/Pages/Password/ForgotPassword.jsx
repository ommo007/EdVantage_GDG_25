"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient"; // Ensure you have a Supabase client setup
import Logo from "../../components/Logo";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`, // Replace with your reset password page
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Reset Your Password</h1>
          <p className="text-gray-600">We'll send you an email with a link to reset your password</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Check Your Email</h2>
              <p className="text-gray-600 mb-4">
                We've sent a password reset link to <strong>{email}</strong>.<br />
                Please check your inbox and follow the instructions.
              </p>
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Return to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-2.5 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  "Sending Email..."
                ) : (
                  <>
                    Send Reset Link <Send className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;