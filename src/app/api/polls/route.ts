import { NextResponse } from "next/server"

// Mock data for now - will be replaced with database
const mockPolls = [
  {
    id: "1",
    question: "What is your favorite programming language?",
    creatorFid: "1234",
    totalVotes: 42,
    createdAt: new Date().toISOString(),
    options: [
      { id: "1", text: "TypeScript", votes: 15 },
      { id: "2", text: "Python", votes: 12 },
      { id: "3", text: "Rust", votes: 10 },
      { id: "4", text: "Go", votes: 5 },
    ],
  },
  {
    id: "2",
    question: "Best time to code?",
    creatorFid: "5678",
    totalVotes: 28,
    createdAt: new Date().toISOString(),
    options: [
      { id: "1", text: "Morning", votes: 8 },
      { id: "2", text: "Afternoon", votes: 5 },
      { id: "3", text: "Evening", votes: 7 },
      { id: "4", text: "Night", votes: 8 },
    ],
  },
  {
    id: "3",
    question: "Favorite web framework?",
    creatorFid: "9012",
    totalVotes: 35,
    createdAt: new Date().toISOString(),
    options: [
      { id: "1", text: "Next.js", votes: 20 },
      { id: "2", text: "React", votes: 10 },
      { id: "3", text: "Vue", votes: 3 },
      { id: "4", text: "Svelte", votes: 2 },
    ],
  },
]

export async function GET() {
  return NextResponse.json({ polls: mockPolls })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { question, options, fid } = body

  // Validate input
  if (!question || !options || options.length < 2 || options.length > 4) {
    return NextResponse.json({ error: "Invalid poll data" }, { status: 400 })
  }

  // Create new poll
  const newPoll = {
    id: String(mockPolls.length + 1),
    question,
    creatorFid: fid || "0000",
    totalVotes: 0,
    createdAt: new Date().toISOString(),
    options: options.map((text: string, index: number) => ({
      id: String(index + 1),
      text,
      votes: 0,
    })),
  }

  mockPolls.push(newPoll)

  return NextResponse.json({ poll: newPoll }, { status: 201 })
}
