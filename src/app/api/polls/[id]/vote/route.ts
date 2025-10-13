import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Poll, Vote, User } from "@/models";
import mongoose from "mongoose";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { fid, optionId } = body;

    // Validate input
    if (!fid || !optionId) {
      return NextResponse.json({ error: "FID and optionId are required" }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid poll ID" }, { status: 400 });
    }

    const pollObjectId = new mongoose.Types.ObjectId(params.id);

    // Check if user has already voted on this poll
    const existingVote = await Vote.findOne({ pollId: pollObjectId, voterFid: fid });
    if (existingVote) {
      return NextResponse.json({ error: "User has already voted on this poll" }, { status: 409 });
    }

    // Find the poll
    const poll = await Poll.findById(pollObjectId);
    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // Find the option
    const option = poll.options.find((o) => o.id === optionId);
    if (!option) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 });
    }

    // Create the vote record
    const vote = new Vote({
      pollId: pollObjectId,
      voterFid: fid,
      optionId: optionId,
    });

    // Update the poll with the new vote
    option.votes += 1;
    poll.totalVotes += 1;

    // Save both the vote and updated poll
    await Promise.all([
      vote.save(),
      poll.save(),
      // Update or create user record
      User.findOneAndUpdate(
        { fid },
        { 
          $inc: { votesSubmitted: 1 },
          $set: { lastActive: new Date() }
        },
        { upsert: true, new: true }
      )
    ]);

    // Transform the response to match expected format
    const transformedPoll = {
      id: poll._id.toString(),
      question: poll.question,
      creatorFid: poll.creatorFid,
      totalVotes: poll.totalVotes,
      createdAt: poll.createdAt.toISOString(),
      options: poll.options
    };

    return NextResponse.json({ poll: transformedPoll, message: "Vote recorded" });
  } catch (error) {
    console.error("Error recording vote:", error);
    return NextResponse.json(
      { error: "Failed to record vote" }, 
      { status: 500 }
    );
  }
}
