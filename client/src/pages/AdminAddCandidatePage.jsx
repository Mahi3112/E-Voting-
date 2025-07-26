import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

function AdminAddCandidate() {
  const { electionId } = useParams()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [candidates, setCandidates] = useState([])

  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/admin/elections/${electionId}/candidates`)
      setCandidates(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      toast.error("Failed to load candidates")
      setCandidates([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !description) return toast.error("All fields required")

    try {
      await axios.post(`http://localhost:3000/admin/elections/${electionId}/candidates`, { name, description })
      toast.success("Candidate added")
      setName('')
      setDescription('')
      fetchCandidates()
    } catch (err) {
      toast.error("Error adding candidate")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return

    try {
      await axios.delete(`http://localhost:3000/admin/candidates/${id}`)
      toast.success("Candidate deleted")
      fetchCandidates()
    } catch (err) {
      toast.error("Error deleting candidate")
    }
  }

  const handleEdit = (candidate) => {
    setEditId(candidate._id)
    setEditName(candidate.name)
    setEditDescription(candidate.description)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editName || !editDescription) return toast.error("All fields required")

    try {
      await axios.put(`http://localhost:3000/admin/candidates/${editId}`, {
        name: editName,
        description: editDescription,
      })
      toast.success("Candidate updated")
      setEditId(null)
      setEditName('')
      setEditDescription('')
      fetchCandidates()
    } catch (err) {
      toast.error("Error updating candidate")
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Add New Candidate</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Candidate Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Candidate
        </button>
      </form>

      <h2 className="mt-8 text-xl font-semibold">Current Candidates</h2>
      <ul className="mt-4 space-y-4">
        {candidates.map((c) => (
          <li key={c._id} className="border p-3 rounded shadow-sm">
            {editId === c._id ? (
              <form onSubmit={handleUpdate} className="space-y-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                <div className="flex space-x-2">
                  <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
                  <button
                    type="button"
                    onClick={() => setEditId(null)}
                    className="bg-gray-400 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <strong>{c.name}</strong>: {c.description}
                </div>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AdminAddCandidate
