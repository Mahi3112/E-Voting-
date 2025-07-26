import express from "express";
import Election from "../Models/Election.js";
import Candidate from "../Models/Candidate.js";

const router = express.Router();


// Create a new election
router.post('/elections', async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    const newElection = new Election({ title, description, startDate, endDate });
    await newElection.save();
    res.status(201).json(newElection);
  } catch (error) {
    console.error("Error creating election:", error);
    res.status(500).json({ error: "Failed to create election" });
  }
});

// Get all elections
router.get("/elections", async (req, res) => {
  try {
    const elections = await Election.find().sort({ startDate: -1 });
    res.json(elections);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch elections" });
  }
});

// Edit an election
router.put("/elections/:electionId", async (req, res) => {
  try {
    const { electionId } = req.params;
    const updatedData = req.body;

    const updatedElection = await Election.findByIdAndUpdate(electionId, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedElection) {
      return res.status(404).json({ error: "Election not found" });
    }

    res.json(updatedElection);
  } catch (error) {
    console.error("Error updating election:", error);
    res.status(500).json({ error: "Failed to update election" });
  }
});

// Delete an election (and associated candidates)
router.delete("/elections/:electionId", async (req, res) => {
  try {
    const { electionId } = req.params;

    const deletedElection = await Election.findByIdAndDelete(electionId);
    if (!deletedElection) {
      return res.status(404).json({ error: "Election not found" });
    }

    // Optionally delete all associated candidates
    await Candidate.deleteMany({ election: electionId });

    res.json({ message: "Election and associated candidates deleted" });
  } catch (error) {
    console.error("Error deleting election:", error);
    res.status(500).json({ error: "Failed to delete election" });
  }
});


// Add candidate to an election
router.post('/elections/:electionId/candidates', async (req, res) => {
  try {
    const { name, description } = req.body;
    const { electionId } = req.params;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ error: "Election not found" });
    }

    const candidate = new Candidate({
      name,
      description,
      election: electionId,
      votes: 0,
    });

    await candidate.save();
    res.status(201).json(candidate);
  } catch (error) {
    console.error("Error adding candidate:", error);
    res.status(500).json({ error: "Failed to add candidate" });
  }
});

// Get candidates for a specific election
router.get('/elections/:electionId/candidates', async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ error: "Election not found" });
    }

    const candidates = await Candidate.find({ election: electionId });
    res.json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
});

// Edit a candidate
router.put('/candidates/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;
    const updatedData = req.body;

    const updatedCandidate = await Candidate.findByIdAndUpdate(candidateId, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCandidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.json(updatedCandidate);
  } catch (error) {
    console.error("Error updating candidate:", error);
    res.status(500).json({ error: "Failed to update candidate" });
  }
});

// Delete a candidate
router.delete('/candidates/:candidateId', async (req, res) => {
  try {
    const { candidateId } = req.params;

    const deletedCandidate = await Candidate.findByIdAndDelete(candidateId);
    if (!deletedCandidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.json({ message: "Candidate deleted" });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    res.status(500).json({ error: "Failed to delete candidate" });
  }
});

export default router;
