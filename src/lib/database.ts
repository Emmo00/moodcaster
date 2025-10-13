import { Poll, User, Vote } from "@/models";
import mongoose from "mongoose";

export class DatabaseService {
  /**
   * Get paginated polls
   */
  static async getPolls(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const polls = await Poll.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as any[];

    const total = await Poll.countDocuments();

    return {
      polls: polls.map(poll => ({
        id: poll._id.toString(),
        question: poll.question,
        creatorFid: poll.creatorFid,
        totalVotes: poll.totalVotes,
        createdAt: poll.createdAt.toISOString(),
        options: poll.options
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Get polls by creator FID
   */
  static async getPollsByCreator(creatorFid: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const polls = await Poll.find({ creatorFid })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as any[];

    const total = await Poll.countDocuments({ creatorFid });

    return {
      polls: polls.map(poll => ({
        id: poll._id.toString(),
        question: poll.question,
        creatorFid: poll.creatorFid,
        totalVotes: poll.totalVotes,
        createdAt: poll.createdAt.toISOString(),
        options: poll.options
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Get user's voting history
   */
  static async getUserVotes(voterFid: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const votes = await Vote.find({ voterFid })
      .populate('pollId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as any[];

    const total = await Vote.countDocuments({ voterFid });

    return {
      votes: votes.map(vote => ({
        id: vote._id.toString(),
        pollId: vote.pollId._id.toString(),
        optionId: vote.optionId,
        createdAt: vote.createdAt.toISOString(),
        poll: {
          question: vote.pollId.question,
          creatorFid: vote.pollId.creatorFid
        }
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Check if user has voted on a specific poll
   */
  static async hasUserVoted(pollId: string, voterFid: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(pollId)) {
      return false;
    }

    const vote = await Vote.findOne({ 
      pollId: new mongoose.Types.ObjectId(pollId), 
      voterFid 
    });
    
    return !!vote;
  }

  /**
   * Get or create user
   */
  static async getOrCreateUser(fid: string, userData?: Partial<{
    username: string;
    displayName: string;
    pfpUrl: string;
    bio: string;
  }>) {
    const user = await User.findOneAndUpdate(
      { fid },
      {
        $set: {
          ...userData,
          lastActive: new Date()
        }
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    );

    return {
      fid: user.fid,
      username: user.username,
      displayName: user.displayName,
      pfpUrl: user.pfpUrl,
      bio: user.bio,
      pollsCreated: user.pollsCreated,
      votesSubmitted: user.votesSubmitted,
      lastActive: user.lastActive.toISOString(),
      createdAt: user.createdAt.toISOString()
    };
  }

  /**
   * Get poll statistics
   */
  static async getPollStats() {
    const [totalPolls, totalVotes, totalUsers] = await Promise.all([
      Poll.countDocuments(),
      Vote.countDocuments(),
      User.countDocuments()
    ]);

    const avgVotesPerPoll = totalPolls > 0 ? totalVotes / totalPolls : 0;

    return {
      totalPolls,
      totalVotes,
      totalUsers,
      avgVotesPerPoll: Math.round(avgVotesPerPoll * 100) / 100
    };
  }
}