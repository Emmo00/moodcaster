import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@farcaster/quick-auth';
import connectToDatabase from '@/lib/mongodb';
import Vote from '@/models/Vote';

const client = createClient();

async function verifyToken(request: NextRequest) {
  const authorization = request.headers.get('Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = await client.verifyJwt({
      token,
      domain: process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '') || 'localhost:3001',
    });
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fid = payload.sub;
    await connectToDatabase();

    // Get user's votes
    const votes = await Vote.find({ voterFid: fid.toString() })
      .populate('pollId')
      .sort({ createdAt: -1 })
      .lean();

    const formattedVotes = votes
      .filter(vote => vote.pollId) // Filter out votes where poll was deleted
      .map(vote => {
        const poll = vote.pollId as any;
        const totalVotes = poll.options?.reduce((sum: number, option: any) => sum + (option.votes || 0), 0) || 0;
        
        // Find the selected option text based on optionId
        const selectedOption = poll.options?.find((opt: any) => opt.id === vote.optionId)?.text || 'Unknown Option';
        
        return {
          id: poll._id.toString(),
          question: poll.question,
          totalVotes,
          createdAt: vote.createdAt,
          selectedOption,
        };
      });

    return NextResponse.json({ votedPolls: formattedVotes });
  } catch (error) {
    console.error('Error in my-votes API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}