import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Poll, Vote, User } from "@/models";
import mongoose from "mongoose";
import { createClient, Errors } from '@farcaster/quick-auth';

const client = createClient();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    
    // Get and verify the authentication token
    const authorization = request.headers.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const token = authorization.split(' ')[1];
    
    // Get domain from environment or request
    const domain = process.env.NEXT_PUBLIC_URL
      ? new URL(process.env.NEXT_PUBLIC_URL).hostname
      : request.headers.get('host') || 'localhost';

    let authenticatedFid: number;
    
    try {
      // Verify the JWT token using Quick Auth
      const payload = await client.verifyJwt({
        token,
        domain,
      });
      authenticatedFid = payload.sub;
    } catch (e) {
      if (e instanceof Errors.InvalidTokenError) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      throw e;
    }
    
    const body = await request.json();
    const { fid, optionId } = body;
    const { id } = await params;

    // Verify that the provided FID matches the authenticated user
    if (fid !== authenticatedFid) {
      return NextResponse.json({ error: 'FID mismatch with authenticated user' }, { status: 403 });
    }

    // Validate input
    if (!fid || !optionId) {
      return NextResponse.json({ error: "FID and optionId are required" }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid poll ID" }, { status: 400 });
    }

    const pollObjectId = new mongoose.Types.ObjectId(id);

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
    const option = poll.options.find((o: any) => o.id === optionId);
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
