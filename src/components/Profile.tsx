import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";

interface ProfileData {
  username: string;
  display_name: string;
  summary: string;
  icon?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
}

export function Profile(props: { username?: string }) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        let data;
        if (props.username) {
          // Fetch specific user profile
          data = await apiService.getUser(props.username);
        } else {
          // Fetch current user profile
          data = await apiService.getCurrentUser();
          setIsCurrentUser(true);
        }
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [props.username]);

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

  return (
    <Card className="w-full p-6 bg-zinc-800 border-zinc-700">
      <div className="flex items-start space-x-4">
        <Avatar className="w-16 h-16">
          {profileData.icon && <AvatarImage src={profileData.icon} />}
          <AvatarFallback className="bg-violet-600 text-white text-xl">
            {profileData.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <div>
            <h2 className="text-xl font-bold text-white">
              {profileData.display_name || profileData.username}
            </h2>
            <p className="text-zinc-400">@{profileData.username}</p>
          </div>

          {profileData.summary && (
            <p className="text-white">{profileData.summary}</p>
          )}

          <div className="flex space-x-6 text-sm">
            <div className="text-zinc-300">
              <span className="font-bold text-white">{profileData.posts_count || 0}</span> Posts
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
              <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                Follow
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
