"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Send, MoreHorizontal, Trash2, Pencil, Copy, Flag, X } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import type { IComment, IPost, IUser } from "@/types";

interface PostCardProps {
  post: IPost & { author: IUser };
  currentUserId?: string;
  onLike?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onEdit?: (postId: string, content: string) => void;
  onComment?: (postId: string) => void;
  highlightComment?: string;
}

export function PostCard({ post, currentUserId, onLike, onDelete, onEdit, onComment, highlightComment }: PostCardProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<(IComment & { author: IUser })[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentPosting, setCommentPosting] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(post.commentCount);
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmCommentDelete, setConfirmCommentDelete] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const commentSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalCommentCount(post.commentCount);
    setLocalLikeCount(post.likeCount);
  }, [post.commentCount, post.likeCount]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    let socket: Socket | undefined;
    let mounted = true;
    async function connectSocket() {
      try {
        const res = await fetch("/api/socket/io");
        const data = await res.json();
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || data.url;
        socket = io(socketUrl, {
          query: { userId: currentUserId },
          transports: ["polling", "websocket"],
          reconnectionAttempts: 3,
          reconnectionDelay: 1000,
        });
        socket.on("comment_count", (data: { postId: string; count: number }) => {
          if (data.postId === post._id && mounted) setLocalCommentCount(data.count);
        });
        socket.on("like_count", (data: { postId: string; count: number }) => {
          if (data.postId === post._id && mounted) setLocalLikeCount(data.count);
        });
      } catch {}
    }
    connectSocket();
    return () => { mounted = false; if (socket) socket.disconnect(); };
  }, [currentUserId, post._id]);

  useEffect(() => {
    if (highlightComment) {
      setShowComments(true);
      setTimeout(() => {
        const el = document.getElementById(`comment-${highlightComment}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("ring-2", "ring-blue-400", "rounded-xl", "transition-all", "duration-1000");
          setTimeout(() => el.classList.remove("ring-2", "ring-blue-400"), 2000);
        }
      }, 300);
    }
  }, [highlightComment]);

  const toggleComments = async () => {
    if (showComments) { setShowComments(false); return; }
    setShowComments(true);
    if (comments.length > 0) return;
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/comments?postId=${post._id}`);
      if (res.ok) setComments(await res.json());
    } catch {} finally { setCommentsLoading(false); }
  };

  const submitComment = async () => {
    if (!commentContent.trim() || commentPosting) return;
    setCommentPosting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post: post._id, content: commentContent }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments((prev) => [newComment, ...prev]);
        setCommentContent("");
        setLocalCommentCount((c) => c + 1);
        onComment?.(post._id);
      }
    } catch {} finally { setCommentPosting(false); }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        setLocalCommentCount((c) => c - 1);
        toast.success("Comment deleted");
      } else {
        toast.error("Failed to delete comment");
      }
    } catch {
      toast.error("Failed to delete comment");
    } finally {
      setConfirmCommentDelete(null);
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/feed`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
    setMenuOpen(false);
  };

  const handleDeletePost = () => {
    setConfirmDelete(false);
    setMenuOpen(false);
    onDelete?.(post._id);
  };

  if (!post.author) {
    return (
      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm shadow-gray-200/50 dark:border-gray-700/50 dark:bg-gray-900 p-5">
        <div className="flex items-center gap-3">
          <Avatar size="md" fallback="?" />
          <div>
            <p className="text-sm font-semibold text-gray-400">Unknown User</p>
            <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
          </div>
        </div>
        <p className="mt-3 text-sm">{post.content}</p>
        {post.image && (
          <div className="mt-3 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 flex justify-center">
            <img src={post.image} alt="" className="max-h-[500px] w-full object-contain" />
          </div>
        )}
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" />{post.likeCount}</span>
          <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" />{post.commentCount}</span>
        </div>
      </div>
    );
  }

  const isAuthor = currentUserId === (typeof post.author === "string" ? post.author : post.author._id);
  const isLiked = post.likes.includes(currentUserId || "");

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm shadow-gray-200/50 hover:shadow-md transition-all duration-200 dark:border-gray-700/50 dark:bg-gray-900">
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Link href={`/profile/${post.author.username}`} className="flex items-center gap-3 group">
            <Avatar size="md" src={post.author.profilePhoto} fallback={post.author.name} />
            <div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors dark:text-gray-100">{post.author.name}</p>
              <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
            </div>
          </Link>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors dark:hover:bg-gray-800"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-gray-200 bg-white shadow-xl py-1 z-50 dark:border-gray-700 dark:bg-gray-900">
                {isAuthor ? (
                  <>
                    <button
                      onClick={() => { setEditing(true); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Post
                    </button>
                    <button
                      onClick={() => { setConfirmDelete(true); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Post
                    </button>
                  </>
                ) : (
                  <>
                    <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors dark:text-gray-300 dark:hover:bg-gray-800">
                      <Flag className="h-4 w-4" />
                      Report Post
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-blue-400 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:focus:border-blue-500"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={async () => { onEdit?.(post._id, editContent); setEditing(false); }} disabled={!editContent.trim()}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setEditing(false); setEditContent(post.content); }}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{post.content}</p>
        )}

        {post.image && (
          <div className="overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 flex justify-center">
            <img src={post.image} alt="" className="max-h-[500px] w-full object-contain" />
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">{localLikeCount} likes</span>
            <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
            <span className="text-xs text-gray-400">{localCommentCount} comments</span>
          </div>
        </div>

        <hr className="border-gray-100 dark:border-gray-800" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => onLike?.(post._id)}
            className={`flex items-center justify-center gap-2 flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
              isLiked
                ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                : "text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            Like
          </button>
          <button
            onClick={toggleComments}
            className="flex items-center justify-center gap-2 flex-1 rounded-lg py-2 text-sm font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 dark:hover:bg-blue-900/20"
          >
            <MessageCircle className="h-4 w-4" />
            Comment
          </button>
          <button className="hidden sm:flex items-center justify-center gap-2 flex-1 rounded-lg py-2 text-sm font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 dark:hover:bg-blue-900/20">
            <Send className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>

      {showComments && (
        <div ref={commentSectionRef} className="border-t border-gray-100 px-5 py-4 space-y-3 dark:border-gray-800">
          <div className="flex gap-2">
            <Input
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              className="rounded-xl bg-gray-50 dark:bg-gray-800"
            />
            <Button size="icon" onClick={submitComment} disabled={!commentContent.trim() || commentPosting}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {commentsLoading ? (
            <p className="text-xs text-gray-400">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-gray-400">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {comments.map((comment) => {
                const author = typeof comment.author === "string"
                  ? { _id: comment.author, name: "Unknown", username: "", profilePhoto: "" }
                  : comment.author;
                const isCommentAuthor = currentUserId === author._id;
                const isPostAuthor = currentUserId === (typeof post.author === "string" ? post.author : post.author._id);
                const canDeleteComment = isCommentAuthor || isPostAuthor;
                return (
                  <div key={comment._id} id={`comment-${comment._id}`} className="flex gap-2 group">
                    <Avatar size="sm" src={author.profilePhoto} fallback={author.name} />
                    <div className="flex-1">
                      <div className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                          <Link href={`/profile/${author.username}`} className="text-xs font-semibold text-gray-900 hover:text-blue-600 transition-colors dark:text-gray-100">{author.name}</Link>
                          {canDeleteComment && (
                            <button
                              onClick={() => setConfirmCommentDelete(comment._id)}
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete Post</h3>
              <button onClick={() => setConfirmDelete(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={handleDeletePost}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {confirmCommentDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete Comment</h3>
              <button onClick={() => setConfirmCommentDelete(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Are you sure you want to delete this comment?</p>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => setConfirmCommentDelete(null)}>Cancel</Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => handleDeleteComment(confirmCommentDelete)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
