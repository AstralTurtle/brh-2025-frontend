import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { getDiceBearAvatar } from "@/lib/utils";
import { Post } from "./Post";

interface ProfileData {
  username?: string;
  display_name?: string;
  preferredUsername?: string; // ActivityPub format
  name?: string; // ActivityPub format
  summary?: string;
  icon?: string;
  id?: string; // ActivityPub ID to extract host
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
}

interface UserPost {
  id: string;
  content: string;
  published: string;
  attributedTo: string;
  attachment: string[];
}

export function Profile(props: { username?: string }) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<ProfileData | null>(null);

  // Helper function to extract host from ActivityPub ID
  const extractHost = (id: string): string => {
    try {
      const url = new URL(id);
      return url.hostname;
    } catch {
      return 'unknown';
    }
  };

  // Helper function to get the actual username from the data
  const getUsername = (data: ProfileData): string => {
    return data.preferredUsername || data.username || 'unknown';
  };

  // Helper function to get the display name from the data
  const getDisplayName = (data: ProfileData): string => {
    return data.name || data.display_name || data.preferredUsername || data.username || 'Unknown User';
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        let data;
        let currentUser = null;

        if (props.username) {
          // Fetch specific user profile
          data = await apiService.getUser(props.username);

          // Also get current user to check follow status
          try {
            console.log('Attempting to fetch current user...');
            currentUser = await apiService.getCurrentUser();
            console.log('Current user data:', currentUser);
            setCurrentUserData(currentUser);

            // Check if current user is following this user
            if (currentUser && (currentUser.preferredUsername !== props.username && currentUser.username !== props.username)) {
              console.log('Checking follow status between:', currentUser.preferredUsername || currentUser.username, 'and', props.username);
              try {
                const followStatus = await apiService.checkFollowStatus(
                  currentUser.preferredUsername || currentUser.username || '',
                  props.username
                );
                console.log('Follow status response:', followStatus);
                setIsFollowing(followStatus.isFollowing || false);
              } catch (followError) {
                console.warn('Could not check follow status:', followError);
                setIsFollowing(false);
              }
            }
          } catch (error) {
            console.error('Error fetching current user:', error);
            console.log('Setting currentUserData to null due to error');

            // Check if we have a JWT token in cookies to determine if user might be logged in
            const hasToken = document.cookie.includes('jwt=');
            console.log('Has JWT token in cookies:', hasToken);

            if (hasToken) {
              // User has a token but API call failed - might be expired or invalid
              console.log('User appears to have a token but API call failed - token might be expired');
              // Set a minimal user data to show follow button but indicate auth issues
              setCurrentUserData({ username: 'authenticated_user' } as ProfileData);
            } else {
              // No token - user is definitely not logged in
              setCurrentUserData(null);
            }
          }
        } else {
          // Fetch current user profile
          data = await apiService.getCurrentUser();
          setCurrentUserData(data);
          setIsCurrentUser(true);
        }

        console.log('Profile API response:', data);
        console.log('Username:', getUsername(data));
        console.log('Display name:', getDisplayName(data));

        setProfileData(data);

        // Load user posts
        if (data) {
          loadUserPosts(getUsername(data));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [props.username]);

  const loadUserPosts = async (username: string) => {
    setPostsLoading(true);
    try {
      const postsResponse = await apiService.getUserPosts(username);
      setUserPosts(postsResponse.posts || []);
    } catch (error) {
      console.error('Error loading user posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!props.username || !currentUserData) return;

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await apiService.unfollowUser(props.username);
        setIsFollowing(false);
      } else {
        await apiService.followUser(props.username);
        setIsFollowing(true);
      }

      // Refresh profile data to update follower counts
      const updatedProfile = await apiService.getUser(props.username);
      setProfileData(updatedProfile);
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full p-6 bg-zinc-800 border-zinc-700">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-zinc-700 rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-zinc-700 rounded w-32 animate-pulse"></div>
            <div className="h-3 bg-zinc-700 rounded w-24 animate-pulse"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!profileData) {
    return (
      <Card className="w-full p-6 bg-zinc-800 border-zinc-700">
        <div className="text-white">Profile not found</div>
      </Card>
    );
  }

  const username = getUsername(profileData);
  const displayName = getDisplayName(profileData);
  const host = profileData.id ? extractHost(profileData.id) : 'localhost';
  const avatarUrl = profileData.icon || getDiceBearAvatar(username);

  return (
    <div className="space-y-6">
      <Card className="w-full p-6 bg-zinc-800 border-zinc-700">
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-violet-600 text-white text-xl">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-xl font-bold text-white">
                {displayName}
              </h2>
              <p className="text-zinc-400">@{username}@{host}</p>
            </div>

            {profileData.summary && (
              <p className="text-white">{profileData.summary}</p>
            )}

            <div className="flex space-x-6 text-sm">
              <div className="text-zinc-300">
                <span className="font-bold text-white">{profileData.posts_count || userPosts.length}</span> Posts
              </div>
              <div className="text-zinc-300">
                <span className="font-bold text-white">{profileData.followers_count || 0}</span> Followers
              </div>
              <div className="text-zinc-300">
                <span className="font-bold text-white">{profileData.following_count || 0}</span> Following
              </div>
            </div>

            {!isCurrentUser && (
              <div className="pt-3">
                {currentUserData ? (
                  <Button
                    onClick={handleFollowToggle}
                    disabled={isFollowLoading}
                    className={isFollowing
                      ? "bg-zinc-600 hover:bg-zinc-700 text-white"
                      : "bg-violet-600 hover:bg-violet-700 text-white"
                    }
                  >
                    {isFollowLoading ? "Loading..." : isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => window.location.href = '/auth/sign-in'}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    Sign in to Follow
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* User Posts Section */}
      <Card className="w-full p-6 bg-zinc-800 border-zinc-700">
        <h3 className="text-lg font-bold text-white mb-4">Posts</h3>
        {postsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-zinc-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-700 rounded w-1/4"></div>
                    <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
                    <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : userPosts.length === 0 ? (
          <p className="text-zinc-400 text-center py-8">No posts yet</p>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <Post
                key={post.id}
                id={post.id}
                username={post.attributedTo}
                avatar=""
                date={new Date(post.published)}
                message={post.content}
                media={post.attachment || []}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
