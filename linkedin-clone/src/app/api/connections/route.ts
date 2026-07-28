import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import Connection from "@/models/Connection";
import Notification from "@/models/Notification";
import { getIO } from "@/app/api/socket/io/route";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "accepted";

    await connectDB();

    const connections = await Connection.find({
      $or: [{ requester: session.user.id }, { recipient: session.user.id }],
      status,
    })
      .populate("requester", "name username profilePhoto headline")
      .populate("recipient", "name username profilePhoto headline")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(connections);
  } catch {
    return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientId } = await req.json();
    if (!recipientId) {
      return NextResponse.json({ error: "recipientId is required" }, { status: 400 });
    }

    if (session.user.id === recipientId) {
      return NextResponse.json({ error: "Cannot connect with yourself" }, { status: 400 });
    }

    await connectDB();

    const existing = await Connection.findOne({
      $or: [
        { requester: session.user.id, recipient: recipientId },
        { requester: recipientId, recipient: session.user.id },
      ],
    });

    if (existing) {
      return NextResponse.json({ error: "Connection already exists" }, { status: 400 });
    }

    const connection = await Connection.create({
      requester: session.user.id,
      recipient: recipientId,
    });

    const notification = await Notification.create({
      recipient: recipientId,
      sender: session.user.id,
      type: "connection_request",
    });

    const io = getIO();
    if (io) {
      io.to(recipientId).emit("new_notification", notification);
    }

    return NextResponse.json(connection, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create connection" }, { status: 500 });
  }
}
