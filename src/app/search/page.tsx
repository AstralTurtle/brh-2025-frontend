"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import UserResult from "@/components/UserResult";
import NavigationBar from "@/components/NavigationBar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Users, Globe, AlertCircle } from "lucide-react";
import { apiService } from "@/lib/api";
import { getCookie } from "@/lib/utils";

export default function SearchPage() {
    const [localResults, setLocalResults] = useState<UserSearchResult[]>([]);
    const [remoteResults, setRemoteResults] = useState<UserSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isWebfingerSearching, setIsWebfingerSearching] = useState(false);
    const [error, setError] = useState<string>("");
    const [hasSearched, setHasSearched] = useState(false);

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

            // If query looks like a webfinger address (contains @) and we didn't find any results,
            // try webfinger lookup as a fallback
            if (query.includes('@') && allUsers.length === 0) {
                setIsWebfingerSearching(true);
                try {
                    const webfingerResult = await apiService.webfingerLookup(query);

                    // Find actor URL from webfinger links
                    const actorLink = webfingerResult.links?.find((link: any) =>
                        link.type === 'application/activity+json' ||
                        link.rel === 'self'
                    );

                    if (actorLink?.href) {
                        // Resolve the remote user
                        const resolvedUser = await apiService.resolveRemoteUser(actorLink.href);

                        const remoteUser: UserSearchResult = {
                            id: resolvedUser.id || actorLink.href,
                            username: resolvedUser.preferredUsername || resolvedUser.username || query.split('@')[0],
                            preferredUsername: resolvedUser.preferredUsername,
                            display_name: resolvedUser.name || resolvedUser.display_name,
                            name: resolvedUser.name,
                            summary: resolvedUser.summary,
                            icon: resolvedUser.icon?.url || resolvedUser.icon,
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
                            })()
                        };

                        setRemoteResults([remoteUser]);
                    }
                } catch (webfingerError) {
                    console.warn('Webfinger lookup failed:', webfingerError);
                    // Don't show error for webfinger failures, just continue with search results
                } finally {
                    setIsWebfingerSearching(false);
                }
            }

        } catch (err: any) {
            console.error('Search failed:', err);
            setError(err.response?.data?.message || err.message || 'Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const handleUserClick = (user: UserSearchResult) => {
        router.push(`/profile/${user.preferredUsername || user.username}`);
    };

    const totalResults = localResults.length + remoteResults.length;

    return (
        <div className="min-h-screen bg-zinc-900 text-white">
            <NavigationBar />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-4">Search Users</h1>
                    <SearchBar
                        onSearch={handleSearch}
                        placeholder="Search by username or @user@domain.com for remote users..."
                        className="mb-4"
                    />

                    <p className="text-zinc-400 text-sm">
                        Search for local users by username, or find remote users using webfinger format (@user@domain.com)
                    </p>
                </div>

                {error && (
                    <Alert className="mb-6 bg-red-900/50 border-red-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-200">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {(isSearching || isWebfingerSearching) && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span className="text-zinc-400">
                            {isWebfingerSearching ? 'Looking up remote user...' : 'Searching users...'}
                        </span>
                    </div>
                )}

                {hasSearched && !isSearching && !isWebfingerSearching && (
                    <>
                        {totalResults === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-zinc-400 mb-2">No users found</h3>
                                <p className="text-zinc-500">
                                    Try a different search term or check the spelling.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Local Results */}
                                {localResults.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Users className="w-5 h-5 text-violet-400" />
                                            <h2 className="text-xl font-semibold text-white">
                                                Local Users ({localResults.length})
                                            </h2>
                                        </div>
                                        <div className="space-y-3">
                                            {localResults.map((user) => (
                                                <UserResult
                                                    key={user.id}
                                                    user={user}
                                                    onUserClick={handleUserClick}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Remote Results */}
                                {remoteResults.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Globe className="w-5 h-5 text-green-400" />
                                            <h2 className="text-xl font-semibold text-white">
                                                Remote Users ({remoteResults.length})
                                            </h2>
                                        </div>
                                        <div className="space-y-3">
                                            {remoteResults.map((user) => (
                                                <UserResult
                                                    key={user.id}
                                                    user={user}
                                                    onUserClick={handleUserClick}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {!hasSearched && !isSearching && (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-zinc-400 mb-2">Find Users</h3>
                        <p className="text-zinc-500 max-w-md mx-auto">
                            Search for users by their username to connect and follow them.
                            Use @user@domain.com format to find users on other servers.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}