"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Users, MessageCircle, Bell, User } from "lucide-react";
import { useState, useEffect } from "react";

const links = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/connections", label: "Network", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/notifications", label: "Alerts", icon: Bell },
];

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [profileLink, setProfileLink] = useState("/feed");

  useEffect(() => {
    if (session?.user?.username) {
      setProfileLink(`/profile/${session.user.username}`);
    }
  }, [session]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/90 backdrop-blur-lg dark:border-gray-700 dark:bg-gray-900/90 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors ${
                isActive ? "text-blue-600" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
        <Link
          href={profileLink}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors ${
            pathname.startsWith("/profile") ? "text-blue-600" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <User className="h-5 w-5" />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
}
