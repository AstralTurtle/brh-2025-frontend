"use client";

import { Post } from "@/components/Post";
import { Profile } from "@/components/Profile";
import axios from "axios";
import { useEffect, useState } from "react";

export type ActivityPubNote = {
  id: string;
  type: 'Note';
  content: string;
  published: string; // ISO 8601 date-time string
  attributedTo: string;
  to: string[];
  cc: string[];
  tag: unknown[];
  attachment: string[];
  '@context': string[];
};

export type Post = {
    username: string,
    avatar: string,
    date: Date,
    message: string,
    media: string[]
}

export default function Page({ params }: { params: { slug: string } }) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        const response = await axios.get("http://127.0.0.1:8000/posts/");
        const data: ActivityPubNote[] = response.data.posts;
        const arr: Post[] = [];

        console.log(data);

        data.forEach(async (v: ActivityPubNote)=>{
            const user_id = v.attributedTo;
            const message = v.content;
            const attachment: string[] = v.attachment;
            const date = new Date(v.published);
            
            arr.push({
                username: user_id,
                avatar: "",
                message: message,
                media: attachment,
                date: date
            })

        })

        console.log(arr);
        setPosts(arr);
    };

    fetchData();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-violet-600 to-indigo-600">
        <div className="flex h-24 w-full items-center bg-transparent">
          <h1 className="mx-12 text-3xl font-bold italic text-white">frame one</h1>
        </div>
        <div className="flex w-full flex-1 flex-col items-center p-4">
          <div className="flex flex-1 flex-col gap-4 rounded-xl bg-zinc-900 p-4">
            {
                posts.map((v, i)=> {
                    return (
                    <Post key={i} username={v.username} avatar={v.avatar} date={v.date} message={v.message} media={v.media}></Post>);
                })
            }
          </div>
        </div>
      </div>
    </main>
  );
}
