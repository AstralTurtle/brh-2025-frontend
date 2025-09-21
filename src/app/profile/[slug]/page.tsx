import { Post } from "@/components/Post";
import { Profile } from "@/components/Profile";
import NavBar from "@/components/NavigationBar";
import RemoteProfileClient from "@/components/RemoteProfileClient";

type PageProps = {
  params: { slug: string };
  searchParams?: { remote?: string };
};

export default async function ProfilePage({ params, searchParams }: PageProps) {
  const decoded = decodeURIComponent(params.slug);
  const isRemote = searchParams?.remote === "1"; // only remote when explicitly flagged

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-violet-600 to-indigo-600">
      <NavBar />
      <div className="p-6">
        <div className="rounded-2xl bg-zinc-900 p-6 text-white">
          {isRemote ? (
            <RemoteProfileClient actorHint={decoded} />
          ) : (
            <div>Loading profile…</div>
          )}
        </div>
      </div>
    </div>
  );
}
