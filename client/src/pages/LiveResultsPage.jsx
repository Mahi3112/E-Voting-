import React, { useEffect, useState } from 'react'
import socket from '../socket'
import axios from 'axios'
import { useParams } from 'react-router-dom'

function LiveResultsPage() {
  const { electionId } = useParams()
  const [candidates, setCandidates] = useState([])

  useEffect(() => {
    // Fetch initial candidate data
    axios.get(`/admin/elections/${electionId}/candidates`).then(res => {
      setCandidates(res.data)
    })

    // Join socket room
    socket.emit('joinElectionRoom', electionId)

    // Listen for live vote updates
    socket.on('voteUpdate', ({ candidateId, votes }) => {
      setCandidates(prev =>
        prev.map(c => (c._id === candidateId ? { ...c, votes } : c))
      )
    })

    return () => {
      socket.off('voteUpdate')
    }
  }, [electionId])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Live Election Results</h2>
      {candidates.map(candidate => (
        <div key={candidate._id} className="mb-2">
          <div className="flex justify-between border p-2 rounded">
            <span>{candidate.name}</span>
            <span className="font-bold">{candidate.votes} votes</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default LiveResultsPage
