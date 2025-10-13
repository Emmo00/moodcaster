"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuickAuth } from "@/hooks/useQuickAuth"
import Navbar from "./Navbar"

interface PollOption {
  id: string
  text: string
  votes: number
}

interface Poll {
  id: string
  question: string
  creatorFid: string
  totalVotes: number
  options: PollOption[]
}

export function PollDetails({ pollId }: { pollId: string }) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [_selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const _router = useRouter()
  const { authenticatedUser, getToken } = useQuickAuth()

  useEffect(() => {
    fetch(`/api/polls/${pollId}`)
      .then((res) => res.json())
      .then((data) => {
        setPoll(data.poll)
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Error fetching poll:", err)
        setLoading(false)
      })
  }, [pollId])

  const handleVote = async (optionId: string) => {
    if (voting || hasVoted) return

    // Check if user is authenticated
    if (!authenticatedUser) {
      setError("You must be signed in to vote");
      return;
    }

    setVoting(true)
    setSelectedOption(optionId)
    setError(null)

    try {
      // Get the authentication token
      const token = await getToken();
      if (!token) {
        setError("Authentication token not found. Please sign in again.");
        setVoting(false);
        return;
      }

      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          fid: authenticatedUser.fid, 
          optionId 
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPoll(data.poll)
        setHasVoted(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to submit vote")
      }
    } catch (err) {
      console.error("[v0] Error voting:", err)
      setError("An error occurred while voting")
    } finally {
      setVoting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="border-4 border-black bg-cyan-300 px-8 py-4 font-mono text-xl font-bold uppercase text-black">
          Loading Poll...
        </div>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
        <div className="border-4 border-black bg-pink-300 px-8 py-6 font-mono text-2xl font-black uppercase text-black">
          Poll Not Found
        </div>
        <Link
          href="/"
          className="border-4 border-black bg-lime-400 px-6 py-3 font-mono font-bold uppercase transition-transform hover:translate-x-1 hover:translate-y-1 text-black"
        >
          ← Back Home
        </Link>
      </div>
    )
  }

  const colors = ["bg-cyan-400", "bg-yellow-400", "bg-pink-400", "bg-lime-400"]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-12 pt-24">
        {/* Poll Question */}
        <div className="mb-8 border-4 border-black bg-orange-300 p-8">
          <h1 className="font-mono text-3xl font-black uppercase leading-tight text-black">{poll.question}</h1>
          <div className="mt-4 flex items-center gap-2">
            <span className="border-2 border-black bg-white px-3 py-1 font-mono text-sm font-bold text-black">
              @fid{poll.creatorFid}
            </span>
            <span className="border-2 border-black bg-white px-3 py-1 font-mono text-sm font-bold text-black">
              {poll.totalVotes} total votes
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 border-4 border-black bg-red-300 p-4">
            <p className="font-mono font-bold text-black">{error}</p>
          </div>
        )}

        {/* Voting Options */}
        {!hasVoted && (
          <div className="mb-12 space-y-4">
            <h2 className="mb-4 font-mono text-xl font-black uppercase text-black">Cast Your Vote:</h2>
            {poll.options.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={voting}
                className={`w-full border-4 border-black ${colors[index % colors.length]} p-6 text-left font-mono text-xl font-black uppercase transition-all hover:translate-x-2 hover:translate-y-2 disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 text-black`}
              >
                {option.text}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        <div className="space-y-6">
          <h2 className="font-mono text-2xl font-black uppercase text-black">Results:</h2>
          {poll.options.map((option, index) => {
            const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0

            return (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-bold uppercase text-black">{option.text}</span>
                  <span className="border-2 border-black bg-white px-3 py-1 font-mono text-sm font-bold text-black">
                    {option.votes} votes
                  </span>
                </div>
                <div className="border-4 border-black bg-gray-200">
                  <div
                    className={`border-r-4 border-black ${colors[index % colors.length]} py-4 transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="ml-4 font-mono text-lg font-black text-black">{percentage}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {hasVoted && (
          <div className="mt-8 border-4 border-black bg-lime-300 p-6 text-center">
            <p className="font-mono text-xl font-black uppercase text-black">Vote Recorded!</p>
          </div>
        )}
      </main>
    </div>
  )
}
