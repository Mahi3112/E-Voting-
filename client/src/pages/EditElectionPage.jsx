import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function EditElectionPage() {
  const { id } = useParams(); // electionId
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/admin/elections/${id}`);
        const { title, description, startDate, endDate } = res.data;
        setTitle(title);
        setDescription(description);
        setStartDate(new Date(startDate).toISOString().slice(0, 16)); // for datetime-local
        setEndDate(new Date(endDate).toISOString().slice(0, 16));
      } catch (err) {
        toast.error('Failed to load election');
      }
    };

    fetchElection();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/admin/elections/${id}`, {
        title,
        description,
        startDate,
        endDate,
      });
      toast.success('Election updated successfully!');
      navigate('/admin/elections');
    } catch (err) {
      toast.error('Error updating election');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Edit Election</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          className="w-full p-2 border rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          className="w-full p-2 border rounded"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          className="w-full p-2 border rounded"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Update Election
        </button>
      </form>
    </div>
  );
}

export default EditElectionPage;
