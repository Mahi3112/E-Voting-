import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminLiveResults = () => {
  const [liveResults, setLiveResults] = useState({});

  const fetchLiveResults = async () => {
    try {
      const response = await axios.get("http://localhost:3000/election/results/live");
      setLiveResults(response.data);
    } catch (error) {
      console.error("Error fetching live results:", error);
    }
  };

  useEffect(() => {
    fetchLiveResults();
    const interval = setInterval(fetchLiveResults, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl text-center text-black mb-10">
        Live Election Results
      </h1>

      {Object.keys(liveResults).length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No election results available</p>
      ) : (
        Object.entries(liveResults).map(([electionId, electionData]) => (
          <div
            key={electionId}
            className="bg-white rounded-xl shadow-md p-6 mb-8 border border-purple-200"
          >
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
              {electionData.title}
            </h2>

            {!electionData?.candidates || electionData.candidates.length === 0 ? (
              <p className="text-gray-500">No candidates found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-purple-200 text-left">
                  <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <tr>
                      <th className="px-6 py-3 text-sm font-semibold">Candidate Name</th>
                      <th className="px-6 py-3 text-sm font-semibold">Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {electionData.candidates.map((candidate, idx) => (
                      <tr
                        key={candidate._id}
                        className={`${
                          idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-purple-50 transition`}
                      >
                        <td className="px-6 py-3 border-t border-purple-100">
                          {candidate.name}
                        </td>
                        <td className="px-6 py-3 border-t border-purple-100">
                          {candidate.votes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AdminLiveResults;
