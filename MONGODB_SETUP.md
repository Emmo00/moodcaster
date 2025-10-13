# MoodCaster - MongoDB Setup Guide

This guide explains how to set up and use MongoDB with the MoodCaster application.

## Prerequisites

1. **MongoDB**: Make sure you have MongoDB installed and running locally
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Compass for a GUI: https://www.mongodb.com/products/compass

2. **Node.js**: Version 22.11.0 or higher

## Setup Instructions

### 1. Environment Configuration

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/moodcaster?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.6
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Seed the Database

Populate the database with initial data:

```bash
npm run seed-db
```

This will create:
- 3 sample users
- 3 sample polls with options and votes

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is in use).

## Database Models

### Poll Model
```typescript
interface IPoll {
  question: string;
  creatorFid: string;
  totalVotes: number;
  options: IPollOption[];
  createdAt: Date;
  updatedAt: Date;
}

interface IPollOption {
  id: string;
  text: string;
  votes: number;
}
```

### User Model
```typescript
interface IUser {
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
```

### Vote Model
```typescript
interface IVote {
  pollId: mongoose.Types.ObjectId;
  voterFid: string;
  optionId: string;
  createdAt: Date;
}
```

## API Endpoints

### Polls

- `GET /api/polls` - Get all polls (paginated)
- `POST /api/polls` - Create a new poll
- `GET /api/polls/[id]` - Get a specific poll
- `POST /api/polls/[id]/vote` - Vote on a poll

### Expected Request/Response Formats

#### Create Poll (POST /api/polls)
```json
{
  "question": "What's your favorite color?",
  "options": ["Red", "Blue", "Green", "Yellow"],
  "fid": "1234"
}
```

#### Vote on Poll (POST /api/polls/[id]/vote)
```json
{
  "fid": "1234",
  "optionId": "1"
}
```

## Database Operations

### Key Features

1. **Duplicate Vote Prevention**: Users can only vote once per poll
2. **Automatic Vote Counting**: Total votes are automatically calculated
3. **User Statistics**: Track polls created and votes submitted per user
4. **Indexing**: Optimized queries with proper database indexes

### Validation Rules

- Poll questions: 1-500 characters
- Poll options: 2-4 options, each 1-200 characters
- Option text is trimmed of whitespace
- Vote counts cannot be negative

## Database Connection

The application uses Mongoose with connection pooling and caching for optimal performance:

- Connections are cached across hot reloads in development
- Automatic reconnection on connection loss
- Buffer commands disabled for immediate error feedback

## Development Tips

### Viewing Data

Use MongoDB Compass or the MongoDB shell to view your data:

```bash
# Connect to MongoDB shell
mongosh mongodb://127.0.0.1:27017/moodcaster

# List collections
show collections

# View polls
db.polls.find().pretty()

# View users
db.users.find().pretty()

# View votes
db.votes.find().pretty()
```

### Resetting Data

To clear all data and reseed:

```bash
npm run seed-db
```

### Database Service

The `DatabaseService` class in `/src/lib/database.ts` provides utility methods for common operations:

- `getPolls(page, limit)` - Paginated poll retrieval
- `getPollsByCreator(fid)` - Get polls by specific creator
- `getUserVotes(fid)` - Get user's voting history
- `hasUserVoted(pollId, fid)` - Check if user voted on poll
- `getPollStats()` - Get overall application statistics

## Troubleshooting

### Connection Issues

1. **MongoDB not running**: Ensure MongoDB service is running
   ```bash
   # On Windows (if installed as service)
   net start MongoDB
   
   # Or start manually
   mongod
   ```

2. **Port conflicts**: Check if port 27017 is available
   ```bash
   netstat -an | findstr 27017
   ```

3. **Permission issues**: Ensure MongoDB has write permissions to data directory

### Common Errors

- **Module not found**: Run `npm install` to ensure all dependencies are installed
- **Invalid ObjectId**: Ensure poll IDs are valid MongoDB ObjectIds
- **Duplicate key error**: Users trying to vote twice on same poll (this is expected behavior)

## Production Considerations

For production deployment:

1. Use MongoDB Atlas or a managed MongoDB service
2. Update `MONGODB_URI` to your production database
3. Implement proper authentication and authorization
4. Add connection string encryption
5. Set up database backups
6. Monitor database performance and usage

## Security Notes

- The `.env` file is gitignored to prevent committing sensitive data
- FID-based authentication assumes trusted input (implement proper auth in production)
- Database connection string should be encrypted in production
- Implement rate limiting for API endpoints
- Validate all input data before database operations