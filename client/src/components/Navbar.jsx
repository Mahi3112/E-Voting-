import React from 'react'
import { useNavigate } from 'react-router-dom'
import img from '../assets/logo.jpg';

const Navbar = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/user/login')
  }

  return (
    <nav className="bg-gradient-to-r from-purple-900 to-purple-600 shadow flex items-center justify-between px-8 py-3">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <img src={img} alt="Logo" className="h-8 w-8 rounded-md" />
        <span className="font-bold text-xl text-white">E-Voting</span>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/user/profile')}
          className="px-4 py-2 rounded bg-white text-purple-700 font-medium hover:bg-gray-200 transition"
        >
          Profile
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded bg-red-500 text-white font-medium hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar

