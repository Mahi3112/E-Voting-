import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'

const VotePage = () => {
  const { electionId } = useParams()
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState([])
  const [voted, setVoted] = useState(false)
  const [loading, setLoading] = useState(true)
  const socketRef = useRef(null)

  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('user'))
    const storedToken = localStorage.getItem('token')

    if (!storedUser || !storedUser.id || !storedToken) {
      toast.error('❌ Invalid session. Please log in again.')
      navigate('/user/login')
      return
    }

    setUser({ ...storedUser, _id: storedUser.id }) // Add `_id` alias
    setToken(storedToken)
  } catch {
    toast.error('❌ Failed to load user data.')
    navigate('/user/login')
  }
}, [navigate])


  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/admin/elections/${electionId}/candidates`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCandidates(res.data)
    } catch {
      toast.error('❌ Failed to load candidates')
    }
  }

  const checkIfVoted = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/user/elections/${electionId}/has-voted/${user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setVoted(res.data.voted)
    } catch {
      toast.error('❌ Failed to check voting status')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (candidateId) => {
    if (!user || !user._id) {
      toast.error('User not loaded. Please log in again.')
      return
    }

    if (!window.confirm('Are you sure you want to vote for this candidate?')) return

    const votePayload = {
      user: user._id,
      role: user.role,
      election: electionId,
      candidate: candidateId
    }

    try {
      const res = await axios.post('http://localhost:3000/election/vote', votePayload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('✅ Vote submitted successfully')
      setVoted(true)
      fetchCandidates()
    } catch (err) {
      console.error('❌ Vote Error:', err.response?.data || err.message || err)
      toast.error(err.response?.data?.error || '❌ Failed to vote')
    }
  }

  useEffect(() => {
    if (!user || !token) return

    fetchCandidates()
    checkIfVoted()

    socketRef.current = io('http://localhost:3000', {
      auth: { token }
    })

    socketRef.current.emit('joinElectionRoom', electionId)

    socketRef.current.on('voteUpdate', (data) => {
      setCandidates((prev) =>
        prev.map((c) => (c._id === data.candidateId ? { ...c, votes: data.votes } : c))
      )
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [electionId, user, token])

  if (loading || !user) return <p className="text-center mt-10">Loading...</p>

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Candidate List</h2>

      {voted && (
        <div className="text-green-600 text-center font-semibold text-lg mb-6">
          ✅ Thank you for voting!
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 text-xl font-semibold text-gray-700 border-b">Candidates</div>
        {candidates.map((c, idx) => (
          <div
            key={c._id}
            className={`flex items-center justify-between px-6 py-4 ${
              idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            } border-t`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-900 text-white flex items-center justify-center text-sm font-bold">
                {c.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-gray-800">{c.name}</div>
                <div className="text-sm text-purple-600">ID #{c._id.slice(-6)}</div>
              </div>
            </div>

            <div className="text-gray-600 text-sm max-w-sm truncate">{c.description}</div>

            <div className="text-black font-semibold">🗳 {c.votes ?? 0} Votes</div>

            <div>
              <button
                disabled={voted}
                onClick={() => handleVote(c._id)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  voted
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-purple-800 hover:bg-purple-900 text-white'
                }`}
              >
                Vote
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VotePage
