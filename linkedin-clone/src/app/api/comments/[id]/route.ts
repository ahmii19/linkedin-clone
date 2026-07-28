import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import Notification from "@/models/Notification";
import { getIO } from "@/app/api/socket/io/route";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const comment = await Comment.findById(id);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const post = await Post.findById(comment.post).select("author");
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    const isCommentAuthor = comment.author.toString() === session.user.id;
    const isPostOwner = post.author.toString() === session.user.id;
    if (!isCommentAuthor && !isPostOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedPost = await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } }, { new: true });
    await Comment.findByIdAndDelete(id);
    const deleted = await Notification.findOneAndDelete({
      comment: id,
      type: "new_comment",
    });
    if (deleted) {
      const io = getIO();
      if (io) {
        io.to(post.author.toString()).emit("notification_removed", { comment: id, type: "new_comment" });
      }
    }
    if (updatedPost) {
      const io = getIO();
      if (io) {
        io.to(post.author.toString()).emit("comment_count", { postId: comment.post.toString(), count: updatedPost.commentCount });
      }
    }

    return NextResponse.json({ message: "Comment deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
