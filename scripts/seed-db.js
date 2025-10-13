import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env');
}

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Define schemas directly in the seed script
const PollOptionSchema = new mongoose.Schema({
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

const PollSchema = new mongoose.Schema({
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
  },
}, {
  timestamps: true,
});

const UserSchema = new mongoose.Schema({
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

const Poll = mongoose.model('Poll', PollSchema);
const User = mongoose.model('User', UserSchema);

async function seedDatabase() {
  try {
    await connectToDatabase();

    // Clear existing data
    await Poll.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const sampleUsers = [
      {
        fid: '1234',
        username: 'techdev',
        displayName: 'Tech Developer',
        bio: 'Full-stack developer passionate about Web3',
        pollsCreated: 0,
        votesSubmitted: 0,
      },
      {
        fid: '5678',
        username: 'codewiz',
        displayName: 'Code Wizard',
        bio: 'Frontend specialist and UI/UX enthusiast',
        pollsCreated: 0,
        votesSubmitted: 0,
      },
      {
        fid: '9012',
        username: 'framebuilder',
        displayName: 'Frame Builder',
        bio: 'Building the future of decentralized social',
        pollsCreated: 0,
        votesSubmitted: 0,
      },
    ];

    await User.insertMany(sampleUsers);
    console.log('Created sample users');

    // Create sample polls
    const samplePolls = [
      {
        question: 'What is your favorite programming language?',
        creatorFid: '1234',
        options: [
          { id: '1', text: 'TypeScript', votes: 15 },
          { id: '2', text: 'Python', votes: 12 },
          { id: '3', text: 'Rust', votes: 10 },
          { id: '4', text: 'Go', votes: 5 },
        ],
        totalVotes: 42,
      },
      {
        question: 'Best time to code?',
        creatorFid: '5678',
        options: [
          { id: '1', text: 'Morning', votes: 8 },
          { id: '2', text: 'Afternoon', votes: 5 },
          { id: '3', text: 'Evening', votes: 7 },
          { id: '4', text: 'Night', votes: 8 },
        ],
        totalVotes: 28,
      },
      {
        question: 'Favorite web framework?',
        creatorFid: '9012',
        options: [
          { id: '1', text: 'Next.js', votes: 20 },
          { id: '2', text: 'React', votes: 10 },
          { id: '3', text: 'Vue', votes: 3 },
          { id: '4', text: 'Svelte', votes: 2 },
        ],
        totalVotes: 35,
      },
    ];

    await Poll.insertMany(samplePolls);
    console.log('Created sample polls');

    // Update user poll counts
    await User.updateOne({ fid: '1234' }, { $inc: { pollsCreated: 1 } });
    await User.updateOne({ fid: '5678' }, { $inc: { pollsCreated: 1 } });
    await User.updateOne({ fid: '9012' }, { $inc: { pollsCreated: 1 } });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();