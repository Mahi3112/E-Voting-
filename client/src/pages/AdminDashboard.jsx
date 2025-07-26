import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-6 p-10 bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

        <div className="flex gap-8 mt-6">
          <button
            onClick={() => navigate('/admin/elections')}
            className="px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-lg font-medium"
          >
            🗳️ Elections
          </button>

          <button
            onClick={() => navigate('/admin/results')}
            className="px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-lg font-medium"
          >
            📊 Live Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
