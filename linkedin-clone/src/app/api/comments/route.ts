import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import Notification from "@/models/Notification";
import { getIO } from "@/app/api/socket/io/route";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    await connectDB();
    const comments = await Comment.find({ post: postId })
      .populate("author", "name username profilePhoto")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(comments);
  } catch {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { post, content } = await req.json();
    if (!post || !content?.trim()) {
      return NextResponse.json({ error: "post and content are required" }, { status: 400 });
    }

    await connectDB();

    const comment = await Comment.create({
      post,
      author: session.user.id,
      content,
    });

    const postDoc = await Post.findByIdAndUpdate(post, { $inc: { commentCount: 1 } }, { new: true });

    const io = getIO();
    if (io && postDoc) {
      io.to(postDoc.author.toString()).emit("comment_count", { postId: post, count: postDoc.commentCount });
    }

    if (postDoc && postDoc.author.toString() !== session.user.id) {
      const notification = await Notification.create({
        recipient: postDoc.author,
        sender: session.user.id,
        type: "new_comment",
        post,
        comment: comment._id,
      });
      if (io) {
        io.to(postDoc.author.toString()).emit("new_notification", notification);
      }
    }

    const populated = await Comment.findById(comment._id)
      .populate("author", "name username profilePhoto")
      .lean();

    return NextResponse.json(populated, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
