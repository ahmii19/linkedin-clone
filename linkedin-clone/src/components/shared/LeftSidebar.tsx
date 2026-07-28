"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Home,
  Users,
  MessageCircle,
  Bell,
  User,
  LogOut,
  Briefcase,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { IUser } from "@/types";

const navItems = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/connections", label: "My Network", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/search", label: "Search", icon: Briefcase },
];

export function LeftSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [profileLink, setProfileLink] = useState("/profile");
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/users/me")
      .then((r) => r.ok ? r.json() : null)
      .then((user: IUser | null) => {
        if (user) {
          setCoverPhoto(user.coverPhoto || null);
          if (user.username) setProfileLink(`/profile/${user.username}`);
        }
      })
      .catch(() => {});
  }, [session]);

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm shadow-gray-200/50 dark:border-gray-700/50 dark:bg-gray-900 overflow-hidden mb-4">
        <div
          className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 bg-cover bg-center"
          style={coverPhoto ? { backgroundImage: `url(${coverPhoto})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        />
        <div className="px-5 pb-4">
          <div className="-mt-10 mb-3 flex justify-center">
            <Avatar size="xl" src={session?.user?.image || undefined} fallback={session?.user?.name || "U"} className="ring-4 ring-white dark:ring-gray-900" />
          </div>
          <Link href={profileLink}>
            <h3 className="text-center font-semibold text-gray-900 hover:text-blue-600 transition-colors dark:text-gray-100">
              {session?.user?.name || "User"}
            </h3>
          </Link>
          <p className="text-center text-xs text-gray-500 mt-0.5">{session?.user?.email || ""}</p>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <hr className="my-2 border-gray-200 dark:border-gray-700" />
        <Link
          href={profileLink}
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all duration-200 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <User className="h-5 w-5" />
          Profile
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all duration-200 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </nav>
    </aside>
  );
}
