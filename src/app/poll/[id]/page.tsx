import { PollDetails } from "@/components/poll-details"
import App from "../../app"

export default async function PollPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return (
    <App title="Poll Details">
      <PollDetails pollId={id} />
    </App>
  )
}
