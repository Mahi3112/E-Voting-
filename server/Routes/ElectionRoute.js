import express from "express";
import Election from "../Models/Election.js";
import Candidate from "../Models/Candidate.js";
import Vote from "../Models/Vote.js";
import User from "../Models/UserModel.js";

const router = express.Router();

export default (io) => {

router.post('/vote', async (req, res) => {
  const { user, election, candidate, role } = req.body;
  console.log('📥 Incoming Vote Request:', req.body);

  // Validation
  if (!user || !election || !candidate) {
    console.log('❌ Missing required fields');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (role === 'admin') {
    console.log('❌ Admin attempted to vote');
    return res.status(403).json({ error: 'Admins are not allowed to vote' });
  }

  try {
    // Check if election exists
    const electionDoc = await Election.findById(election);
    if (!electionDoc) {
      console.log('❌ Election not found');
      return res.status(404).json({ error: 'Election not found' });
    }

    // Check if voting period is active
    const now = new Date();
    if (electionDoc.endDate && now > electionDoc.endDate) {
      console.log('❌ Voting period has ended');
      return res.status(403).json({ error: 'Voting period has ended.' });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({ user, election });
    if (existingVote) {
      console.log('⚠️ User has already voted');
      return res.status(400).json({ error: 'User has already voted in this election.' });
    }

    // Record the vote
    const vote = new Vote({ user, election, candidate });
    const savedVote = await vote.save();
    console.log('✅ Vote saved:', savedVote);

    // Update user's voted status
    const updatedUser = await User.findByIdAndUpdate(user, { isVoted: true }, { new: true });
    console.log('✅ User updated:', updatedUser);

    // Manually increment candidate's vote count
    const candidateDoc = await Candidate.findById(candidate);
    if (!candidateDoc) {
      console.log('❌ Candidate not found');
      return res.status(404).json({ error: 'Candidate not found' });
    }

    candidateDoc.votes = (candidateDoc.votes || 0) + 1;
    await candidateDoc.save();
    console.log('✅ Candidate vote incremented:', candidateDoc.votes);

    // Emit live update via Socket.IO
    io.to(election).emit("voteUpdate", {
      candidateId: candidateDoc._id,
      votes: candidateDoc.votes
    });

    return res.status(201).json({ message: 'Vote successfully cast.' });
  } catch (error) {
    console.error('❌ Vote Error:', error);
    return res.status(500).json({ error: 'Server Error' });
  }
});

  // ✅ Get election results
  router.get("/elections/:electionId/results", async (req, res) => {
    try {
      const candidates = await Candidate.find({ election: req.params.electionId }).sort({ votes: -1 });
      res.json(candidates);
    } catch (err) {
      console.error("❌ Fetch results error:", err);
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  // Backend route to serve live results for all elections
router.get("/results/live", async (req, res) => {
  try {
    const elections = await Election.find();
    const liveResults = {};

    // Use Promise.all for parallel fetching of all candidates
    const results = await Promise.all(
      elections.map(async (election) => {
        const candidates = await Candidate.find({ election: election._id }).sort({ votes: -1 });
        return {
          id: election._id,
          title: election.title,
          candidates: candidates.map((c) => ({
            _id: c._id,
            name: c.name,
            votes: c.votes,
          })),
        };
      })
    );

    results.forEach((e) => {
      liveResults[e.id] = {
        title: e.title,
        candidates: e.candidates,
      };
    });

    res.json(liveResults);
  } catch (err) {
    console.error("❌ Error fetching live results:", err);
    res.status(500).json({ error: "Failed to fetch live results" });
  }
});

// Get winner for an election
router.get("/elections/:electionId/winner", async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({ error: "Election not found" });
    }
    // Only allow winner after end date
    const now = new Date();
    if (!election.endDate || now < election.endDate) {
      return res.status(403).json({ error: "Election is still ongoing" });
    }
    // Find candidate with max votes
    const winner = await Candidate.find({ election: req.params.electionId })
      .sort({ votes: -1 })
      .limit(1);
    if (!winner.length) {
      return res.status(404).json({ error: "No candidates found" });
    }
    res.json({ winner: winner[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch winner" });
  }
});

  return router;
};
