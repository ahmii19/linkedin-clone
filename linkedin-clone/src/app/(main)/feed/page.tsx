"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CreatePost } from "@/components/shared/CreatePost";
import { PostCard } from "@/components/shared/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { io, Socket } from "socket.io-client";
import type { IPost, IUser } from "@/types";

function FeedContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [posts, setPosts] = useState<(IPost & { author: IUser })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const highlightPost = searchParams.get("highlightPost");
  const highlightComment = searchParams.get("highlightComment");
  const highlightedRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/posts");
      if (!res.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (!highlightPost || loading || posts.length === 0) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`post-${highlightPost}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-blue-400", "rounded-2xl", "transition-all", "duration-1000");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-blue-400");
        }, 2000);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [highlightPost, loading, posts]);

  useEffect(() => {
    if (!session?.user?.id) return;
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
        socket.on("new_notification", () => {});
      } catch {}
    }
    connectSocket();
    return () => { if (socket) socket.disconnect(); };
  }, [session]);

  const handleCreate = async (content: string, image?: string) => {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, image }),
    });
    if (!res.ok) throw new Error("Failed to create post");
    const newPost = await res.json();
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleLike = async (postId: string) => {
    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    if (res.ok) {
      const data = await res.json();
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likeCount: data.likeCount,
                likes: data.liked
                  ? [...p.likes, session?.user?.id || ""]
                  : p.likes.filter((id) => id !== session?.user?.id),
              }
            : p
        )
      );
    }
  };

  const handleDelete = async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    }
  };

  const handleComment = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
      )
    );
  };

  const handleEdit = async (postId: string, content: string) => {
    const res = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, content } : p))
      );
    }
  };

  const handleCommentCountSocket = useCallback((data: { postId: string; count: number }) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === data.postId ? { ...p, commentCount: data.count } : p))
    );
  }, []);

  const handleLikeCountSocket = useCallback((data: { postId: string; count: number }) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === data.postId ? { ...p, likeCount: data.count } : p))
    );
  }, []);

  return (
    <div className="space-y-4" ref={highlightedRef}>
      <CreatePost onCreate={handleCreate} />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button onClick={fetchPosts} className="mt-2 text-sm text-blue-600 hover:underline">Try again</button>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-gray-500">
          <p className="text-lg font-medium">No posts yet</p>
          <p className="text-sm">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} id={`post-${post._id}`}>
              <PostCard
                post={post}
                currentUserId={session?.user?.id}
                onLike={handleLike}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onComment={handleComment}
                highlightComment={highlightPost === post._id ? highlightComment || undefined : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={<div className="space-y-4">{Array.from({ length: 3 }, (_, i) => <div key={i} className="rounded-xl border p-4 space-y-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-4 w-32" /></div>)}</div>}>
      <FeedContent />
    </Suspense>
  );
}
