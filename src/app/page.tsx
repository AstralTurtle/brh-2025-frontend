"use client";

import { Post } from "@/components/Post";
import Image from "next/image";
import feedback from "../../public/feedback.svg";
import groups from "../../public/groups.svg";
import share from "../../public/share.svg";
import NavBar from "@/components/NavigationBar";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationFrameRef = useRef<number>();

  // Auto-scroll functionality
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollSpeed = 3; // pixels per frame
    let lastTime = 0;

    const autoScroll = (currentTime: number) => {
      if (!isPaused && container) {
        // Only scroll if enough time has passed (throttle to ~60fps)
        if (currentTime - lastTime >= 16) {
          const maxScrollTop = container.scrollHeight - container.clientHeight;

          if (container.scrollTop >= maxScrollTop) {
            // Reset to top for infinite loop
            container.scrollTop = 0;
          } else {
            // Scroll down smoothly
            container.scrollTop += scrollSpeed;
          }
          lastTime = currentTime;
        }
      }

      // Continue the animation loop
      animationFrameRef.current = requestAnimationFrame(autoScroll);
    };

    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(autoScroll);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused]);

  // Prevent manual scrolling
  const handleScroll = (e: React.UIEvent) => {
    e.preventDefault();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent arrow keys, page up/down, home/end from scrolling
    if (
      [
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
      ].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  // Handle pause/resume with better state management
  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  // Duplicate posts for seamless looping
  const posts = [
    {
      username: "Team Cherry",
      avatar:
        "https://cdn.discordapp.com/attachments/1418773209951633512/1419251608851709992/6dd64832e621ff348935216b4d4bd993587f783c_full.png?ex=68d1148f&is=68cfc30f&hm=a9c6ed2cc3c8e64ad860fb03d57216afaa5bfd90ff1260a18aba5f9dee4f93ea&",
      date: new Date(),
      message:
        "We're excited to announce that Hollow Knight: Silksong is coming soon! Explore a vast, new kingdom filled with challenging enemies, intricate platforming, and a captivating story. Stay tuned for more updates!",
      media: [
        "https://cdn.discordapp.com/attachments/1418773209951633512/1419253774932902020/latest.png?ex=68d11694&is=68cfc514&hm=d907cb6d8c0d28db13a90bd67995a373c8ccbed4468973a49f1dc877373f154e&",
        "https://cdn.discordapp.com/attachments/1418773209951633512/1419251961366057091/header.png?ex=68d114e4&is=68cfc364&hm=1dc6fcb9c53d88401c0dcdfe9975e865d5b0afde924461de1caa996e484e42ea&",
        "https://cdn.discordapp.com/attachments/1418773209951633512/1419255227537952808/hqdefault.png?ex=68d117ee&is=68cfc66e&hm=99b20df9c132168f80b48df6ffbd815a683f038335aac505827882309c2373c8&",
      ],
    },
    {
      username: "astralturtle",
      avatar:
        "https://cdn.discordapp.com/avatars/196269131144626176/4ece9a42ad4fc33ae1dd6fad18d0bb7e",
      date: new Date(),
      message:
        "Anyone want to do **Pirate Jam** together? Looking for teammates with Godot experience and music expertise. Let's make something amazing!\n```py\ndef findTeammates(devs):\n\treturn [dev for dev in devs if 'godot' in dev.skills]\n```",
      media: [],
    },
    {
      username: "GameDevStudio",
      avatar:
        "https://cdn.discordapp.com/attachments/1418773209951633512/1419262550461120583/Pixel_Art.png?ex=68d11ec0&is=68cfcd40&hm=b78ca091516a1442c06d6d5360d6eaf9d96539667f58392f7727b6968ee44e34&",
      date: new Date(),
      message:
        "Just released our latest indie platformer! \n\nThanks to everyone who provided feedback during development.  Your input was invaluable! \n\nCheck it out [here](https://www.store.steampowered.com)",
      media: ["https://cdn.discordapp.com/attachments/1418773209951633512/1419262550461120583/Pixel_Art.png?ex=68d11ec0&is=68cfcd40&hm=b78ca091516a1442c06d6d5360d6eaf9d96539667f58392f7727b6968ee44e34&"],
    },
    {
      username: "PixelArtist",
      avatar:
        "https://cdn.discordapp.com/avatars/196269131144626176/4ece9a42ad4fc33ae1dd6fad18d0bb7e",
      date: new Date(),
      message:
        "Working on some character sprites for my upcoming RPG. What do you think of this animation cycle?",
      media: [],
    },
    {
      username: "IndieGameDev",
      avatar:
        "https://cdn.discordapp.com/avatars/196269131144626176/4ece9a42ad4fc33ae1dd6fad18d0bb7e",
      date: new Date(),
      message:
        "Finally figured out that tricky physics bug! Sometimes you just need to step away and come back with fresh eyes.",
      media: [],
    },
    {
      username: "MusicComposer",
      avatar:
        "https://cdn.discordapp.com/avatars/196269131144626176/4ece9a42ad4fc33ae1dd6fad18d0bb7e",
      date: new Date(),
      message:
        "Composing the soundtrack for a space exploration game. Here's a preview of the main theme!",
      media: [],
    },
  ];

  // Create duplicated posts for seamless looping
  const duplicatedPosts = [...posts, ...posts];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-violet-600 to-indigo-600">
      <NavBar></NavBar>

      <div className="flex flex-row gap-12 p-12 grow">
        <div className="basis-2/3">
          <div className="flex flex-col text-white gap-12">
            <h2 className="text-balance text-9xl font-extrabold text-white">
              Level up your game.
            </h2>

            <div className="flex flex-row gap-4">
              <div className="flex basis-1/3 flex-col gap-4 rounded-lg bg-zinc-900 p-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-md bg-zinc-800 p-4">
                  <Image
                    className="h-full w-full fill-white"
                    src={groups}
                    alt=""
                  />
                </div>
                <h3 className="text-balance text-5xl font-bold">
                  Meet your team.
                </h3>
                <p className="text-2xl">
                  Connect with like-minded game devs, designers, and artists.
                </p>
              </div>
              <div className="flex basis-1/3 flex-col gap-4 rounded-lg bg-zinc-900 p-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-md bg-zinc-800 p-4">
                  <Image
                    className="h-full w-full fill-white"
                    src={feedback}
                    alt=""
                  />
                </div>
                <h3 className="text-balance text-5xl font-bold">
                  Build your project.
                </h3>
                <p className="text-2xl">
                  Turn your ideas into reality. Leverage insightful feedback from
                  creators and AI.
                </p>
              </div>
              <div className="flex basis-1/3 flex-col gap-4 rounded-lg bg-zinc-900 p-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-md bg-zinc-800 p-4">
                  <Image
                    className="h-full w-full fill-white"
                    src={share}
                    alt=""
                  />
                </div>
                <h3 className="text-balance text-5xl font-bold">
                  Share your vision.
                </h3>
                <p className="text-2xl">
                  Meet your players where they are. Your posts will reach any
                  ActivityPub platform.
                </p>
              </div>
            </div>

            <div className="flex flex-row gap-8">
              <a
                className="rounded-full bg-white py-4 px-8 text-3xl font-semibold text-black"
                href="/auth/sign-up"
              >
                New Game
              </a>
              <a
                className="rounded-full bg-white py-4 px-8 text-3xl font-semibold text-black"
                href="/auth/sign-up"
              >
                Load Game
              </a>
            </div>
          </div>
        </div>

        <div className="basis-1/3">
          <div
            ref={scrollContainerRef}
            className="flex flex-col gap-4 overflow-hidden rounded-lg bg-slate-800 p-4 h-full max-h-[800px] pointer-events-none"
            onScroll={handleScroll}
            onWheel={handleWheel}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              userSelect: "none",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="pointer-events-auto">
              {duplicatedPosts.map((post, index) => (
                <div key={`${post.username}-${index}`} className="mb-4">
                  <Post
                    username={post.username}
                    avatar={post.avatar}
                    date={post.date}
                    message={post.message}
                    media={post.media}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
