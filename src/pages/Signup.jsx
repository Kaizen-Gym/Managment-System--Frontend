/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: '',
    email: '',
    number: '',
    password: '',
    confirmPassword: '',
    user_type:'',
    gymId: '',
  });

  const [gyms, setGyms] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGyms();
  }, []);
  
  const fetchGyms = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/utils/gyms`
      );
      setGyms(response.data);
    } catch (error) {
      console.error('Error fetching gyms:', error);
      setError('Failed to load gyms');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const { confirmPassword, ...signupData } = formData;
      console.log(signupData)
      const token = localStorage.getItem('token'); // Get the admin token
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        signupData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data) {
        navigate('/login');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'An error occurred during signup'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1f2b] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-white text-5xl font-bold text-center">Kaizen</h1>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
          Create your account
        </h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-center text-sm">{error}</div>
          )}

          <input
            name="name"
            type="text"
            required
            className="w-full px-4 py-3 rounded-md bg-white/10 text-white placeholder-white/70 focus:outline-none focus:bg-white/20 hover:bg-white/20 transition-all duration-300"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />

          <select
            name="gender"
            required
            className="w-full px-4 py-3 rounded-md bg-white/10 text-white placeholder-white/70 focus:outline-none focus:bg-white/20 hover:bg-white/20 transition-all duration-300"
            value={formData.gender}
            onChange={handleChange}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '5px',
              color: 'white',
              // Remove default select styling
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none',
            }}
          >
            <option value="" className="bg-[#1a1f2b] text-white">
              Select Gender
            </option>
            <option value="Male" className="bg-[#1a1f2b] text-white">
              Male
            </option>
            <option value="Female" className="bg-[#1a1f2b] text-white">
              Female
            </option>
            <option value="Other" className="bg-[#1a1f2b] text-white">
              Other
            </option>
          </select>

          <input
            name="age"
            type="number"
            required
            min="14"
            className="w-full px-4 py-3 rounded-md bg-white/10 text-white placeholder-white/70 focus:outline-none focus:bg-white/20 hover:bg-white/20 transition-all duration-300"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
          />

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
            name="number"
            type="tel"
            required
            className="w-full px-4 py-3 rounded-md bg-white/10 text-white placeholder-white/70 focus:outline-none focus:bg-white/20 hover:bg-white/20 transition-all duration-300"
            placeholder="Phone Number"
            value={formData.number}
            onChange={handleChange}
          />
          
          <select
            name="user_type"
            required
            className="w-full px-4 py-3 rounded-md bg-white/10 text-white placeholder-white/70 focus:outline-none focus:bg-white/20 hover:bg-white/20 transition-all duration-300"
            placeholder="User Type"
            value={formData.user_type}
            onChange={handleChange}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '5px',
              color: 'white',
              // Remove default select styling
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none',
            }}
          >
            <option value="Admin" className="bg-[#1a1f2b] text-white">Admin</option>
            <option value="User" className="bg-[#1a1f2b] text-white">Trainer</option>
            <option value="Receptionist" className="bg-[#1a1f2b] text-white">Admin</option>
          </select>

          <input
            name="password"
            type="password"
            required
            className="w-full px-4 py-3 rounded-md bg-white/10 text-white placeholder-white/70 focus:outline-none focus:bg-white/20 hover:bg-white/20 transition-all duration-300"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <input
            name="confirmPassword"
            type="password"
            required
            className="w-full px-4 py-3 rounded-md bg-white/10 text-white placeholder-white/70 focus:outline-none focus:bg-white/20 hover:bg-white/20 transition-all duration-300"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <select
            name="gymId"
            required
            className="w-full px-4 py-3 rounded-md bg-white/10 text-white placeholder-white/70 focus:outline-none focus:bg-white/20 hover:bg-white/20 transition-all duration-300"
            value={formData.gymId}
            onChange={handleChange}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '5px',
              color: 'white',
              // Remove default select styling
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none',
            }}
          >
            <option value="" className="bg-[#1a1f2b] text-white">
              Select Gym
            </option>
            {gyms.map((gym) => (
              <option
                key={gym._id}
                value={gym._id}
                className="bg-[#1a1f2b] text-white"
              >
                {gym.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full px-4 py-3 rounded-md bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
          >
            Sign Up
          </button>

          <p className="text-white/70 text-center">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-white hover:underline"
            >
              Login here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
