import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  fid: string;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  bio?: string;
  pollsCreated: number;
  votesSubmitted: number;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  fid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  pfpUrl: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  pollsCreated: {
    type: Number,
    default: 0,
    min: 0,
  },
  votesSubmitted: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Create indexes for better query performance
UserSchema.index({ lastActive: -1 });
UserSchema.index({ pollsCreated: -1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);