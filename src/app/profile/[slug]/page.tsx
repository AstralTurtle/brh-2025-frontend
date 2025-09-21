"use client"
import { Post } from "@/components/Post";
import { Profile } from "@/components/Profile";
import NavBar from "@/components/NavigationBar";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-violet-600 to-indigo-600">
        <NavBar />
        <div className="flex w-full flex-1 flex-col items-center p-4">
          <div className="flex flex-1 flex-col gap-4 rounded-xl bg-zinc-900 p-4">
            <Profile username={params.slug} />
          </div>
        </div>
      </div>
    </main>
  );
}
