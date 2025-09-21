import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import { Button } from "./ui/button";
import { Heart, MessageCircle, Repeat2, Share, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { getDiceBearAvatar } from "@/lib/utils";
import { ReplyComponent } from "./ReplyComponent";

interface Reply {
  id: string;
  username: string;
  content: string;
  published: string;
  icon?: string;
}

export function Post(props: {
  id?: string;
  username: string;
  avatar: string;
  date: Date;
  message: string;
  media?: string[];
  isReply?: boolean;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyCount, setReplyCount] = useState(0);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  // Extract username from ActivityPub ID or use as-is
  const extractUsername = (attributedTo: string): string => {
    if (attributedTo.includes('/users/')) {
      return attributedTo.split('/users/')[1] || attributedTo;
    }
    return attributedTo;
  };

  const displayUsername = extractUsername(props.username);
  const avatarUrl = props.avatar || getDiceBearAvatar(displayUsername);

  useEffect(() => {
    if (props.id) {
      // Fetch like count
      apiService.getPostLikes(props.id)
        .then(data => {
          setLikeCount(data.likes?.length || 0);
        })
        .catch(err => console.error('Error fetching likes:', err));

      // Fetch reply count
      fetchReplies();
    }
  }, [props.id]);

  const fetchReplies = async () => {
    if (!props.id) return;

    try {
      const response = await apiService.getReplies(props.id);
      const replyData = response.posts || [];

      const formattedReplies = replyData.map((reply: any) => ({
        id: reply.id,
        username: extractUsername(reply.attributedTo),
        content: reply.content,
        published: reply.published,
        icon: reply.icon
      }));

      setReplies(formattedReplies);
      setReplyCount(formattedReplies.length);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

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

  const handleReplyCreated = () => {
    setShowReplyBox(false);
    fetchReplies();
    if (!showReplies) {
      setShowReplies(true);
    }
  };

  const toggleReplies = async () => {
    if (!showReplies && replies.length === 0) {
      setIsLoadingReplies(true);
      await fetchReplies();
      setIsLoadingReplies(false);
    }
    setShowReplies(!showReplies);
  };

  return (
    <div className={`w-full ${props.isReply ? 'ml-8 border-l-2 border-zinc-600 pl-4' : ''}`}>
      <div className="flex w-full flex-row gap-2 rounded-md border-2 border-slate-700 p-4 bg-zinc-800">
        <div className="flex h-full">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-violet-600 text-white">
              {displayUsername.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex flex-row gap-2 mb-2">
            <h1 className="text-xl font-bold text-white">{displayUsername}</h1>
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
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="text-zinc-400 hover:text-blue-400 hover:bg-zinc-700"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {replyCount > 0 && <span className="ml-1">{replyCount}</span>}
            </Button>

            {replyCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleReplies}
                disabled={isLoadingReplies}
                className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
              >
                {showReplies ? (
                  <><ChevronUp className="w-4 h-4 mr-1" />Hide replies</>
                ) : (
                  <><ChevronDown className="w-4 h-4 mr-1" />Show replies ({replyCount})</>
                )}
              </Button>
            )}

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

      {/* Reply Input */}
      {showReplyBox && props.id && (
        <ReplyComponent
          postId={props.id}
          onReplyCreated={handleReplyCreated}
          onCancel={() => setShowReplyBox(false)}
        />
      )}

      {/* Replies */}
      {showReplies && replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {replies.map((reply) => (
            <div key={reply.id} className="ml-8 border-l-2 border-violet-500 pl-4">
              <div className="flex gap-2 p-3 bg-zinc-700 rounded border border-zinc-600">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={reply.icon || getDiceBearAvatar(reply.username)} />
                  <AvatarFallback className="bg-violet-600 text-white text-sm">
                    {reply.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex gap-2 items-center mb-1">
                    <span className="text-sm font-bold text-white">{reply.username}</span>
                    <span className="text-xs text-zinc-400">
                      {new Date(reply.published).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-white">{reply.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
