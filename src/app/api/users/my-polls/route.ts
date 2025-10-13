import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@farcaster/quick-auth';
import connectToDatabase from '@/lib/mongodb';
import Poll from '@/models/Poll';

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

    // Get user's created polls
    const polls = await Poll.find({ createdBy: fid })
      .sort({ createdAt: -1 })
      .lean() as any[];

    const formattedPolls = polls.map(poll => {
      const totalVotes = poll.options?.reduce((sum: number, option: any) => sum + (option.votes || 0), 0) || 0;
      
      return {
        id: poll._id.toString(),
        question: poll.question,
        totalVotes,
        createdAt: poll.createdAt,
      };
    });

    return NextResponse.json({ polls: formattedPolls });
  } catch (error) {
    console.error('Error in my-polls API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}