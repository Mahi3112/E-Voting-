import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  votes: { type: Number, default: 0 }
}, { timestamps: true });

const Candidate = mongoose.model('Candidate', candidateSchema);
export default Candidate;
