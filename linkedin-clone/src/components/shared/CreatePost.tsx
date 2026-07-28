"use client";

import { useState, useRef } from "react";
import { Image, X, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface CreatePostProps {
  onCreate: (content: string, image?: string) => Promise<void>;
}

export function CreatePost({ onCreate }: CreatePostProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [focused, setFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFile = useRef<File | null>(null);

  const handleSubmit = async () => {
    if (!content.trim() || posting) return;
    setPosting(true);
    try {
      let imageUrl: string | undefined;
      if (selectedFile.current) {
        const formData = new FormData();
        formData.append("file", selectedFile.current);
        const uploadRes = await fetch("/api/upload/post", { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("Image upload failed");
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }
      await onCreate(content, imageUrl);
      setContent("");
      setImagePreview(null);
      selectedFile.current = null;
      toast.success("Post created successfully");
    } catch {
      toast.error("Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, and WEBP files are allowed");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      e.target.value = "";
      return;
    }
    selectedFile.current = file;
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    selectedFile.current = null;
  };

  return (
    <div id="create-post" className="rounded-2xl border border-gray-200/80 bg-white shadow-sm shadow-gray-200/50 dark:border-gray-700/50 dark:bg-gray-900 p-4">
      <div className="flex gap-3">
        <Avatar size="md" src={session?.user?.image || undefined} fallback={session?.user?.name || "U"} />
        <div className="flex-1">
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            rows={focused || content ? 3 : 1}
            className="w-full resize-none rounded-xl border-0 bg-transparent px-0 py-2 text-sm outline-none placeholder:text-gray-400 focus:ring-0 dark:text-gray-100"
          />

          {imagePreview && (
            <div className="relative mb-3 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
              <img src={imagePreview} alt="Preview" className="max-h-48 w-full object-contain" />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 rounded-full bg-gray-900/60 p-1.5 text-white hover:bg-gray-900/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {(focused || content || imagePreview) && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors dark:hover:bg-blue-900/20"
              >
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">Media</span>
              </button>
              <Button size="sm" onClick={handleSubmit} disabled={!content.trim() || posting}>
                {posting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                {posting ? "Posting..." : "Post"}
              </Button>
            </div>
          )}
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleImageSelect} />
    </div>
  );
}
