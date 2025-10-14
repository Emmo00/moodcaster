"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuickAuth } from "@/hooks/useQuickAuth";
import { sdk } from "@farcaster/miniapp-sdk";
import Navbar from "./Navbar";

interface UserProfile {
  fid: number;
  username: string | null;
  displayName: string | null;
  pfpUrl: string | null;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
}

interface UserStats {
  pollsCreated: number;
  pollsVoted: number;
  avgVotesPerPoll: number;
}

interface Poll {
  id: string;
  question: string;
  totalVotes: number;
  createdAt: string;
}

interface VotedPoll extends Poll {
  selectedOption: string;
}

export function ProfileView() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [myPolls, setMyPolls] = useState<Poll[]>([]);
  const [votedPolls, setVotedPolls] = useState<VotedPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userContext, setUserContext] = useState<any>(null);
  const { authenticatedUser, getToken } = useQuickAuth();

  // Get user profile data from SDK context
  useEffect(() => {
    const getUserContext = async () => {
      try {
        const context = await sdk.context;
        setUserContext(context.user);
      } catch (error) {
        console.error('Failed to get user context:', error);
      }
    };

    getUserContext();
  }, []);

  // Enable back navigation
  useEffect(() => {
    const enableBackNavigation = async () => {
      try {
        const capabilities = await sdk.getCapabilities();
        if (capabilities.includes('back')) {
          await sdk.back.enableWebNavigation();
        }
      } catch (error) {
        console.error('Failed to enable back navigation:', error);
      }
    };

    enableBackNavigation();
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await getToken();
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        // Fetch only stats and polls data - profile info comes from SDK context
        const [statsRes, myPollsRes, votedPollsRes] = await Promise.all([
          fetch('/api/users/profile', { headers }),
          fetch('/api/users/my-polls', { headers }),
          fetch('/api/users/my-votes', { headers }),
        ]);

        if (!statsRes.ok || !myPollsRes.ok || !votedPollsRes.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const [statsData, myPollsData, votedPollsData] = await Promise.all([
          statsRes.json(),
          myPollsRes.json(),
          votedPollsRes.json(),
        ]);

        setStats(statsData.stats);
        setMyPolls(myPollsData.polls);
        setVotedPolls(votedPollsData.votedPolls);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (authenticatedUser) {
      fetchProfileData();
    }
  }, [authenticatedUser, getToken]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="border-4 border-black bg-cyan-300 px-8 py-4 font-mono text-xl font-bold uppercase text-black">
          Loading Profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="border-4 border-black bg-red-300 px-8 py-4 font-mono text-xl font-bold uppercase text-black">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-12 pt-24">
        {/* Profile Header */}
        <div className="mb-12 border-4 border-black bg-orange-300 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Profile Picture */}
              <div className="border-4 border-black bg-white p-2">
                {userContext?.pfpUrl ? (
                  <img
                    src={userContext.pfpUrl}
                    alt="Profile"
                    className="h-20 w-20 border-2 border-black object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center border-2 border-black bg-gray-200">
                    <span className="font-mono text-2xl font-black text-black">?</span>
                  </div>
                )}
              </div>
              
              {/* User Info */}
              <div>
                <h1 className="mb-2 font-mono text-4xl font-black uppercase text-black">
                  {userContext?.displayName || userContext?.username || 'Anonymous User'}
                </h1>
                <div className="mb-2 border-2 border-black bg-white px-3 py-2 font-mono text-lg font-bold text-black">
                  @{userContext?.username || `fid${userContext?.fid || 'unknown'}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="border-4 border-black bg-cyan-300 p-6">
              <div className="mb-2 font-mono text-5xl font-black text-black">{stats.pollsCreated}</div>
              <div className="font-mono text-lg font-bold uppercase text-black">Polls Created</div>
            </div>
            <div className="border-4 border-black bg-yellow-300 p-6">
              <div className="mb-2 font-mono text-5xl font-black text-black">{stats.pollsVoted}</div>
              <div className="font-mono text-lg font-bold uppercase text-black">Polls Voted</div>
            </div>
            <div className="border-4 border-black bg-pink-300 p-6">
              <div className="mb-2 font-mono text-5xl font-black text-black">{stats.avgVotesPerPoll}</div>
              <div className="font-mono text-lg font-bold uppercase text-black">Avg Votes Per Poll</div>
            </div>
          </div>
        )}

        {/* My Polls Section */}
        <section className="mb-12">
          <h2 className="mb-6 border-4 border-black bg-lime-300 p-4 font-mono text-2xl font-black uppercase text-black">
            My Polls
          </h2>
          {myPolls.length === 0 ? (
            <div className="border-4 border-black bg-gray-100 p-8 text-center">
              <p className="font-mono text-lg font-bold uppercase text-black">No polls created yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {myPolls.map((poll) => (
                <Link
                  key={poll.id}
                  href={`/poll/${poll.id}`}
                  className="block border-4 border-black bg-white p-6 transition-transform hover:translate-x-2 hover:translate-y-2"
                >
                  <h3 className="mb-4 font-mono text-xl font-black uppercase leading-tight text-black">
                    {poll.question}
                  </h3>
                  <div className="border-2 border-black bg-orange-300 px-3 py-2 font-mono text-sm font-bold text-black">
                    {poll.totalVotes} votes
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* My Votes Section */}
        <section>
          <h2 className="mb-6 border-4 border-black bg-cyan-300 p-4 font-mono text-2xl font-black uppercase text-black">
            My Votes
          </h2>
          {votedPolls.length === 0 ? (
            <div className="border-4 border-black bg-gray-100 p-8 text-center">
              <p className="font-mono text-lg font-bold uppercase text-black">No votes cast yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {votedPolls.map((poll) => (
                <Link
                  key={poll.id}
                  href={`/poll/${poll.id}`}
                  className="block border-4 border-black bg-white p-6 transition-transform hover:translate-x-2 hover:translate-y-2"
                >
                  <h3 className="mb-4 font-mono text-xl font-black uppercase leading-tight text-black">
                    {poll.question}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="border-2 border-black bg-lime-300 px-3 py-2 font-mono text-sm font-bold text-black">
                      You voted: {poll.selectedOption}
                    </span>
                    <span className="border-2 border-black bg-gray-200 px-3 py-2 font-mono text-sm font-bold text-black">
                      {poll.totalVotes} total votes
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
