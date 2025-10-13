import { Metadata } from "next";
import { PollGrid } from "@/components/poll-grid"
import App from "./app";
import { APP_NAME, APP_DESCRIPTION, APP_OG_IMAGE_URL } from "@/lib/constants";
import { getMiniAppEmbedMetadata } from "@/lib/utils";
import Link from "next/link"
import Navbar from "@/components/Navbar";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: APP_NAME,
    openGraph: {
      title: APP_NAME,
      description: APP_DESCRIPTION,
      images: [APP_OG_IMAGE_URL],
    },
    other: {
      "fc:frame": JSON.stringify(getMiniAppEmbedMetadata()),
    },
  };
}

export default function HomePage() {
  return (
    <App title="MoodCaster">
      <div className="min-h-screen bg-white">
        {/* Fixed Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 pb-24 pt-24">
          <PollGrid />
        </main>

        {/* Floating Create Button */}
        <Link
          href="/create"
          className="fixed bottom-8 right-8 z-50 border-4 border-black bg-lime-400 px-6 py-4 font-mono text-xl font-black uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          + New Poll
        </Link>
      </div>
    </App>
  )
}
