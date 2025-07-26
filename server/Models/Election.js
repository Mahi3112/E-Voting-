import mongoose from 'mongoose';

const electionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },  // e.g., "2025 Lok Sabha"
  description: { type: String, trim: true },
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });  // Optional: adds createdAt and updatedAt

const Election = mongoose.model('Election', electionSchema);
export default Election;
