import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import { Button } from "./ui/button";
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";

export function Post(props: {
  id?: string;
  username: string;
  avatar: string;
  date: Date;
  message: string;
  media?: string[]
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (props.id) {
      // Fetch like count when component mounts
      apiService.getPostLikes(props.id)
        .then(data => {
          setLikeCount(data.likes?.length || 0);
        })
        .catch(err => console.error('Error fetching likes:', err));
    }
  }, [props.id]);

  const handleLike = async () => {
    if (!props.id || isLiking) return;

    setIsLiking(true);
    try {
      await apiService.likePost(props.id);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="flex w-full flex-row gap-2 rounded-md border-2 border-slate-700 p-4 bg-zinc-800">
      <div className="flex h-full">
        <Avatar className="h-16 w-16">
          <AvatarImage src={props.avatar} />
          <AvatarFallback className="bg-violet-600 text-white">
            {props.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-row gap-2 mb-2">
          <h1 className="text-xl font-bold text-white">{props.username}</h1>
          <h2 className="text-xl font-normal text-slate-400">
            {props.date.toLocaleDateString()}
          </h2>
        </div>

        <p className="text-lg font-normal text-white mb-3">{props.message}</p>

        {props.media && props.media.length > 0 && (
          <Carousel className="my-2">
            <CarouselContent>
              {props.media.map((url: string, i: number) => (
                <CarouselItem className="basis-2/3 bg-red-200 h-96" key={i}>
                  <Image className="rounded-xl" src={url} alt="" fill={true} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}

        {/* Post Actions */}
        <div className="flex gap-4 mt-3 pt-3 border-t border-zinc-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={`text-zinc-400 hover:text-red-400 hover:bg-zinc-700 ${isLiked ? 'text-red-500' : ''
              }`}
          >
            <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
            {likeCount > 0 && <span className="ml-1">{likeCount}</span>}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-blue-400 hover:bg-zinc-700"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-green-400 hover:bg-zinc-700"
          >
            <Repeat2 className="w-4 h-4 mr-1" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-purple-400 hover:bg-zinc-700"
          >
            <Share className="w-4 h-4 mr-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
