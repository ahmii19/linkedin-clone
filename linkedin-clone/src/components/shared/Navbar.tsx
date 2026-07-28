"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import {
  Home,
  Users,
  MessageCircle,
  Bell,
  Search,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { io, Socket } from "socket.io-client";

const navLinks = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/connections", label: "Network", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

interface SearchUser {
  _id: string;
  name: string;
  username: string;
  profilePhoto?: string;
  headline?: string;
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [profileLink, setProfileLink] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.filter((n: { read: boolean }) => !n.read).length);
        }
      } catch {}
    };
    fetchUnread();
    let socket: Socket | undefined;
    async function connectSocket() {
      try {
        const res = await fetch("/api/socket/io");
        const data = await res.json();
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || data.url;
        socket = io(socketUrl, {
          query: { userId: session?.user?.id },
          transports: ["polling", "websocket"],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });
        socket.on("new_notification", () => setUnreadCount((prev) => prev + 1));
        socket.on("notification_removed", () => setUnreadCount((prev) => Math.max(0, prev - 1)));
      } catch {}
    }
    connectSocket();
    return () => { if (socket) socket.disconnect(); };
  }, [session]);

  useEffect(() => {
    if (!session?.user?.id) return;
    if (session.user.username) {
      setProfileLink(`/profile/${session.user.username}`);
    } else {
      fetch("/api/users/me")
        .then((r) => r.json())
        .then((user) => { if (user?.username) setProfileLink(`/profile/${user.username}`); })
        .catch(() => {});
    }
  }, [session]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setShowDropdown(false); return; }
    setSearchLoading(true);
    setShowDropdown(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) setSearchResults(await res.json());
      } catch {} finally { setSearchLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl shadow-sm dark:border-gray-700/50 dark:bg-gray-900/80">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link href="/feed" className="text-xl font-bold text-blue-600 tracking-tight shrink-0">
            LC
          </Link>

          <div ref={searchRef} className="hidden md:relative md:flex">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search LinkedClone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowDropdown(true)}
              className="h-10 w-64 rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-8 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setSearchResults([]); setShowDropdown(false); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {showDropdown && (
              <div className="absolute top-full mt-2 left-0 right-0 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 overflow-hidden max-h-80 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-4 text-sm text-gray-500 text-center">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 text-center">No users found</div>
                ) : (
                  searchResults.map((user) => (
                    <Link
                      key={user._id}
                      href={`/profile/${user.username}`}
                      onClick={() => { setShowDropdown(false); setSearchQuery(""); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors dark:hover:bg-gray-800"
                    >
                      <Avatar size="sm" src={user.profilePhoto} fallback={user.name} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                        {user.headline && <p className="text-xs text-gray-500 truncate">{user.headline}</p>}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {link.label === "Notifications" && unreadCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {session && profileLink && (
            <>
              <button
                className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              >
                <Search className="h-5 w-5" />
              </button>
              <Link href={profileLink}>
                <Avatar
                  size="sm"
                  src={session.user?.image || undefined}
                  fallback={session.user?.name || "U"}
                  className="ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-blue-400 transition-all cursor-pointer"
                />
              </Link>
            </>
          )}
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-gray-100 p-3 md:hidden dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search LinkedClone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white transition-all dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
        </div>
      )}

      <nav className="flex items-center justify-around border-t border-gray-100 bg-white px-2 py-2 dark:border-gray-800 dark:bg-gray-900 md:hidden">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium ${
                isActive ? "text-blue-600" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {link.label === "Notifications" && unreadCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
