import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import Post from "@/models/Post";
import Notification from "@/models/Notification";
import { getIO } from "@/app/api/socket/io/route";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await req.json();
    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    await connectDB();

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId);
      post.likeCount = Math.max(0, post.likeCount - 1);
      await post.save();
      await Notification.findOneAndDelete({
        sender: userId,
        recipient: post.author,
        post: postId,
        type: "new_like",
      });
      const io = getIO();
      if (io) {
        io.to(post.author.toString()).emit("notification_removed", { post: postId, type: "new_like" });
        io.to(post.author.toString()).emit("like_count", { postId, count: post.likeCount });
      }
    } else {
      post.likes.push(userId);
      post.likeCount += 1;
      await post.save();

      if (post.author.toString() !== userId) {
        const existing = await Notification.findOne({
          sender: userId,
          recipient: post.author,
          post: postId,
          type: "new_like",
        });
        if (!existing) {
          const notification = await Notification.create({
            recipient: post.author,
            sender: userId,
            type: "new_like",
            post: postId,
          });
          const io = getIO();
          if (io) {
            io.to(post.author.toString()).emit("new_notification", notification);
            io.to(post.author.toString()).emit("like_count", { postId, count: post.likeCount });
          }
        } else {
          const io = getIO();
          if (io) {
            io.to(post.author.toString()).emit("like_count", { postId, count: post.likeCount });
          }
        }
      } else {
        const io = getIO();
        if (io) {
          io.to(post.author.toString()).emit("like_count", { postId, count: post.likeCount });
        }
      }
    }

    return NextResponse.json({ liked: !alreadyLiked, likeCount: post.likeCount });
  } catch {
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
