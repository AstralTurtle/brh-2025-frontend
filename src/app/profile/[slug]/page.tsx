import { Post } from "@/components/Post";
import { Profile } from "@/components/Profile";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-violet-600 to-indigo-600">
        <div className="flex h-24 w-full items-center bg-transparent">
          <h1 className="mx-12 text-3xl font-bold italic text-white">frame one</h1>
        </div>
        <div className="flex w-full flex-1 flex-col items-center p-4">
          <div className="flex flex-1 flex-col gap-4 rounded-xl bg-zinc-900 p-4">
            <Profile
              username={"astralturtle"}
              avatar={"https://cdn.discordapp.com/avatars/196269131144626176/4ece9a42ad4fc33ae1dd6fad18d0bb7e"}
              bio={"part-time space turtle, full time SWE intern"}
            ></Profile>
            <Post
              username={"astralturtle"}
              avatar={"https://cdn.discordapp.com/avatars/196269131144626176/4ece9a42ad4fc33ae1dd6fad18d0bb7e"}
              date={new Date()}
              message={
                "Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together?"
              }
              media={[]}
            ></Post>
          </div>
        </div>
      </div>
    </main>
  );
}
