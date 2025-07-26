import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminElectionsPage = () => {
  const [elections, setElections] = useState([]);
  const navigate = useNavigate();

  const fetchElections = async () => {
    try {
      const res = await axios.get('http://localhost:3000/admin/elections');
      setElections(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to load elections");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this election?")) return;

    try {
      await axios.delete(`http://localhost:3000/admin/elections/${id}`);
      toast.success("Election deleted");
      fetchElections();
    } catch (err) {
      toast.error("Failed to delete election");
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Elections</h1>
        <button
          onClick={() => navigate('/admin/create-election')}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Create Election
        </button>
      </div>

      <ul className="space-y-4">
        {elections.map((e) => (
          <li
            key={e._id}
            className="p-4 border rounded shadow flex flex-col md:flex-row md:justify-between md:items-center gap-4"
          >
            <div>
              <strong className="text-lg">{e.title}</strong>
              <p className="text-sm text-gray-600">{e.description}</p>
              <p className="text-xs text-gray-400">
                {new Date(e.startDate).toLocaleString()} - {new Date(e.endDate).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate(`/admin/elections/${e._id}/add-candidate`)}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Add Candidate
              </button>
              <button
                onClick={() => navigate(`/admin/elections/${e._id}/edit`)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(e._id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminElectionsPage;
