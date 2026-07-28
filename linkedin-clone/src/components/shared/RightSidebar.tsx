"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { TrendingUp, Users } from "lucide-react";

const trendingTopics = [
  { tag: "#technology", posts: "12.5K" },
  { tag: "#AI", posts: "8.2K" },
  { tag: "#startups", posts: "5.7K" },
  { tag: "#softwareengineering", posts: "4.3K" },
  { tag: "#design", posts: "3.1K" },
];

export function RightSidebar() {
  const { data: session } = useSession();
  const [suggestions, setSuggestions] = useState<
    { _id: string; name: string; username: string; profilePhoto?: string; headline?: string }[]
  >([]);

  useEffect(() => {
    fetch("/api/search?q=")
      .then((r) => r.json())
      .then((users) => {
        if (Array.isArray(users)) {
          setSuggestions(users.filter((u: { _id: string }) => u._id !== session?.user?.id).slice(0, 3));
        }
      })
      .catch(() => {});
  }, [session]);

  return (
    <aside className="hidden xl:flex flex-col w-80 shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto gap-4">
      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm shadow-gray-200/50 dark:border-gray-700/50 dark:bg-gray-900 p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          Trending on LinkedClone
        </h3>
        <div className="space-y-3">
          {trendingTopics.map((topic) => (
            <button key={topic.tag} className="w-full text-left group">
              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors dark:text-gray-100">
                {topic.tag}
              </p>
              <p className="text-xs text-gray-500">{topic.posts} posts</p>
            </button>
          ))}
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm shadow-gray-200/50 dark:border-gray-700/50 dark:bg-gray-900 p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
            <Users className="h-4 w-4 text-blue-600" />
            People you may know
          </h3>
          <div className="space-y-3">
            {suggestions.map((user) => (
              <Link
                key={user._id}
                href={`/profile/${user.username}`}
                className="flex items-center gap-3 group"
              >
                <Avatar size="sm" src={user.profilePhoto} fallback={user.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate dark:text-gray-100">
                    {user.name}
                  </p>
                  {user.headline && (
                    <p className="text-xs text-gray-500 truncate">{user.headline}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm shadow-gray-200/50 dark:border-gray-700/50 dark:bg-gray-900 p-5">
        <p className="text-xs text-gray-500 leading-relaxed">
          LinkedClone — Your professional community. Build your network, find opportunities, and grow your career.
        </p>
      </div>
    </aside>
  );
}
