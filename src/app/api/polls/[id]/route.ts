import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import { Poll } from "@/models"
import mongoose from "mongoose"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid poll ID" }, { status: 400 })
    }

    const poll = await Poll.findById(params.id).lean()

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Transform the data to match expected format
    const transformedPoll = {
      id: poll._id.toString(),
      question: poll.question,
      creatorFid: poll.creatorFid,
      totalVotes: poll.totalVotes,
      createdAt: poll.createdAt.toISOString(),
      options: poll.options
    }

    return NextResponse.json({ poll: transformedPoll })
  } catch (error) {
    console.error("Error fetching poll:", error)
    return NextResponse.json(
      { error: "Failed to fetch poll" }, 
      { status: 500 }
    )
  }
}
