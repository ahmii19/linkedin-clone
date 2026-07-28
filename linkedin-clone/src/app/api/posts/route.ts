import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/User";

export async function GET() {
  try {
    await connectDB();
    let posts = await Post.find()
      .populate("author", "name username profilePhoto headline")
      .sort({ createdAt: -1 })
      .lean();
    posts = posts.filter((post) => post.author != null);
    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, image } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    await connectDB();

    const post = await Post.create({
      author: session.user.id,
      content,
      image,
    });

    const populated = await Post.findById(post._id)
      .populate("author", "name username profilePhoto headline")
      .lean();

    return NextResponse.json(populated, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
