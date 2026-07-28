import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import Message from "@/models/Message";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    await connectDB();

    const messages = await Message.find({
      $or: [
        { sender: session.user.id, receiver: userId },
        { sender: userId, receiver: session.user.id },
      ],
    })
      .populate("sender", "name username profilePhoto")
      .populate("receiver", "name username profilePhoto")
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, content } = await req.json();
    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ error: "receiverId and content are required" }, { status: 400 });
    }

    await connectDB();

    const message = await Message.create({
      sender: session.user.id,
      receiver: receiverId,
      content,
    });

    const populated = await Message.findById(message._id)
      .populate("sender", "name username profilePhoto")
      .populate("receiver", "name username profilePhoto")
      .lean();

    return NextResponse.json(populated, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
