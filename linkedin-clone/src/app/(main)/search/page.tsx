"use client";

import { useState } from "react";
import { Search as SearchIcon, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface SearchUser {
  _id: string;
  name: string;
  username: string;
  profilePhoto?: string;
  headline?: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    if (res.ok) setResults(await res.json());
    setLoading(false);
  };

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/50 dark:bg-gray-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Search</h1>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name or username..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-gray-50 dark:bg-gray-800"
          />
        </div>
      </div>
      <div className="p-3">
        {loading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : query && results.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No users found</p>
          </div>
        ) : !query ? (
          <div className="py-12 text-center">
            <SearchIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Start typing to search users</p>
          </div>
        ) : (
          <div className="space-y-1">
            {results.map((user) => (
              <Link
                key={user._id}
                href={`/profile/${user.username}`}
                className="flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Avatar size="md" src={user.profilePhoto} fallback={user.name} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                  {user.headline && <p className="text-xs text-gray-500 truncate">{user.headline}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
