"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, MoreHorizontal, Check, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import type { INotification, IUser } from "@/types";

type NotificationPopulated = INotification & { sender: IUser };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationPopulated[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => { setNotifications(data); setLoading(false); });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setMenuOpen(null);
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        toast.success("Notification deleted");
      } else {
        toast.error("Failed to delete notification");
      }
    } catch {
      toast.error("Failed to delete notification");
    } finally {
      setConfirmDeleteId(null);
      setMenuOpen(null);
    }
  };

  const getNotificationHref = (n: NotificationPopulated): string => {
    if (n.type === "new_like" && n.post) return `/feed?highlightPost=${n.post}`;
    if (n.type === "new_comment" && n.post) return `/feed?highlightPost=${n.post}`;
    if (n.type === "connection_request" || n.type === "connection_accepted") return "/connections";
    return "#";
  };

  const typeLabels: Record<string, string> = {
    connection_request: "sent you a connection request",
    connection_accepted: "accepted your connection request",
    new_comment: "commented on your post",
    new_like: "liked your post",
  };

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/50 dark:bg-gray-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h1>
        </div>
      </div>
      <div className="p-3">
        {loading ? (
          <div className="space-y-3 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((n) => {
              const href = getNotificationHref(n);
              return (
                <div key={n._id} className="relative group">
                  <Link
                    href={href}
                    onClick={() => !n.read && markAsRead(n._id)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      !n.read ? "bg-blue-50 dark:bg-blue-900/10" : ""
                    }`}
                  >
                    <Avatar size="md" src={n.sender.profilePhoto} fallback={n.sender.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        <span className="font-semibold">{n.sender.name}</span>{" "}
                        {typeLabels[n.type] || n.type}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.read && <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" />}
                  </Link>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(menuOpen === n._id ? null : n._id); }}
                    className="absolute top-3 right-3 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all dark:hover:bg-gray-800"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {menuOpen === n._id && (
                    <div ref={menuRef} className="absolute right-2 top-12 w-44 rounded-xl border border-gray-200 bg-white shadow-xl py-1 z-50 dark:border-gray-700 dark:bg-gray-900">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); markAsRead(n._id); }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <Check className="h-4 w-4" />
                        Mark as Read
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDeleteId(n._id); setMenuOpen(null); }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Notification
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete Notification</h3>
              <button onClick={() => setConfirmDeleteId(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Are you sure you want to delete this notification?</p>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => deleteNotification(confirmDeleteId)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
