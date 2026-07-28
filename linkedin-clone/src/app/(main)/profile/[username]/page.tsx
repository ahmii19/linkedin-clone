"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MapPin, Briefcase, GraduationCap, Camera } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/shared/PostCard";
import { useSession } from "next-auth/react";
import type { IPost, IUser } from "@/types";
import Link from "next/link";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { data: session } = useSession();
  const [user, setUser] = useState<IUser | null>(null);
  const [posts, setPosts] = useState<(IPost & { author: IUser })[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "about" | "experience" | "education">("posts");

  useEffect(() => {
    async function fetchData() {
      const userRes = await fetch(`/api/users/${username}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }
      const postsRes = await fetch("/api/posts");
      if (postsRes.ok) {
        const allPosts = await postsRes.json();
        setPosts(allPosts.filter((p: IPost & { author: IUser }) =>
          (typeof p.author === "string" ? p.author : p.author.username) === username
        ));
      }
      setLoading(false);
    }
    fetchData();
  }, [username]);

  useEffect(() => {
    if (!user || !session?.user?.id || user._id === session.user.id) return;
    fetch(`/api/connections/status?userId=${user._id}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) { setConnectionStatus(data.status); setConnectionId(data.connectionId || null); }
      }).catch(() => {});
  }, [user, session]);

  const sendConnectionRequest = async () => {
    if (!user || connectionLoading) return;
    setConnectionLoading(true);
    try {
      const res = await fetch("/api/connections", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: user._id }),
      });
      if (res.ok) setConnectionStatus("pending_sent");
    } catch {} finally { setConnectionLoading(false); }
  };

  const handleConnectionAction = async (action: "accept" | "reject") => {
    if (!connectionId || connectionLoading) return;
    setConnectionLoading(true);
    try {
      const res = await fetch(`/api/connections/${action}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });
      if (res.ok) { setConnectionStatus(action === "accept" ? "accepted" : "none"); setConnectionId(null); }
    } catch {} finally { setConnectionLoading(false); }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/50 dark:bg-gray-900 overflow-hidden">
        <Skeleton className="h-64 md:h-72 w-full" />
        <div className="px-6 pb-6 pt-10 text-center">
          <Skeleton className="h-24 w-24 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto mt-4" />
          <Skeleton className="h-4 w-32 mx-auto mt-2" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border p-12 text-center">
        <p className="text-lg font-medium">User not found</p>
      </div>
    );
  }

  const isOwnProfile = session?.user?.id === user._id;

  const renderConnectionButton = () => {
    if (isOwnProfile) return null;
    if (connectionStatus === "none") return (
      <Button size="sm" onClick={sendConnectionRequest} disabled={connectionLoading}>
        {connectionLoading ? "Connecting..." : "Connect"}
      </Button>
    );
    if (connectionStatus === "pending_sent") return <Button size="sm" variant="outline" disabled>Pending</Button>;
    if (connectionStatus === "pending_received") return (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => handleConnectionAction("accept")} disabled={connectionLoading}>Accept</Button>
        <Button size="sm" variant="outline" onClick={() => handleConnectionAction("reject")} disabled={connectionLoading}>Reject</Button>
      </div>
    );
    if (connectionStatus === "accepted") return <Button size="sm" variant="outline" disabled>Connected</Button>;
    return null;
  };

  const tabs = [
    { id: "posts" as const, label: "Posts" },
    { id: "about" as const, label: "About" },
    { id: "experience" as const, label: "Experience" },
    { id: "education" as const, label: "Education" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/50 dark:bg-gray-900 overflow-hidden">
        <div className="relative h-64 md:h-72 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 overflow-hidden"
          style={user.coverPhoto ? { backgroundImage: `url(${user.coverPhoto})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          {isOwnProfile && (
            <Link href="/profile/edit" className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors group">
              <span className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                <Camera className="h-4 w-4" />
                Edit Cover
              </span>
            </Link>
          )}
        </div>
        <div className="px-6 pb-5">
          <div className="-mt-10 flex justify-center sm:justify-start">
            <Avatar size="xxl" src={user.profilePhoto} fallback={user.name} className="ring-4 ring-white dark:ring-gray-900 shadow-lg" />
          </div>
          <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h1>
              {user.headline && <p className="text-sm text-gray-500">{user.headline}</p>}
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-1 text-sm text-gray-500">
                {user.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{user.location}</span>}
              </div>
            </div>
            <div className="flex justify-center sm:justify-start">
              {isOwnProfile ? (
                <Link href="/profile/edit"><Button variant="outline" size="sm">Edit Profile</Button></Link>
              ) : renderConnectionButton()}
            </div>
          </div>

          {user.bio && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
              <p>{user.bio}</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/50 dark:bg-gray-900 overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === "posts" && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No posts yet.</p>
              ) : (
                posts.map((post) => (
                  <PostCard key={post._id} post={post} currentUserId={session?.user?.id} />
                ))
              )}
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              {user.bio && <p>{user.bio}</p>}
              {!user.bio && <p className="text-gray-400">No bio added yet.</p>}
              {user.skills && user.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, i) => (
                      <span key={i} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "experience" && (
            <div className="space-y-4">
              {user.experience && user.experience.length > 0 ? user.experience.map((exp, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{exp.title}</p>
                    <p className="text-sm text-gray-500">{exp.company}</p>
                    {exp.startDate && <p className="text-xs text-gray-400">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</p>}
                  </div>
                </div>
              )) : <p className="text-sm text-gray-400">No experience listed.</p>}
            </div>
          )}

          {activeTab === "education" && (
            <div className="space-y-4">
              {user.education && user.education.length > 0 ? user.education.map((edu, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{edu.school}</p>
                    <p className="text-sm text-gray-500">{edu.degree} in {edu.field}</p>
                    {edu.startDate && <p className="text-xs text-gray-400">{edu.startDate} - {edu.endDate || "Present"}</p>}
                  </div>
                </div>
              )) : <p className="text-sm text-gray-400">No education listed.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
