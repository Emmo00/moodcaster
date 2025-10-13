"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setStats({
      pollsCreated: 3,
      pollsVoted: 12,
      avgVotesPerPoll: 28,
    });

    setMyPolls([
      {
        id: "1",
        question: "What is your favorite programming language?",
        totalVotes: 42,
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        question: "Favorite web framework?",
        totalVotes: 35,
        createdAt: new Date().toISOString(),
      },
    ]);

    setVotedPolls([
      {
        id: "2",
        question: "Best time to code?",
        totalVotes: 28,
        createdAt: new Date().toISOString(),
        selectedOption: "Night",
      },
      {
        id: "1",
        question: "What is your favorite programming language?",
        totalVotes: 42,
        createdAt: new Date().toISOString(),
        selectedOption: "TypeScript",
      },
    ]);

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="border-4 border-black bg-cyan-300 px-8 py-4 font-mono text-xl font-bold uppercase text-black">
          Loading Profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-4 border-black bg-white px-4 py-6">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="inline-block border-4 border-black bg-gray-200 px-4 py-2 font-mono font-bold uppercase transition-transform hover:translate-x-1 hover:translate-y-1 text-black"
          >
            ← Back Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        {/* Profile Header */}
        <div className="mb-12 border-4 border-black bg-orange-300 p-8">
          <h1 className="mb-4 font-mono text-4xl font-black uppercase text-black">Your Profile</h1>
          <div className="border-2 border-black bg-white px-3 py-2 font-mono text-lg font-bold text-black">
            @fid1234
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
              <div className="font-mono text-lg font-bold uppercase text-black">Avg Votes/Poll</div>
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
