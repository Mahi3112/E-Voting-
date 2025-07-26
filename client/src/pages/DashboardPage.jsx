// import React, { useEffect, useState } from 'react'
// import axios from 'axios'
// import { useNavigate } from 'react-router-dom'
// import { toast } from 'react-toastify'
// import { Pie } from 'react-chartjs-2'
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
// import Navbar from '../components/Navbar'

// ChartJS.register(ArcElement, Tooltip, Legend)

// const UserDashboard = () => {
//   const [elections, setElections] = useState([])
//   const [results, setResults] = useState({})
//   const navigate = useNavigate()

//   const fetchElections = async () => {
//     try {
//       const res = await axios.get('http://localhost:3000/admin/elections')
//       setElections(res.data)
//     } catch (err) {
//       toast.error('Failed to load elections')
//     }
//   }

//   const fetchLiveResults = async () => {
//     try {
//       const res = await axios.get('http://localhost:3000/election/results/live')
//       setResults(res.data)
//     } catch (err) {
//       console.error(err)
//     }
//   }

//   useEffect(() => {
//     fetchElections()
//     fetchLiveResults()
//     const interval = setInterval(fetchLiveResults, 5000)
//     return () => clearInterval(interval)
//   }, [])

//   return (
//     <>
//      <Navbar />
//     <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-10">
//       {/* Header */}
      
//       <div className="text-center mb-12">
//         <h1 className="text-4xl font-bold text-gray-800">Live Election Results Dashboard</h1>
//       </div>

//       {/* Live Pie Results as Horizontal Panel */}
//       <div className="mb-16">
//           <h2 className="text-3xl font-bold text-gray-800 mb-6">📊 Live Results</h2>
//           <div className="flex flex-wrap gap-6 justify-center">
//             {Object.entries(results).map(([electionId, result]) => {
//               const totalVotes = result.candidates.reduce((sum, c) => sum + c.votes, 0);
//               return (
//                 <div
//                   key={electionId}
//                   className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 w-[320px]"
//                 >
//                   <h3 className="text-lg font-semibold text-center text-white mb-4">
//                     {result.title}
//                   </h3>
//                   <div className="h-[200px]">
//                     <Pie
//                       data={{
//                         labels: result.candidates.map((c) => c.name),
//                         datasets: [
//                           {
//                             data: result.candidates.map((c) => c.votes),
//                             backgroundColor: [
//                               '#4CAF50', '#FF9800', '#2196F3', '#E91E63', '#9C27B0',
//                             ],
//                           },
//                         ],
//                       }}
//                       options={{
//                         plugins: {
//                           legend: { display: true, position: 'bottom' },
//                         },
//                         responsive: true,
//                         maintainAspectRatio: false,
//                       }}
//                     />
//                   </div>
//                   <div className="mt-4 text-sm text-gray-600 text-center">
//                     Total Votes: <span className="font-bold text-gray-800">{totalVotes}</span>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//       {/* Available Elections Section */}
//       <div className="mt-12">
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">🗳️ Available Elections</h2>
//         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//           {elections.map((election) => (
//             <div
//   key={election._id}
//   onClick={() => navigate(`/vote/${election._id}`)}
//   className="relative group cursor-pointer"
// >
//   {/* Purple 3D background box */}
//   <div className="absolute -bottom-2 -left-2 w-full h-full bg-purple-800 rounded-xl z-0 group-hover:-bottom-3 group-hover:-left-3 transition-all duration-300"></div>

//   {/* Foreground election card */}
//   <div className="relative z-10 bg-white p-5 rounded-xl shadow-md group-hover:shadow-xl transition-all duration-300">
//     <h3 className="text-xl font-semibold text-gray-800">{election.title}</h3>
//     <p className="text-gray-600">{election.description}</p>
//     <p className="text-sm text-gray-500 mt-1">
//       🕒 Starts: {new Date(election.startDate).toLocaleString()}
//     </p>
//     <p className="text-sm text-gray-500">🛑 Ends: {new Date(election.endDate).toLocaleString()}</p>
//   </div>
// </div>

//           ))}
//         </div>
//       </div>
//     </div>
//     </>
//   )
  
// }

// export default UserDashboard
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Navbar from '../components/Navbar';

ChartJS.register(ArcElement, Tooltip, Legend);

const UserDashboard = () => {
  const [elections, setElections] = useState([]);
  const [results, setResults] = useState({});
  const [winners, setWinners] = useState({});
  const navigate = useNavigate();

  const fetchElections = async () => {
    try {
      const res = await axios.get('http://localhost:3000/admin/elections');
      setElections(res.data);
      fetchWinners(res.data); // fetch winners after setting elections
    } catch (err) {
      toast.error('Failed to load elections');
    }
  };

  const fetchWinners = async (electionList) => {
    const now = new Date();

    const winnerResults = await Promise.all(
      electionList.map(async (election) => {
        if (new Date(election.endDate) < now) {
          try {
            const res = await axios.get(
              `http://localhost:3000/election/elections/${election._id}/winner`
            );
            return { id: election._id, winner: res.data.winner.name };
          } catch (err) {
            console.error(`No winner for election ${election._id}`);
            return { id: election._id, winner: null };
          }
        } else {
          return { id: election._id, winner: null };
        }
      })
    );

    const winnersMap = {};
    winnerResults.forEach(({ id, winner }) => {
      if (winner) winnersMap[id] = winner;
    });

    setWinners(winnersMap);
  };

  const fetchLiveResults = async () => {
    try {
      const res = await axios.get('http://localhost:3000/election/results/live');
      setResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchElections();
    fetchLiveResults();
    const interval = setInterval(fetchLiveResults, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-900">User Dashboard</h1>
        </div>

        {/* Live Pie Results */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-purple-900 mb-6">📊 Live Results</h2>
          <div className="flex flex-wrap gap-6 justify-center">
            {Object.entries(results).map(([electionId, result]) => {
              const totalVotes = result.candidates.reduce((sum, c) => sum + c.votes, 0);
              return (
                <div
                  key={electionId}
                  className="bg-purple-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 w-[320px]"
                >
                  <h3 className="text-lg font-semibold text-center text-white mb-4">
                    {result.title}
                  </h3>
                  <div className="h-[200px]">
                    <Pie
                      data={{
                        labels: result.candidates.map((c) => c.name),
                        datasets: [
                          {
                            data: result.candidates.map((c) => c.votes),
                            backgroundColor: [
                              '#4CAF50', '#FF9800', '#2196F3', '#E91E63', '#9C27B0',
                            ],
                          },
                        ],
                      }}
                      options={{
                        plugins: {
                          legend: { display: true, position: 'bottom',labels: {
                                    color: '#ffffff', 
                                  },
                          },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  </div>
                  <div className="mt-4 text-sm text-white text-center">
                    Total Votes:{' '}
                    <span className="font-bold text-white">{totalVotes}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Available Elections */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-purple-900 mb-6">🗳️ Elections</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {elections.map((election) => (
              <div
                key={election._id}
                onClick={() => navigate(`/vote/${election._id}`)}
                className="relative group cursor-pointer"
              >
                {/* Purple 3D background */}
                <div className="absolute -bottom-2 -left-2 w-full h-full bg-purple-800 rounded-xl z-0 group-hover:-bottom-3 group-hover:-left-3 transition-all duration-300"></div>

                {/* Foreground card */}
                <div className="relative z-10 bg-white p-5 rounded-xl shadow-md group-hover:shadow-xl transition-all duration-300">
                  <h3 className="text-xl font-semibold text-gray-800">{election.title}</h3>
                  <p className="text-gray-600">{election.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    🕒 Starts: {new Date(election.startDate).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    🛑 Ends: {new Date(election.endDate).toLocaleString()}
                  </p>
                  {winners[election._id] && (
                    <p className="text-green-700 font-semibold mt-2">
                      🏆 Winner: {winners[election._id]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
