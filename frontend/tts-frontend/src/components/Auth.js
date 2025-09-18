import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";

export function AuthModal({ isOpen, onClose, mode = "signin" }) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmationCode: "",
    newPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false); // eslint-disable-line no-unused-vars
  const [success, setSuccess] = useState("");

  const { signIn, signUp, confirmSignUp, forgotPassword, confirmPassword } = useAuth();

  // Update currentMode when mode prop changes
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn(formData.email, formData.password);
      setSuccess("Successfully signed in!");
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signUp(formData.email, formData.password, formData.name);
      setSuccess("Account created! Please check your email for verification code.");
      setNeedsConfirmation(true);
      setCurrentMode("confirm");
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await confirmSignUp(formData.email, formData.confirmationCode);
      setSuccess("Email verified! You can now sign in.");
      setTimeout(() => {
        setCurrentMode("signin");
        setNeedsConfirmation(false);
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to verify email");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await forgotPassword(formData.email);
      setSuccess("Reset code sent to your email!");
      setCurrentMode("resetPassword");
    } catch (err) {
      setError(err.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await confirmPassword(formData.email, formData.confirmationCode, formData.newPassword);
      setSuccess("Password reset successful! You can now sign in.");
      setTimeout(() => {
        setCurrentMode("signin");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      confirmationCode: "",
      newPassword: ""
    });
    setError("");
    setSuccess("");
    setNeedsConfirmation(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
        <button
          onClick={() => {
            onClose();
            resetForm();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {currentMode === "signin" && "Welcome Back"}
            {currentMode === "signup" && "Create Account"}
            {currentMode === "confirm" && "Verify Email"}
            {currentMode === "forgotPassword" && "Reset Password"}
            {currentMode === "resetPassword" && "Set New Password"}
          </h2>
          <p className="text-gray-600">
            {currentMode === "signin" && "Sign in to your account"}
            {currentMode === "signup" && "Join Jonatech Multi-Langual App"}
            {currentMode === "confirm" && "Enter the verification code sent to your email"}
            {currentMode === "forgotPassword" && "Enter your email to receive reset code"}
            {currentMode === "resetPassword" && "Enter the code and your new password"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {/* Sign In Form */}
        {currentMode === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => setCurrentMode("forgotPassword")}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Forgot Password?
              </button>
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setCurrentMode("signup")}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Sign Up Form */}
        {currentMode === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Create a password"
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters with uppercase, lowercase, number, and symbol
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setCurrentMode("signin")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* Email Confirmation Form */}
        {currentMode === "confirm" && (
          <form onSubmit={handleConfirmSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
              <input
                type="text"
                name="confirmationCode"
                value={formData.confirmationCode}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 6-digit code"
                maxLength="6"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>
        )}

        {/* Forgot Password Form */}
        {currentMode === "forgotPassword" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? "Sending Code..." : "Send Reset Code"}
            </button>
            <p className="text-center text-sm text-gray-600">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => setCurrentMode("signin")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* Reset Password Form */}
        {currentMode === "resetPassword" && (
          <form onSubmit={handleConfirmPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reset Code</label>
              <input
                type="text"
                name="confirmationCode"
                value={formData.confirmationCode}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter reset code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
