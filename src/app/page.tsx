import { Post } from "@/components/Post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Image from "next/image";
import thum1 from "../../public/thumbnail1.webp";
import thum2 from "../../public/thumbnail2.webp";
import thum3 from "../../public/thumbnail3.webp";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-violet-600 to-indigo-600">
        <div className="flex h-24 w-full items-center bg-transparent">
          <h1 className="mx-12 text-3xl font-bold italic text-white">placeholder</h1>
        </div>
        <div className="flex w-full flex-1 flex-row gap-12 p-12">
          <div className="flex basis-1/2 flex-col items-center">
            <h2 className="text-balance text-9xl font-extrabold text-white">Level up your game.</h2>
          </div>
          <div className="flex basis-1/2 flex-col items-center">
            <div className="flex-1 flex-row gap-4 rounded-lg bg-slate-800 p-4">
              <div className="flex h-full w-full flex-col gap-4">
                <div className="flex w-[768px] flex-row gap-2 rounded-md border-2 border-slate-700 p-2">
                  <div className="flex h-full">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="https://cdn.discordapp.com/avatars/460083959720706048/72e6aa5994b69e83dfc9186aa21e1f40" />
                      <AvatarFallback></AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex flex-row gap-2">
                      <h1 className="text-xl font-bold text-white">warfarm</h1>
                      <h2 className="text-xl font-normal text-slate-400">2h</h2>
                    </div>

                    <p className="text-lg font-normal text-white">
                      Excited to share a milestone in my game development journey!
                      <br />
                      <br />
                      Our indie Roblox game recently crossed some incredible benchmarks:
                      <br />
                      <br />
                      - R$1M+ in revenue generated
                      <br />
                      - 25M+ total visits
                      <br />
                      - ~10,000 peak concurrent players
                      <br />
                      This achievement would not have been possible without my talented co-developer, who laid the
                      foundation for our success.
                    </p>

                    <Carousel className="my-2">
                      <CarouselContent>
                        <CarouselItem className="basis-2/3">
                          <Image className="rounded-xl" src={thum1} alt="" />
                        </CarouselItem>
                        <CarouselItem className="basis-2/3">
                          <Image className="rounded-xl" src={thum2} alt="" />
                        </CarouselItem>
                        <CarouselItem className="basis-2/3">
                          <Image className="rounded-xl" src={thum3} alt="" />
                        </CarouselItem>
                      </CarouselContent>
                    </Carousel>
                  </div>
                </div>
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
      </div>
    </main>
  );
}
