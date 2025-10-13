"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const router = useRouter()

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

    setVoting(true)
    setSelectedOption(optionId)

    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fid: "1234", optionId }),
      })

      if (response.ok) {
        const data = await response.json()
        setPoll(data.poll)
        setHasVoted(true)
      }
    } catch (err) {
      console.error("[v0] Error voting:", err)
    } finally {
      setVoting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="border-4 border-black bg-cyan-300 px-8 py-4 font-mono text-xl font-bold uppercase">
          Loading Poll...
        </div>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
        <div className="border-4 border-black bg-pink-300 px-8 py-6 font-mono text-2xl font-black uppercase">
          Poll Not Found
        </div>
        <Link
          href="/"
          className="border-4 border-black bg-lime-400 px-6 py-3 font-mono font-bold uppercase transition-transform hover:translate-x-1 hover:translate-y-1"
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
      <div className="border-b-4 border-black bg-white px-4 py-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="inline-block border-4 border-black bg-gray-200 px-4 py-2 font-mono font-bold uppercase transition-transform hover:translate-x-1 hover:translate-y-1"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-12">
        {/* Poll Question */}
        <div className="mb-8 border-4 border-black bg-orange-300 p-8">
          <h1 className="font-mono text-3xl font-black uppercase leading-tight text-black">{poll.question}</h1>
          <div className="mt-4 flex items-center gap-2">
            <span className="border-2 border-black bg-white px-3 py-1 font-mono text-sm font-bold">
              @fid{poll.creatorFid}
            </span>
            <span className="border-2 border-black bg-white px-3 py-1 font-mono text-sm font-bold">
              {poll.totalVotes} total votes
            </span>
          </div>
        </div>

        {/* Voting Options */}
        {!hasVoted && (
          <div className="mb-12 space-y-4">
            <h2 className="mb-4 font-mono text-xl font-black uppercase">Cast Your Vote:</h2>
            {poll.options.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={voting}
                className={`w-full border-4 border-black ${colors[index % colors.length]} p-6 text-left font-mono text-xl font-black uppercase transition-all hover:translate-x-2 hover:translate-y-2 disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0`}
              >
                {option.text}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        <div className="space-y-6">
          <h2 className="font-mono text-2xl font-black uppercase">Results:</h2>
          {poll.options.map((option, index) => {
            const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0

            return (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-bold uppercase">{option.text}</span>
                  <span className="border-2 border-black bg-white px-3 py-1 font-mono text-sm font-bold">
                    {option.votes} votes
                  </span>
                </div>
                <div className="border-4 border-black bg-gray-200">
                  <div
                    className={`border-r-4 border-black ${colors[index % colors.length]} py-4 transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="ml-4 font-mono text-lg font-black">{percentage}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {hasVoted && (
          <div className="mt-8 border-4 border-black bg-lime-300 p-6 text-center">
            <p className="font-mono text-xl font-black uppercase">Vote Recorded!</p>
          </div>
        )}
      </main>
    </div>
  )
}
