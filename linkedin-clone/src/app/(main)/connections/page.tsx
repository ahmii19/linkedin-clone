"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserPlus } from "lucide-react";
import Link from "next/link";

interface ConnectionWithUsers {
  _id: string;
  requester: { _id: string; name: string; username: string; profilePhoto?: string; headline?: string };
  recipient: { _id: string; name: string; username: string; profilePhoto?: string; headline?: string };
  status: string;
}

export default function ConnectionsPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<"connections" | "pending" | "requests">("connections");
  const [data, setData] = useState<ConnectionWithUsers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConnections() {
      setLoading(true);
      const status = tab === "pending" ? "pending" : "accepted";
      const res = await fetch(`/api/connections?status=${status}`);
      if (res.ok) {
        const all = await res.json();
        if (tab === "requests") {
          setData(all.filter((c: ConnectionWithUsers) =>
            c.recipient._id === session?.user?.id && c.status === "pending"
          ));
        } else {
          setData(all);
        }
      }
      setLoading(false);
    }
    fetchConnections();
  }, [tab, session]);

  const handleAction = async (connectionId: string, action: "accept" | "reject") => {
    const res = await fetch(`/api/connections/${action}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId }),
    });
    if (res.ok) setData((prev) => prev.filter((c) => c._id !== connectionId));
  };

  const getOtherUser = (conn: ConnectionWithUsers) =>
    conn.requester._id === session?.user?.id ? conn.recipient : conn.requester;

  const tabs = [
    { id: "connections" as const, label: "Connections" },
    { id: "pending" as const, label: "Pending" },
    { id: "requests" as const, label: "Requests" },
  ];

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/50 dark:bg-gray-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-blue-600" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">My Network</h1>
        </div>
        <div className="flex gap-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-sm font-medium transition-colors ${
                tab === t.id ? "text-blue-600" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-3">
        {loading ? (
          <div className="space-y-3 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="py-12 text-center">
            <UserPlus className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No {tab} found.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {data.map((conn) => {
              const user = getOtherUser(conn);
              return (
                <div key={conn._id} className="flex items-center justify-between rounded-xl p-3 transition-all hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Link href={`/profile/${user.username}`} className="flex items-center gap-3 min-w-0">
                    <Avatar size="md" src={user.profilePhoto} fallback={user.name} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                      {user.headline && <p className="text-xs text-gray-500 truncate">{user.headline}</p>}
                    </div>
                  </Link>
                  {tab === "requests" && (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" onClick={() => handleAction(conn._id, "accept")}>Accept</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleAction(conn._id, "reject")}>Reject</Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
