import { PollDetails } from "@/components/poll-details"

export default function PollPage({ params }: { params: { id: string } }) {
  return <PollDetails pollId={params.id} />
}
