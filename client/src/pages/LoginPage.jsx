import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/user/login', {
        email,
        password,
      });

      const token = response.data.token;
      toast.success('Login successful!');
      localStorage.setItem('token', token);

      navigate('/user/verify-otp', { state: { email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-[900px] h-[550px] bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Left Section */}
        <div className="w-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex flex-col justify-center items-center p-8">
          <h2 className="text-3xl font-bold mb-4">Hello, Friend!</h2>
          <p className="text-sm mb-6 text-center">Register with your details to start your journey with us</p>
          <button
            onClick={() => navigate('/')}
            className="border border-white px-6 py-2 rounded hover:bg-white hover:text-indigo-700 transition"
          >
            SIGN UP
          </button>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-1/2 p-8 my-20">
          <h2 className="text-2xl font-bold text-center mb-6 text-purple-700">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded w-full">LOG IN</button>

          </form>
          <p className="text-right text-sm mt-2">
  <a href="/user/forgot-password" className="text-purple-600 hover:underline">
    Forgot password?
  </a>
</p>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
