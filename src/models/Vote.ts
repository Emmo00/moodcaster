import mongoose, { Document, Schema } from 'mongoose';

export interface IVote extends Document {
  pollId: mongoose.Types.ObjectId;
  voterFid: string;
  optionId: string;
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>({
  pollId: {
    type: Schema.Types.ObjectId,
    ref: 'Poll',
    required: true,
    index: true,
  },
  voterFid: {
    type: String,
    required: true,
    index: true,
  },
  optionId: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Create compound indexes for better query performance
VoteSchema.index({ pollId: 1, voterFid: 1 }, { unique: true }); // Ensure one vote per user per poll
VoteSchema.index({ voterFid: 1, createdAt: -1 }); // For user's voting history

export default mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);