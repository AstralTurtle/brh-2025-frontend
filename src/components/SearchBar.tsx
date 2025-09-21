"use client";

import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  className?: string;
  size?: "md" | "lg";
  placeholder?: string;
}

export default function SearchBar({ 
  onSearch, 
  className = "", 
  size = "md", 
  placeholder = "Search users..." 
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const sizeClasses = size === "lg" ? "h-14 text-xl pl-11 pr-4" : "h-10 text-base pl-10 pr-3";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (query.trim()) {
        onSearch?.(query.trim());
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full rounded-xl bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-400 border border-zinc-700 hover:border-zinc-600 transition-colors ${sizeClasses}`}
        />
      </div>
    </form>
  );
}