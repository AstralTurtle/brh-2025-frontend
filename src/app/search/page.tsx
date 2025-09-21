"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import UserResult from "@/components/UserResult";
import UserResultSkeleton from "@/components/UserResultSkeleton";
import NavigationBar from "@/components/NavigationBar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Users, Globe, AlertCircle, Search, ExternalLink } from "lucide-react";
import { apiService } from "@/lib/api";
import { getCookie } from "@/lib/utils";
import { UserSearchResult, WebfingerResponse, ActivityPubActor } from "@/types/user";

export default function SearchPage() {
    const [localResults, setLocalResults] = useState<UserSearchResult[]>([]);
    const [remoteResults, setRemoteResults] = useState<UserSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isWebfingerSearching, setIsWebfingerSearching] = useState(false);
    const [error, setError] = useState<string>("");
    const [hasSearched, setHasSearched] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get('q') || '';

    useEffect(() => {
        // Check authentication
        if (!getCookie("jwt")) {
            router.replace("/");
            return;
        }

        if (initialQuery) {
            handleSearch(initialQuery);
        }
    }, [initialQuery, router]);

    const handleSearch = async (query: string) => {
        setIsSearching(true);
        setError("");
        setHasSearched(true);
        setLocalResults([]);
        setRemoteResults([]);

        try {
            // Search users (both local and remote)
            const searchResponse = await apiService.searchUsers(query);
            const allUsers: UserSearchResult[] = (searchResponse.users || []).map((user: any) => ({
                ...user,
                // Use the backend's is_local property, fallback to true if not provided
                isLocal: user.is_local !== undefined ? user.is_local : true,
                // For remote users, try to get icon from their profile if available
                icon: user.icon?.url || user.icon,
                // Extract host for remote users
                host: user.is_local === false ? (() => {
                    try {
                        return new URL(user.id).hostname;
                    } catch {
                        return 'unknown';
                    }
                })() : undefined
            }));

            // Separate local and remote users
            const localUsers = allUsers.filter(user => user.isLocal);
            const remoteUsers = allUsers.filter(user => !user.isLocal);

            setLocalResults(localUsers);
            setRemoteResults(remoteUsers);

            // Enhanced webfinger lookup for remote users
            if (query.includes('@') && allUsers.length === 0) {
                await performWebfingerLookup(query);
            }

        } catch (err: any) {
            console.error('Search failed:', err);
            setError(err.response?.data?.message || err.message || 'Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const performWebfingerLookup = async (query: string, retry: number = 0) => {
        setIsWebfingerSearching(true);
        setRetryCount(retry);
        
        try {
            const webfingerResult: WebfingerResponse = await apiService.webfingerLookup(query);

            // Find actor URL from webfinger links
            const actorLink = webfingerResult.links?.find((link) =>
                link.type === 'application/activity+json' ||
                link.rel === 'self'
            );

            if (actorLink?.href) {
                // Resolve the remote user
                const resolvedUser: ActivityPubActor = await apiService.resolveRemoteUser(actorLink.href);

                const remoteUser: UserSearchResult = {
                    id: resolvedUser.id || actorLink.href,
                    username: resolvedUser.preferredUsername || resolvedUser.username || query.split('@')[0],
                    preferredUsername: resolvedUser.preferredUsername,
                    display_name: resolvedUser.name || '',
                    name: resolvedUser.name,
                    summary: resolvedUser.summary,
                    icon: typeof resolvedUser.icon === 'string' ? resolvedUser.icon : resolvedUser.icon?.url,
                    image: typeof resolvedUser.image === 'string' ? resolvedUser.image : resolvedUser.image?.url,
                    followers_count: resolvedUser.followers_count,
                    following_count: resolvedUser.following_count,
                    posts_count: resolvedUser.posts_count,
                    isLocal: false,
                    host: (() => {
                        try {
                            return new URL(resolvedUser.id || actorLink.href).hostname;
                        } catch {
                            return 'unknown';
                        }
                    })(),
                    url: resolvedUser.id
                };

                setRemoteResults([remoteUser]);
                setRetryCount(0); // Reset retry count on success
            } else {
                setError('Unable to find ActivityPub profile for this user. Make sure the account exists and supports ActivityPub.');
            }
        } catch (webfingerError: any) {
            console.warn('Webfinger lookup failed:', webfingerError);
            
            // Provide more helpful error messages
            let errorMessage = 'Failed to find remote user.';
            if (webfingerError.response?.status === 404) {
                errorMessage = 'User not found. Please check the username and domain.';
            } else if (webfingerError.response?.status === 500) {
                errorMessage = 'Server error. The remote server might be temporarily unavailable.';
            } else if (webfingerError.code === 'NETWORK_ERROR' || webfingerError.message.includes('timeout')) {
                errorMessage = 'Network timeout. The remote server is taking too long to respond.';
            } else if (!query.includes('@') || query.split('@').length !== 2) {
                errorMessage = 'Invalid format. Please use @username@domain.com format for remote users.';
            }
            
            setError(errorMessage);
        } finally {
            setIsWebfingerSearching(false);
            setRetryCount(0);
        }
    };

    const retrySearch = () => {
        const searchParams = new URLSearchParams(window.location.search);
        const query = searchParams.get('q') || '';
        if (query) {
            handleSearch(query);
        }
    };

    const totalResults = localResults.length + remoteResults.length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-violet-600 to-indigo-600">
            <NavigationBar />

            <div className="flex flex-col items-center justify-start min-h-screen p-4">
                <div className="w-full max-w-4xl">
                    <Card className="bg-zinc-900 border-zinc-700 mb-8">
                        <CardContent className="p-8">
                            <div className="text-center mb-6">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <Search className="w-8 h-8 text-violet-400" />
                                    <h1 className="text-4xl font-bold text-white">Find Users</h1>
                                </div>
                                <p className="text-zinc-400 text-lg">
                                    Connect with creators across the fediverse
                                </p>
                            </div>

                            <SearchBar
                                onSearch={handleSearch}
                                placeholder="Search by username or @user@domain.com for remote users..."
                                className="mb-4"
                            />

                            <div className="flex items-center gap-4 text-sm text-zinc-400">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-violet-400" />
                                    <span>Local users by username</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4 text-green-400" />
                                    <span>Remote users via @user@domain.com</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="w-full max-w-4xl space-y-6">
                    {error && (
                        <Card className="bg-red-900/50 border-red-800">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-300 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-red-200 mb-3">{error}</p>
                                        <Button 
                                            onClick={retrySearch}
                                            variant="outline" 
                                            size="sm"
                                            className="text-red-300 border-red-400 hover:bg-red-400 hover:text-white"
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {(isSearching || isWebfingerSearching) && (
                        <div className="space-y-6">
                            <Card className="bg-zinc-900 border-zinc-700">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-center mb-6">
                                        <Loader2 className="w-8 h-8 animate-spin mr-3 text-violet-400" />
                                        <span className="text-zinc-300 text-lg">
                                            {isWebfingerSearching ? 'Looking up remote user...' : 'Searching users...'}
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <UserResultSkeleton />
                                        <UserResultSkeleton />
                                        <UserResultSkeleton />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {hasSearched && !isSearching && !isWebfingerSearching && (
                        <>
                            {totalResults === 0 ? (
                                <Card className="bg-zinc-900 border-zinc-700">
                                    <CardContent className="p-12 text-center">
                                        <Users className="w-16 h-16 text-zinc-600 mx-auto mb-6" />
                                        <h3 className="text-2xl font-bold text-zinc-400 mb-3">No users found</h3>
                                        <p className="text-zinc-500 text-lg">
                                            Try a different search term or check the spelling.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-8">
                                    {/* Local Results */}
                                    {localResults.length > 0 && (
                                        <div>
                                            <Card className="bg-zinc-900 border-zinc-700">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="p-2 rounded-lg bg-violet-600">
                                                            <Users className="w-6 h-6 text-white" />
                                                        </div>
                                                        <h2 className="text-2xl font-bold text-white">
                                                            Local Users ({localResults.length})
                                                        </h2>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {localResults.map((user) => (
                                                            <UserResult
                                                                key={user.id}
                                                                user={{
                                                                    ...user,
                                                                    isRemote: !user.isLocal
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}

                                    {/* Remote Results */}
                                    {remoteResults.length > 0 && (
                                        <div>
                                            <Card className="bg-zinc-900 border-zinc-700">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="p-2 rounded-lg bg-green-600">
                                                            <Globe className="w-6 h-6 text-white" />
                                                        </div>
                                                        <h2 className="text-2xl font-bold text-white">
                                                            Remote Users ({remoteResults.length})
                                                        </h2>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {remoteResults.map((user) => (
                                                            <UserResult
                                                                key={user.id}
                                                                user={{
                                                                    ...user,
                                                                    isRemote: true
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {!hasSearched && !isSearching && (
                        <Card className="bg-zinc-900 border-zinc-700">
                            <CardContent className="p-12 text-center">
                                <div className="flex items-center justify-center mb-6">
                                    <div className="p-4 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600">
                                        <Users className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-400 mb-3">Ready to explore?</h3>
                                <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
                                    Discover creators and developers across the fediverse. Search for local users by their username, 
                                    or connect with users on other servers using the @user@domain.com format.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}