"use client";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import { Button } from "./ui/button";
import { Heart, MessageCircle, Repeat2, Share, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { getDiceBearAvatar, getCookie } from "@/lib/utils";
import { ReplyComponent } from "./ReplyComponent";
import parse from "html-react-parser";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Reply {
  id: string;
  username: string;
  content: string;
  published: string;
  icon?: string;
  isOptimistic?: boolean; // Add flag to track optimistic replies
}

// Markdown component with styling
function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headings
        h1: (props) => <h1 className="text-xl font-bold my-3 text-white" {...props} />,
        h2: (props) => <h2 className="text-lg font-bold my-2 text-white" {...props} />,
        h3: (props) => <h3 className="text-base font-semibold my-2 text-white" {...props} />,
        h4: (props) => <h4 className="text-sm font-semibold my-2 text-white" {...props} />,
        h5: (props) => <h5 className="text-sm font-medium my-1 text-white" {...props} />,
        h6: (props) => <h6 className="text-xs font-medium my-1 text-white" {...props} />,


        // Paragraphs and text
        p: (props) => <p className="my-2 leading-relaxed text-zinc-300" {...props} />,
        strong: (props) => <strong className="font-bold text-white" {...props} />,
        em: (props) => <em className="italic text-zinc-200" {...props} />,


        // Lists
        ul: (props) => <ul className="list-disc pl-6 my-2 space-y-1 text-zinc-300" {...props} />,
        ol: (props) => <ol className="list-decimal pl-6 my-2 space-y-1 text-zinc-300" {...props} />,
        li: (props) => <li className="leading-relaxed" {...props} />,


        // Quotes and horizontal rules
        blockquote: (props) => (
          <blockquote className="border-l-4 border-zinc-600 pl-4 italic text-zinc-400 my-3 bg-zinc-800/30 py-2 rounded-r" {...props} />
        ),
        hr: (props) => <hr className="border-zinc-600 my-4" {...props} />,


        // Links
        a: ({ href, children, ...props }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline transition-colors"
            {...props}
          >
            {children}
          </a>
        ),


        // Tables
        table: (props) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse border border-zinc-600" {...props} />
          </div>
        ),
        thead: (props) => <thead className="bg-zinc-700" {...props} />,
        th: (props) => <th className="border border-zinc-600 px-3 py-2 text-left font-semibold text-white" {...props} />,
        td: (props) => <td className="border border-zinc-600 px-3 py-2 text-zinc-300" {...props} />,


        // Code blocks and inline code
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");

          if (!inline) {
            return (
              <div className="my-3">
                <SyntaxHighlighter
                  style={oneDark}
                  language={match?.[1] || "text"}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: 8,
                    fontSize: "0.875rem",
                    backgroundColor: "#1f2937"
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            );
          }

          return (
            <code className="bg-zinc-700 text-zinc-200 rounded px-1.5 py-0.5 font-mono text-sm" {...props}>
              {children}
            </code>
          );
        },


        // Custom styling for better dark theme integration
        del: (props) => <del className="line-through text-zinc-500" {...props} />,
        mark: (props) => <mark className="bg-yellow-600 text-black px-1 rounded" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function Post(props: {
  id?: string;
  username: string;
  avatar: string;
  date: Date;
  message: string;
  embed?: string;
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
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    // Get current user for optimistic updates
    const fetchCurrentUser = async () => {
      try {
        if (getCookie('jwt')) {
          const userData = await apiService.getCurrentUser();
          setCurrentUser(extractUsername(userData.id || userData.username));
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();

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
        icon: reply.icon,
        isOptimistic: false
      }));

      // Remove optimistic replies and replace with real ones
      setReplies(prev => {
        // Keep only non-optimistic replies, then add the new real replies
        const nonOptimistic = prev.filter(r => !r.isOptimistic);
        return [...nonOptimistic, ...formattedReplies];
      });

      setReplyCount(formattedReplies.length);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleLike = async () => {
    if (!props.id || isLiking) return;

    // Optimistic update - update UI immediately
    const wasLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);
    setIsLiking(true);

    try {
      await apiService.likePost(props.id);
      // Success - optimistic update was correct, no need to change anything
    } catch (error) {
      console.error('Error liking post:', error);
      // Rollback optimistic update on error
      setIsLiked(wasLiked);
      setLikeCount(previousCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleReplyCreated = async (replyContent?: string) => {
    // Optimistic update - increment reply count immediately
    setReplyCount(prev => prev + 1);
    setShowReplyBox(false);

    // Add optimistic reply to the replies array if content is provided
    if (replyContent && currentUser) {
      const optimisticReply: Reply = {
        id: `optimistic-${Date.now()}`, // Temporary ID
        username: currentUser,
        content: replyContent,
        published: new Date().toISOString(),
        icon: undefined,
        isOptimistic: true // Mark as optimistic
      };

      setReplies(prev => [...prev, optimisticReply]);
    }

    // Show replies section if it wasn't already visible
    if (!showReplies) {
      setShowReplies(true);
    }

    // Delay the server sync slightly to let the optimistic update show
    setTimeout(() => {
      fetchReplies();
    }, 500);
  };

  const toggleReplies = async () => {
    if (!showReplies && replies.length === 0) {
      setIsLoadingReplies(true);
      await fetchReplies();
      setIsLoadingReplies(false);
    }
    setShowReplies(!showReplies);
  };

  const nextImage = () => {
    if (props.media && props.media.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % props.media.length);
    }
  };

  const prevImage = () => {
    if (props.media && props.media.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + props.media.length) % props.media.length);
    }
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

          {/* Message content with markdown support */}
          <div className="whitespace-pre-line mb-3 break-words">
            <MarkdownContent content={props.message} />
          </div>

          {props.embed ? parse(props.embed) : <></>}

          {props.media && props.media.length > 0 && (
            <div className="relative my-2">
              <div className="overflow-hidden rounded-xl">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                >
                  {props.media.map((url: string, i: number) => (
                    <div key={i} className="w-full flex-shrink-0">
                      <div className="relative h-96">
                        <Image
                          className="object-cover w-full h-full"
                          src={url}
                          alt={`Media ${i + 1}`}
                          fill={true}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation buttons (only show if more than 1 image) */}
              {props.media.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    aria-label="Previous image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    aria-label="Next image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Dots indicator */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {props.media.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        aria-label={`Go to image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
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
