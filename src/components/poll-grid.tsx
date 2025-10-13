"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Poll {
  id: string
  question: string
  creatorFid: string
  totalVotes: number
  createdAt: string
}

export function PollGrid() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/polls")
      .then((res) => res.json())
      .then((data) => {
        setPolls(data.polls || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Error fetching polls:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="border-4 border-black bg-cyan-300 px-8 py-4 font-mono text-xl font-bold uppercase text-black">
          Loading Polls...
        </div>
      </div>
    )
  }

  if (polls.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <div className="border-4 border-black bg-pink-300 px-8 py-6 font-mono text-2xl font-black uppercase text-black">
          No Polls Yet
        </div>
        <p className="font-mono text-lg font-bold text-black">Be the first to create one!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {polls.map((poll) => (
        <div
          key={poll.id}
          className="border-4 border-black bg-white p-6 transition-transform hover:translate-x-1 hover:translate-y-1"
        >
          <h2 className="mb-4 font-mono text-xl font-black uppercase leading-tight text-black">{poll.question}</h2>
          <div className="mb-4 flex items-center gap-2">
            <span className="border-2 border-black bg-gray-200 px-2 py-1 font-mono text-sm font-bold text-black">
              @fid{poll.creatorFid}
            </span>
            <span className="border-2 border-black bg-orange-300 px-2 py-1 font-mono text-sm font-bold text-black">
              {poll.totalVotes} votes
            </span>
          </div>
          <Link
            href={`/poll/${poll.id}`}
            className="block border-4 border-black bg-cyan-400 px-4 py-3 text-center font-mono font-black uppercase transition-all hover:bg-cyan-300 text-black"
          >
            View Poll
          </Link>
        </div>
      ))}
    </div>
  )
}
