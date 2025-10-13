import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import { Poll, User } from "@/models"
import { createClient, Errors } from '@farcaster/quick-auth';

const client = createClient();

export async function GET() {
  try {
    await connectToDatabase()
    
    // Fetch all polls, sorted by creation date (newest first)
    const polls = await Poll.find({})
      .sort({ createdAt: -1 })
      .limit(50) // Limit to 50 most recent polls
      .lean()
    
    // Transform the data to match the expected format
    const transformedPolls = polls.map(poll => ({
      id: poll._id.toString(),
      question: poll.question,
      creatorFid: poll.creatorFid,
      totalVotes: poll.totalVotes,
      createdAt: poll.createdAt.toISOString(),
      options: poll.options
    }))

    return NextResponse.json({ polls: transformedPolls })
  } catch (error) {
    console.error("Error fetching polls:", error)
    return NextResponse.json(
      { error: "Failed to fetch polls" }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase()
    
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
    
    const body = await request.json()
    const { question, options, fid } = body

    // Verify that the provided FID matches the authenticated user
    if (fid !== authenticatedFid) {
      return NextResponse.json({ error: 'FID mismatch with authenticated user' }, { status: 403 });
    }

    // Validate input
    if (!question || !options || options.length < 2 || options.length > 4) {
      return NextResponse.json({ error: "Invalid poll data" }, { status: 400 })
    }

    if (!fid) {
      return NextResponse.json({ error: "User FID is required" }, { status: 400 })
    }

    // Create poll options with proper structure
    const pollOptions = options.map((text: string, index: number) => ({
      id: (index + 1).toString(),
      text: text.trim(),
      votes: 0,
    }))

    // Create new poll
    const newPoll = new Poll({
      question: question.trim(),
      creatorFid: fid,
      options: pollOptions,
      totalVotes: 0,
    })

    await newPoll.save()

    // Update or create user record
    await User.findOneAndUpdate(
      { fid },
      { 
        $inc: { pollsCreated: 1 },
        $set: { lastActive: new Date() }
      },
      { upsert: true, new: true }
    )

    // Transform the response to match expected format
    const responseData = {
      id: newPoll._id.toString(),
      question: newPoll.question,
      creatorFid: newPoll.creatorFid,
      totalVotes: newPoll.totalVotes,
      createdAt: newPoll.createdAt.toISOString(),
      options: newPoll.options,
    }

    return NextResponse.json({ poll: responseData }, { status: 201 })
  } catch (error) {
    console.error("Error creating poll:", error)
    return NextResponse.json(
      { error: "Failed to create poll" }, 
      { status: 500 }
    )
  }
}
