import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@farcaster/quick-auth';
import connectToDatabase from '@/lib/mongodb';
import Poll from '@/models/Poll';
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
      domain: process.env.NEXT_PUBLIC_URL?.replace('https://', '') || 'localhost:3000',
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

    // Get user info from Neynar API
    let userProfile = null;
    try {
      const neynarApiKey = process.env.NEYNAR_API_KEY;
      if (neynarApiKey && neynarApiKey !== 'FARCASTER_V2_FRAMES_DEMO') {
        const neynarResponse = await fetch(
          `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
          {
            headers: {
              'api_key': neynarApiKey,
            },
          }
        );
        
        if (neynarResponse.ok) {
          const neynarData = await neynarResponse.json();
          if (neynarData.users && neynarData.users.length > 0) {
            const user = neynarData.users[0];
            userProfile = {
              fid: user.fid,
              username: user.username,
              displayName: user.display_name,
              pfpUrl: user.pfp_url,
              bio: user.profile?.bio?.text || '',
              followerCount: user.follower_count,
              followingCount: user.following_count,
            };
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user from Neynar:', error);
    }

    // Get user stats from database
    const [pollsCreated, votesCount, userPolls] = await Promise.all([
      Poll.countDocuments({ createdBy: fid }),
      Vote.countDocuments({ voterFid: fid.toString() }),
      Poll.find({ createdBy: fid }).lean(),
    ]);

    // Calculate average votes per poll
    const totalVotesOnMyPolls = userPolls.reduce((sum, poll) => {
      return sum + (poll.options?.reduce((optSum: number, opt: any) => optSum + (opt.votes || 0), 0) || 0);
    }, 0);
    
    const avgVotesPerPoll = pollsCreated > 0 ? Math.round(totalVotesOnMyPolls / pollsCreated) : 0;

    const stats = {
      pollsCreated,
      pollsVoted: votesCount,
      avgVotesPerPoll,
    };

    return NextResponse.json({
      profile: userProfile || { fid, username: null, displayName: null, pfpUrl: null },
      stats,
    });
  } catch (error) {
    console.error('Error in profile API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}