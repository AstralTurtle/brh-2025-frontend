"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
    onSearch?: (query: string) => void;
    placeholder?: string;
    className?: string;
}

export function SearchBar({ onSearch, placeholder = "Search users...", className = "" }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            if (onSearch) {
                onSearch(query.trim());
            } else {
                // Navigate to search page with query
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
            <div className="relative flex-1">
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
            </div>
            <Button
                type="submit"
                variant="secondary"
                className="bg-violet-600 hover:bg-violet-700 text-white"
            >
                Search
            </Button>
        </form>
    );
}