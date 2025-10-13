import mongoose, { Document, Schema } from 'mongoose';

export interface IPollOption {
  id: string;
  text: string;
  votes: number;
}

export interface IPoll extends Document {
  question: string;
  creatorFid: string;
  totalVotes: number;
  options: IPollOption[];
  createdAt: Date;
  updatedAt: Date;
}

const PollOptionSchema = new Schema<IPollOption>({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  votes: {
    type: Number,
    default: 0,
    min: 0,
  },
});

const PollSchema = new Schema<IPoll>({
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  creatorFid: {
    type: String,
    required: true,
    index: true,
  },
  totalVotes: {
    type: Number,
    default: 0,
    min: 0,
  },
  options: {
    type: [PollOptionSchema],
    required: true,
    validate: {
      validator: function(options: IPollOption[]) {
        return options.length >= 2 && options.length <= 4;
      },
      message: 'Poll must have between 2 and 4 options',
    },
  },
}, {
  timestamps: true,
});

// Create indexes for better query performance
PollSchema.index({ createdAt: -1 });
PollSchema.index({ creatorFid: 1, createdAt: -1 });

// Middleware to update totalVotes before saving
PollSchema.pre('save', function(this: IPoll) {
  this.totalVotes = this.options.reduce((total, option) => total + option.votes, 0);
});

export default mongoose.models.Poll || mongoose.model<IPoll>('Poll', PollSchema);