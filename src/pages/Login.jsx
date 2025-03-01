/* eslint-disable no-unused-vars */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

axios.defaults.withCredentials = true;

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login to:', `${import.meta.env.VITE_API_URL}/api/auth/login`);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (response.data) {
        // Store the token in localStorage
        localStorage.setItem('token', response.data.token);
        // Store user data if needed
        localStorage.setItem('user', JSON.stringify(response.data.user));
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        // Server responded with an error
        setError(err.response.data.message || 'Invalid credentials');
      } else if (err.request) {
        // Request was made but no response
        setError('Cannot connect to server. Please check your internet connection.');
      } else {
        // Something else happened
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1f2b] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-white text-5xl font-bold text-center">Kaizen</h1>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
          Sign in to your account
        </h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-center text-sm bg-red-100/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <input
            name="email"
            type="email"
            required
            className="w-full px-4 py-3 rounded-md bg-white/10 text-white placeholder-white/70 focus:outline-none focus:bg-white/20 hover:bg-white/20 transition-all duration-300"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            required
            className="w-full px-4 py-3 rounded-md bg-white/10 text-white placeholder-white/70 focus:outline-none focus:bg-white/20 hover:bg-white/20 transition-all duration-300"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-3 rounded-md bg-white/10 text-white hover:bg-white/20 transition-all duration-300 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`
            }
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-white/70 text-center">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-white hover:underline"
            >
              Sign up here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;