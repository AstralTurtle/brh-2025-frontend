import axios from 'axios';
import { getCookie } from './utils';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Get authorization headers with JWT token
const getAuthHeaders = () => {
    const token = getCookie('jwt');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Extract UUID from ActivityPub post URI
const extractPostUuid = (postId: string): string => {
    // If it's already a UUID format, return as-is
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId)) {
        return postId;
    }

    // Extract UUID from URI (e.g., "https://example.com/posts/uuid" -> "uuid")
    const parts = postId.split('/');
    const lastPart = parts[parts.length - 1];

    // Return the last part which should be the UUID
    return lastPart;
};

export const apiService = {
    // User endpoints
    async getCurrentUser() {
        const response = await axios.get(`${API_BASE_URL}/users/me`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    async getUser(username: string) {
        const response = await axios.get(`${API_BASE_URL}/users/${username}`);
        return response.data;
    },

    // Utility function to get display name for a username
    async getDisplayName(username: string): Promise<string> {
        try {
            const userData = await this.getUser(username);
            return userData.display_name || userData.username || username;
        } catch (error) {
            console.error('Error fetching display name:', error);
            return username; // Fallback to username if API call fails
        }
    },

    // Follow/Unfollow endpoints
    async followUser(username: string) {
        const response = await axios.post(`${API_BASE_URL}/users/${username}/follow`, {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    async unfollowUser(username: string) {
        const response = await axios.delete(`${API_BASE_URL}/users/${username}/follow`, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    async getUserFollowers(username: string) {
        const response = await axios.get(`${API_BASE_URL}/users/${username}/followers`);
        return response.data;
    },

    async getUserFollowing(username: string) {
        const response = await axios.get(`${API_BASE_URL}/users/${username}/following`);
        return response.data;
    },

    async checkFollowStatus(username: string, targetUsername: string) {
        const response = await axios.get(`${API_BASE_URL}/users/${username}/follow-status/${targetUsername}`);
        return response.data;
    },

    // Post endpoints
    async getPosts(page: number = 1, limit: number = 10) {
        const response = await axios.get(`${API_BASE_URL}/posts/?page=${page}&limit=${limit}`);
        return response.data;
    },

    async getReplies(postId: string) {
        // Fetch posts that reply to this post
        const response = await axios.get(`${API_BASE_URL}/posts/?in_reply_to=${postId}`);
        return response.data;
    },

    async createPost(postData: {
        content: string;
        to?: string[];
        cc?: string[];
        summary?: string;
        sensitive?: boolean;
        in_reply_to?: string;
    }) {
        const response = await axios.post(`${API_BASE_URL}/posts/create`, postData, {
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            }
        });
        return response.data;
    },

    async likePost(postId: string) {
        const uuid = extractPostUuid(postId);
        const response = await axios.post(`${API_BASE_URL}/posts/${uuid}/like`, {}, {
            headers: getAuthHeaders()
        });
        return response.data;
    },

    async getPostLikes(postId: string) {
        const uuid = extractPostUuid(postId);
        const response = await axios.get(`${API_BASE_URL}/posts/${uuid}/likes`);
        return response.data;
    },

    // Get posts by a specific user
    async getUserPosts(username: string, page: number = 1, limit: number = 10) {
        // Filter posts by the user's ActivityPub ID
        const userResponse = await this.getUser(username);
        const userId = userResponse.id;

        const response = await axios.get(`${API_BASE_URL}/posts/?page=${page}&limit=${limit}`);

        // Filter posts by this user's ID
        const userPosts = response.data.posts?.filter((post: any) => post.attributedTo === userId) || [];

        return {
            ...response.data,
            posts: userPosts
        };
    },

    // Search endpoints
    async searchUsers(query: string, limit: number = 20) {
        const response = await axios.get(`${API_BASE_URL}/users/search`, {
            params: { q: query, limit },
            headers: getAuthHeaders()
        });

        // Backend returns 'results' but frontend expects 'users', so we normalize it
        const users = response.data.results || [];

        // For remote users, try to fetch their full ActivityPub profile to get avatars
        const enrichedUsers = await Promise.all(users.map(async (user: any) => {
            if (user.is_local === false && user.id) {
                try {
                    // Fetch the full ActivityPub profile directly
                    const profileResponse = await axios.get(user.id, {
                        headers: {
                            'Accept': 'application/activity+json'
                        },
                        timeout: 5000 // 5 second timeout for external requests
                    });

                    const fullProfile = profileResponse.data;
                    return {
                        ...user,
                        icon: fullProfile.icon?.url || fullProfile.icon,
                        image: fullProfile.image?.url || fullProfile.image, // header image
                        // Also update other fields that might be more complete in the full profile
                        summary: fullProfile.summary || user.summary,
                        name: fullProfile.name || user.name
                    };
                } catch (error) {
                    console.warn(`Failed to fetch full profile for ${user.id}:`, error);
                    // Return user as-is if we can't fetch the full profile
                    return user;
                }
            }
            return user;
        }));

        return {
            ...response.data,
            users: enrichedUsers
        };
    },

    async webfingerLookup(account: string) {
        try {
            // Handle account format like user@domain.com or @user@domain.com
            const cleanAccount = account.startsWith('@') ? account.substring(1) : account;

            if (!cleanAccount.includes('@')) {
                throw new Error('Invalid account format. Use user@domain.com');
            }

            const response = await axios.get(`${API_BASE_URL}/.well-known/webfinger`, {
                params: { resource: `acct:${cleanAccount}` }
            });
            return response.data;
        } catch (error) {
            console.error('Webfinger lookup failed:', error);
            throw error;
        }
    },

    async resolveRemoteUser(actorUrl: string) {
        try {
            const response = await axios.post(`${API_BASE_URL}/users/resolve`,
                { actor_url: actorUrl },
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Remote user resolution failed:', error);
            throw error;
        }
    }
};