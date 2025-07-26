import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [emailid, setEmailId] = useState('');
  const [phonenumber, setPhoneNumber] = useState('');
  const [electionId, setelectionId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('voter');
  const [adminExists, setAdminExists] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:3000/user/admin-exists')
      .then(res => setAdminExists(res.data.adminExists))
      .catch(err => {
        console.error('Admin check failed:', err);
        toast.error('Could not verify admin status');
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !emailid || !phonenumber || !electionId || !password || !confirmPassword) {
      return toast.error('Please fill all fields');
    }

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

   if (!/^[A-Z0-9]{10}$/.test(electionId)) {
  return toast.error('Election ID must be exactly 10 characters (A-Z, 0-9)');
}


    if (!/^\d{10}$/.test(phonenumber)) {
      return toast.error('Phone number must be exactly 10 digits');
    }

    const newUser = {
      name,
      email: emailid,
      mobile: phonenumber,
      electionid: electionId,
      password,
      role,
    };

    try {
      await axios.post('http://localhost:3000/user/signup', newUser);
      toast.success('Registration successful!');
      navigate('/user/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-[900px] h-[550px] bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Left Section */}
        <div className="w-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex flex-col justify-center items-center p-8">
          <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
          <p className="text-sm mb-6 text-center">Enter your personal details to use all of site features</p>
          <button
            onClick={() => navigate('/user/login')}
            className="border border-white px-6 py-2 rounded hover:bg-white hover:text-indigo-700 transition"
          >
            LOG IN
          </button>
        </div>

        {/* Right Section */}
        <div className="w-1/2 p-8">
          <h2 className="text-2xl  text-purple-700 font-bold text-center mb-4">Create Account</h2>

        

          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded text-black" />
            <input type="email" placeholder="Email" value={emailid} onChange={(e) => setEmailId(e.target.value)} className="w-full p-2 border rounded text-black" />
            <input type="tel" placeholder="Phone Number" value={phonenumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full p-2 border rounded text-black" />
            <input type="text" placeholder="Election ID" value={electionId} onChange={(e) => setelectionId(e.target.value)} className="w-full p-2 border rounded text-black" />

            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2 border rounded text-black">
              <option value="voter">Voter</option>
              <option value="admin" disabled={adminExists}>Admin</option>
            </select>
            {adminExists && <p className="text-sm text-red-500">Admin already exists. Only one admin allowed.</p>}

            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded text-black" />
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-2 border rounded text-black" />

            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded w-full">SIGN UP</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;


