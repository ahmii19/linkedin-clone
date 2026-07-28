"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, AtSign, Mail, Lock, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) router.push("/feed");
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }
    const signInRes = await signIn("credentials", { email, password, redirect: false });
    if (signInRes?.error) {
      setError("Account created but login failed.");
      setLoading(false);
    } else {
      router.push("/feed");
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white shadow-xl shadow-gray-200/50 dark:border-gray-700/50 dark:bg-gray-900 dark:shadow-none p-8">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create your account</h2>
        <p className="text-sm text-gray-500 mt-1">Join the professional network</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:border-red-800/30">{error}</p>
        )}
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required className="pl-10 h-12 rounded-xl" />
        </div>
        <div className="relative">
          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required className="pl-10 h-12 rounded-xl" />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 h-12 rounded-xl" />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10 h-12 rounded-xl" />
        </div>
        <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">Sign in</Link>
      </p>
    </div>
  );
}
