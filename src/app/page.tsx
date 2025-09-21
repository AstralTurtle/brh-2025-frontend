import { Post } from "@/components/Post";
import Image from "next/image";
import feedback from "../../public/feedback.svg";
import groups from "../../public/groups.svg";
import share from "../../public/share.svg";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-violet-600 to-indigo-600">

      <div className="flex flex-row gap-12 px-12 py-6">
        <h1 className="text-3xl font-bold italic text-white">frame one</h1>
      </div>

      <div className="flex flex-row gap-12 p-12 grow">
        <div className="basis-2/3">

          <div className="flex flex-col text-white gap-12">
            <h2 className="text-balance text-9xl font-extrabold text-white">Level up your game.</h2>

            <div className="flex flex-row gap-4">
              <div className="flex basis-1/3 flex-col gap-4 rounded-lg bg-zinc-900 p-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-md bg-zinc-800 p-4">
                  <Image className="h-full w-full fill-white" src={groups} alt="" />
                </div>
                <h3 className="text-balance text-5xl font-bold">Meet your team.</h3>
                <p className="text-2xl">Connect with like-minded game devs, designers, and artists.</p>
              </div>
              <div className="flex basis-1/3 flex-col gap-4 rounded-lg bg-zinc-900 p-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-md bg-zinc-800 p-4">
                  <Image className="h-full w-full fill-white" src={feedback} alt="" />
                </div>
                <h3 className="text-balance text-5xl font-bold">Build your project.</h3>
                <p className="text-2xl">
                  Turn your ideas into reality. Leverage insightful feedback from creators and AI.
                </p>
              </div>
              <div className="flex basis-1/3 flex-col gap-4 rounded-lg bg-zinc-900 p-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-md bg-zinc-800 p-4">
                  <Image className="h-full w-full fill-white" src={share} alt="" />
                </div>
                <h3 className="text-balance text-5xl font-bold">Share your vision.</h3>
                <p className="text-2xl">
                  Meet your players where they are. Your posts will reach any ActivityPub platform.
                </p>
              </div>
            </div>

            <button className="rounded-full bg-white py-4 text-3xl font-semibold text-black">
              New Game
            </button>
          </div>

        </div>

        <div className="basis-1/3">
          <div className="flex flex-col gap-4 overflow-clip rounded-lg bg-slate-800 p-4 h-full max-h-[800px]">
            <Post
              username={"astralturtle"}
              avatar={"https://cdn.discordapp.com/avatars/196269131144626176/4ece9a42ad4fc33ae1dd6fad18d0bb7e"}
              date={new Date()}
              message={
                "Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together?"
              }
              media={[]}
            ></Post>
                       <Post
              username={"astralturtle"}
              avatar={"https://cdn.discordapp.com/avatars/196269131144626176/4ece9a42ad4fc33ae1dd6fad18d0bb7e"}
              date={new Date()}
              message={
                "Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together?"
              }
              media={[]}
            ></Post>
                       <Post
              username={"astralturtle"}
              avatar={"https://cdn.discordapp.com/avatars/196269131144626176/4ece9a42ad4fc33ae1dd6fad18d0bb7e"}
              date={new Date()}
              message={
                "Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together?"
              }
              media={[]}
            ></Post>
                       <Post
              username={"astralturtle"}
              avatar={"https://cdn.discordapp.com/avatars/196269131144626176/4ece9a42ad4fc33ae1dd6fad18d0bb7e"}
              date={new Date()}
              message={
                "Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together?"
              }
              media={[]}
            ></Post>
                       <Post
              username={"astralturtle"}
              avatar={"https://cdn.discordapp.com/avatars/196269131144626176/4ece9a42ad4fc33ae1dd6fad18d0bb7e"}
              date={new Date()}
              message={
                "Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together? Anyone want to do Pirate Jam together?"
              }
              media={[]}
            ></Post>
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
    </div>
  );
}
