"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Search, ChevronLeft } from "lucide-react";
import { io, Socket } from "socket.io-client";
import type { IMessage, IUser } from "@/types";

interface ConversationUser {
  _id: string;
  name: string;
  username: string;
  profilePhoto?: string;
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<ConversationUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ConversationUser | null>(null);
  const [messages, setMessages] = useState<(IMessage & { sender: IUser; receiver: IUser })[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showMobileList, setShowMobileList] = useState(true);

  useEffect(() => {
    fetch("/api/connections?status=accepted")
      .then((r) => r.json())
      .then((conns) => {
        const connectedUsers = conns.map((c: { requester: ConversationUser; recipient: ConversationUser }) =>
          c.requester._id === session?.user?.id ? c.recipient : c.requester
        );
        setUsers(connectedUsers || []);
        setLoading(false);
      });
  }, [session]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    let s: Socket;
    async function connectSocket() {
      const res = await fetch("/api/socket/io");
      const data = await res.json();
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || data.url;
      s = io(socketUrl, { query: { userId }, transports: ["polling", "websocket"], reconnectionAttempts: 5, reconnectionDelay: 1000 });
      setSocket(s);
    }
    connectSocket();
    return () => { if (s) s.disconnect(); };
  }, [session]);

  useEffect(() => {
    if (!socket || !selectedUser) return;
    const handler = (data: IMessage & { sender: IUser; receiver: IUser }) => {
      const senderId = typeof data.sender === "string" ? data.sender : data.sender?._id;
      const receiverId = typeof data.receiver === "string" ? data.receiver : data.receiver?._id;
      if (
        (senderId === selectedUser._id && receiverId === session?.user?.id) ||
        (senderId === session?.user?.id && receiverId === selectedUser._id)
      ) {
        setMessages((prev) => prev.some((m) => m._id === data._id) ? prev : [...prev, data]);
      }
    };
    socket.on("new_message", handler);
    return () => { socket.off("new_message", handler); };
  }, [socket, selectedUser, session]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const selectConversation = async (user: ConversationUser) => {
    setSelectedUser(user);
    setShowMobileList(false);
    const res = await fetch(`/api/messages?userId=${user._id}`);
    if (res.ok) setMessages(await res.json());
  };

  const sendMessage = async () => {
    if (!content.trim() || !selectedUser) return;
    const res = await fetch("/api/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: selectedUser._id, content }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      socket?.emit("send_message", msg);
      setContent("");
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/50 dark:bg-gray-900 overflow-hidden">
      <div className={`w-full md:w-80 shrink-0 border-r border-gray-100 dark:border-gray-800 flex flex-col ${selectedUser && !showMobileList ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search conversations..." className="w-full h-10 rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white transition-all dark:border-gray-700 dark:bg-gray-800" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="space-y-2 p-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
          ) : users.length === 0 ? (
            <p className="p-4 text-sm text-gray-500 text-center">No connections yet</p>
          ) : (
            users.map((user) => (
              <button
                key={user._id}
                onClick={() => selectConversation(user)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selectedUser?._id === user._id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
              >
                <Avatar size="sm" src={user.profilePhoto} fallback={user.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col ${!selectedUser || showMobileList ? "hidden md:flex" : "flex"}`}>
        {selectedUser ? (
          <>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <button className="md:hidden p-1 text-gray-500" onClick={() => { setShowMobileList(true); setSelectedUser(null); }}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <Avatar size="sm" src={selectedUser.profilePhoto} fallback={selectedUser.name} />
              <div>
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{selectedUser.name}</span>
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-500"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Online</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg._id} className={`flex ${msg.sender._id === session?.user?.id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.sender._id === session?.user?.id
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-bl-md"
                  }`}>
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender._id === session?.user?.id ? "text-blue-200" : "text-gray-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex gap-2">
                <Input
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    socket?.emit("typing", { sender: session?.user?.id, receiver: selectedUser._id });
                  }}
                  placeholder="Type a message..."
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="rounded-xl bg-gray-50 dark:bg-gray-800"
                />
                <Button size="icon" onClick={sendMessage} disabled={!content.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Send className="h-6 w-6 text-gray-400" />
              </div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Select a conversation</p>
              <p className="text-sm mt-1">Choose a connection to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
