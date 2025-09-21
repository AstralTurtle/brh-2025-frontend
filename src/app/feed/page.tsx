"use client";

import { Post } from "@/components/Post";
import { CreatePost } from "@/components/CreatePost";
import { Profile } from "@/components/Profile";
import { Button } from "@/components/ui/button";
import { apiService } from "@/lib/api";
import { useEffect, useState, useRef, useCallback } from "react";

export type ActivityPubNote = {
  id: string;
  type: 'Note';
  content: string;
  published: string;
  attributedTo: string;
  to: string[];
  cc: string[];
  tag: unknown[];
  attachment: string[];
  '@context': string[];
};

export type Post = {
  id: string;
  username: string;
  avatar: string;
  date: Date;
  message: string;
  media: string[];
}

export default function Page({ params }: { params: { slug: string } }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver>();

  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const fetchPosts = async (pageNum: number = 1, isNewPost: boolean = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await apiService.getPosts(pageNum, 10);
      const data: ActivityPubNote[] = response.posts;

      if (!data || data.length === 0) {
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      // Sort posts by published date (newest first)
      const sortedData = [...data].sort((a, b) =>
        new Date(b.published).getTime() - new Date(a.published).getTime()
      );

      const arr: Post[] = sortedData.map((v: ActivityPubNote) => ({
        id: v.id,
        username: v.attributedTo,
        avatar: "",
        message: v.content,
        media: v.attachment || [],
        date: new Date(v.published)
      }));

      if (pageNum === 1 || isNewPost) {
        setPosts(arr);
      } else {
        // When appending more posts, we need to merge and sort the entire list
        setPosts(prevPosts => {
          const allPosts = [...prevPosts, ...arr];
          return allPosts.sort((a, b) => b.date.getTime() - a.date.getTime());
        });
      }

      setHasMore(data.length === 10);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostCreated = () => {
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  useEffect(() => {
    fetchPosts(1);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-violet-600 to-indigo-600">
        <div className="flex h-24 w-full items-center bg-transparent">
          <h1 className="mx-12 text-3xl font-bold italic text-white">Frame One</h1>
        </div>
        <div className="flex w-full flex-1 flex-col items-center p-4">
          <div className="flex flex-1 flex-col gap-4 rounded-xl bg-zinc-900 p-4 max-w-2xl w-full">
            <CreatePost onPostCreated={handlePostCreated} />

            {posts.map((v, i) => {
              if (posts.length === i + 1) {
                return (
                  <div ref={lastPostElementRef} key={v.id}>
                    <Post
                      id={v.id}
                      username={v.username}
                      avatar={v.avatar}
                      date={v.date}
                      message={v.message}
                      media={v.media}
                    />
                  </div>
                );
              } else {
                return (
                  <Post
                    key={v.id}
                    id={v.id}
                    username={v.username}
                    avatar={v.avatar}
                    date={v.date}
                    message={v.message}
                    media={v.media}
                  />
                );
              }
            })}

            {isLoading && (
              <div className="flex justify-center items-center p-8">
                <div className="text-white">Loading more posts...</div>
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="flex justify-center items-center p-8">
                <div className="text-zinc-400">You've reached the end of the feed</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
