import React, { useState } from "react";
import type {FormEvent} from "react";
import { useNavigate } from "react-router-dom";
import { publicApi } from "../api";
import { useAuth } from "../content/AuthContext";
import { jwtDecode } from "jwt-decode";
import {
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { QueueListIcon } from "@heroicons/react/24/outline";

type JWTPayload = {
  user_id: number;
  role: string;
  exp: number;
};

interface FormInputProps {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode; 
}

const FormInput: React.FC<FormInputProps> = ({ icon, type, placeholder, value, onChange, children }) => (
  <div className="relative mb-4">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      {icon}
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    />
    {children}
  </div>
);


export default function AuthForm(): React.ReactElement {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const auth = useAuth();

  const toggleMode = () => {
    setIsLoginMode((prev) => !prev);
    setError("");
    setSuccess("");
    setUsername("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); 
    setError("");
    setSuccess("");
    setIsLoading(true);

    const endpoint = isLoginMode ? "/login" : "/register";
    const payload = isLoginMode ? { username, password } : { username, email, password };

    try {
      const res = await publicApi.post(endpoint, payload);
      if (isLoginMode) {
        auth.login(res.data.token);
        const decoded = jwtDecode<JWTPayload>(res.data.token);
        navigate(decoded.role === "admin" ? "/admin" : "/dashboard");
      } else {
        setSuccess("Signup successful! Please log in to continue.");
        setIsLoginMode(true);
      }
    } catch (err: any) {
      const defaultError = isLoginMode 
        ? "Invalid credentials. Please try again."
        : "Signup failed. Username or email may already exist.";
      setError(err.response?.data?.message || defaultError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* --- Left Side: Branding --- */}
      <div className="hidden lg:flex w-1/2 bg-indigo-700 items-center justify-center p-12 text-white text-center relative">
        <div className="w-full">
            <QueueListIcon className="mx-auto h-24 w-24 text-indigo-300"/>
            <h1 className="text-4xl font-bold mt-4">File-Vault</h1>
            <p className="mt-2 text-indigo-200">Your secure and simple file sharing solution.</p>
        </div>
      </div>

      {/* --- Right Side: Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              {isLoginMode ? "Welcome Back!" : "Create an Account"}
            </h2>
            <p className="text-gray-600 mt-2">
              {isLoginMode ? "Log in to access your files." : "Sign up to get started."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* --- Error & Success Messages --- */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-4 flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-3"/>
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md mb-4 flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3"/>
                <span className="text-sm text-green-700">{success}</span>
              </div>
            )}
            
            <FormInput
              icon={<UserIcon className="h-5 w-5 text-gray-400" />}
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            
            {!isLoginMode && (
               <FormInput
                icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}

            <FormInput
              icon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            >
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </FormInput>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-semibold p-3 rounded-lg transition-colors duration-200 flex items-center justify-center
                ${isLoading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (isLoginMode ? "Login" : "Sign Up")}
            </button>
          </form>

          <p className="text-sm text-center mt-6">
            {isLoginMode ? "Don’t have an account? " : "Already have an account? "}
            <button onClick={toggleMode} className="font-semibold text-indigo-600 hover:underline">
              {isLoginMode ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}