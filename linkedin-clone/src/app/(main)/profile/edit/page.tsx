"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { X, Plus, Settings, Camera } from "lucide-react";
import toast from "react-hot-toast";
import type { IUser } from "@/types";

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    username: "",
    bio: "",
    headline: "",
    location: "",
    skills: [""],
    experience: [{ title: "", company: "", startDate: "", endDate: "", current: false, description: "" }],
    education: [{ school: "", degree: "", field: "", startDate: "", endDate: "" }],
  });
  const [existingCoverPhoto, setExistingCoverPhoto] = useState<string | null>(null);

  const validateImage = (file: File, maxSizeMB = 5): string | null => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) return "Only JPG, JPEG, PNG, and WEBP files are allowed";
    if (file.size > maxSizeMB * 1024 * 1024) return `File size must be less than ${maxSizeMB}MB`;
    return null;
  };

  useEffect(() => {
    async function fetchUser() {
      if (!session?.user?.id) return;
      const res = await fetch(`/api/users/me`);
      if (res.ok) {
        const user: IUser = await res.json();
        setForm({
          name: user.name || "",
          username: user.username || "",
          bio: user.bio || "",
          headline: user.headline || "",
          location: user.location || "",
          skills: user.skills?.length ? user.skills : [""],
          experience: user.experience?.length
            ? user.experience.map((e) => ({ ...e, endDate: e.endDate || "", description: e.description || "" }))
            : [{ title: "", company: "", startDate: "", endDate: "", current: false, description: "" }],
          education: user.education?.length
            ? user.education.map((e) => ({ ...e, endDate: e.endDate || "" }))
            : [{ school: "", degree: "", field: "", startDate: "", endDate: "" }],
        });
        setExistingCoverPhoto(user.coverPhoto || null);
      }
      setLoading(false);
    }
    fetchUser();
  }, [session]);

  const handleProfileImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validateImage(file);
    if (error) { toast.error(error); e.target.value = ""; return; }
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validateImage(file);
    if (error) { toast.error(error); e.target.value = ""; return; }
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let profilePhoto: string | undefined;
      if (profileImageFile) {
        const fd = new FormData();
        fd.append("file", profileImageFile);
        const uploadRes = await fetch("/api/upload/profile", { method: "POST", body: fd });
        if (!uploadRes.ok) throw new Error("Image upload failed");
        const uploadData = await uploadRes.json();
        profilePhoto = uploadData.url;
      }
      let coverPhoto: string | undefined;
      if (coverImageFile) {
        const fd = new FormData();
        fd.append("file", coverImageFile);
        const uploadRes = await fetch("/api/upload/cover", { method: "POST", body: fd });
        if (!uploadRes.ok) throw new Error("Cover upload failed");
        const uploadData = await uploadRes.json();
        coverPhoto = uploadData.url;
      }
      const res = await fetch("/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ...(profilePhoto ? { profilePhoto } : {}),
          ...(coverPhoto ? { coverPhoto } : {}),
          skills: form.skills.filter(Boolean),
          experience: form.experience.filter((e) => e.title && e.company),
          education: form.education.filter((e) => e.school && e.degree),
        }),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      await update();
      toast.success("Profile updated successfully");
      router.push(`/profile/${form.username}`);
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileImageFile(null);
    setProfileImagePreview(null);
    setCoverImageFile(null);
    setCoverImagePreview(null);
    router.back();
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  const avatarSrc = profileImagePreview || session?.user?.image || undefined;
  const displayCover = coverImagePreview || existingCoverPhoto || undefined;

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-700/50 dark:bg-gray-900 overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Profile</h1>
        </div>
      </div>
      <div className="p-5">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative h-40 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 overflow-hidden"
            style={displayCover ? { backgroundImage: `url(${displayCover})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          >
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 hover:bg-black/30 transition-colors group">
              <span className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                <Camera className="h-4 w-4" />
                {existingCoverPhoto || coverImagePreview ? "Change Cover" : "Add Cover"}
              </span>
              <input ref={coverInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleCoverImageSelect} />
            </label>
            {coverImagePreview && (
              <button type="button" onClick={(e) => { e.stopPropagation(); setCoverImageFile(null); setCoverImagePreview(null); }} className="absolute top-2 right-2 rounded-full bg-gray-900/60 p-1.5 text-white hover:bg-gray-900/80 transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Avatar size="xl" src={avatarSrc} fallback={form.name} />
            <label className="cursor-pointer text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
              Change Photo
              <input ref={profileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleProfileImageSelect} />
            </label>
            {profileImagePreview && (
              <button type="button" onClick={() => { setProfileImageFile(null); setProfileImagePreview(null); }} className="text-sm text-red-500 hover:text-red-700 transition-colors">
                Remove
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Headline</label>
            <Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="e.g. Software Engineer at Company" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. San Francisco, CA" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="rounded-xl" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Skills</label>
            <div className="space-y-2">
              {form.skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={skill} onChange={(e) => {
                    const skills = [...form.skills];
                    skills[i] = e.target.value;
                    setForm({ ...form, skills });
                  }} placeholder="e.g. JavaScript" />
                  {form.skills.length > 1 && (
                    <button type="button" onClick={() => setForm({ ...form, skills: form.skills.filter((_, j) => j !== i) })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setForm({ ...form, skills: [...form.skills, ""] })} className="mt-2 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              <Plus className="h-4 w-4" /> Add skill
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
