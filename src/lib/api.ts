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
    }
};