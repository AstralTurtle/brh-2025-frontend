"use client";

import { Post } from "@/components/Post";
import Image from "next/image";
import feedback from "../../public/feedback.svg";
import groups from "../../public/groups.svg";
import share from "../../public/share.svg";
import NavBar from "@/components/NavigationBar";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)            // NEW: wrapper for duplicated content
  const singleSetHeightRef = useRef(0)                     // NEW: height of one copy
  const [isPaused, setIsPaused] = useState(false)
  const animationFrameRef = useRef<number>()

  // Measure height of a single set (handles image loads and responsive layout)
  useEffect(() => {
    const inner = innerRef.current
    if (!inner) return

    const measure = () => {
      // We render two copies; one set is half the full height
      singleSetHeightRef.current = inner.scrollHeight / 2
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(inner)

    return () => {
      ro.disconnect()
    }
  }, [])
  
  // Auto-scroll with seamless loop (no snap)
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Ensure no smooth animation on programmatic jumps
    container.style.scrollBehavior = "auto"

    const scrollSpeed = 3 // px per frame
    let lastTime = 0

    const tick = (t: number) => {
      if (!isPaused && container) {
        if (t - lastTime >= 16) {
          const setH = singleSetHeightRef.current
          if (setH > 0) {
            // When past one set, jump back by exactly one set height
            if (container.scrollTop >= setH) {
              container.scrollTop -= setH
            } else {
              container.scrollTop += scrollSpeed
            }
          }
          lastTime = t
        }
      }
      animationFrameRef.current = requestAnimationFrame(tick)
    }

    animationFrameRef.current = requestAnimationFrame(tick)
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [isPaused])

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
        "# Release soon! \nWe're excited to announce that Hollow Knight: Silksong is **coming soon**! \n\nExplore a vast, new kingdom filled with challenging enemies, intricate platforming, and a captivating story. \n\nStay tuned for more updates!",
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
        "Anyone want to do **Pirate Jam** together? \n\nLooking for teammates with *Godot experience* and *music expertise*. Let's make something amazing!\n```py\ndef findTeammates(devs):\n\treturn [dev for dev in devs if 'godot' in dev.skills]\n```",
      media: [],
    },
    {
      username: "LunarPixelAdventures",
      avatar:
        "https://cdn.discordapp.com/attachments/1418773209951633512/1419262550461120583/Pixel_Art.png?ex=68d11ec0&is=68cfcd40&hm=b78ca091516a1442c06d6d5360d6eaf9d96539667f58392f7727b6968ee44e34&",
      date: new Date(),
      message:
        "## Just released our latest indie platformer! \n\nThanks to everyone who provided feedback during development. Your input was invaluable! \n\nCheck it out [here](https://www.store.steampowered.com)",
      media: ["https://cdn.discordapp.com/attachments/1418773209951633512/1419262550461120583/Pixel_Art.png?ex=68d11ec0&is=68cfcd40&hm=b78ca091516a1442c06d6d5360d6eaf9d96539667f58392f7727b6968ee44e34&"],
    },
    {
      username: "Physics.Fiendd",
      avatar:
        "https://cdn.discordapp.com/attachments/1418773209951633512/1419272326507401266/07c1267fd52a140ef7d7e8184832eb38.png?ex=68d127db&is=68cfd65b&hm=7d8f19b2d564efa34c43b95d5d709727464040a371881e02d192faaec08440e5&",
      date: new Date(),
      message:
        "Finally figured out that tricky physics bug! \nMy characters no longer clip through walls! \n\nSometimes you just need to step away and come back with fresh eyes👀",
      media: [],
    },
    {
      username: "PixelArtist",
      avatar:
        "https://cdn.discordapp.com/attachments/1418773209951633512/1419271835387957298/pixel-art-cat-260nw-1343317838.png?ex=68d12766&is=68cfd5e6&hm=9b5cc11649dc4892b33c51c3ad9d01391104f6b887e7bab5fb9e7ebabb4444f5&",
      date: new Date(),
      message:
        "Working on some scenes for my upcoming RPG. \n\nWhat do you think of this scene?\n\n**#indiedev #pixelart**",
      media: ["https://cdn.discordapp.com/attachments/1418773209951633512/1419271541669101630/Killer-Rabbit-Solarpunk-pixel-art-feature-image.png?ex=68d12720&is=68cfd5a0&hm=6f2fe87d8e09165d18933d030e53e3ad4208004bdd2d316ab1e846940e52c315&"],
    },
    {
      username: "iLove_Otamatones",
      avatar:
        "https://cdn.discordapp.com/attachments/1418773209951633512/1419272982152482832/4392-otamatone-kirby-version-musical-toy-1.png?ex=68d12877&is=68cfd6f7&hm=f7ef92106e9c5fca2b2dd5f567fd2337835d905f570d601442b9b51ae7584a2d&",
      date: new Date(),
      message:
        "Composing the soundtrack for a space exploration game. \n\nHere's a preview of the main theme! \n[SoundCloud Link](https://soundcloud.com)",
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
            className="flex flex-col gap-4 overflow-hidden rounded-lg bg-slate-800 p-4 h-full max-h-[800px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div ref={innerRef}>
              {/* Render two copies for seamless loop */}
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
              {/* Duplicate the same list again immediately after */}
              {duplicatedPosts.map((post, index) => (
                <div key={`${post.username}-${index}-dup`} className="mb-4">
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
