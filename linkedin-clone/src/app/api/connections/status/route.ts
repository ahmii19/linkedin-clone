import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import Connection from "@/models/Connection";

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

    if (session.user.id === userId) {
      return NextResponse.json({ status: "self" });
    }

    await connectDB();

    const connection = await Connection.findOne({
      $or: [
        { requester: session.user.id, recipient: userId },
        { requester: userId, recipient: session.user.id },
      ],
    }).lean();

    if (!connection) {
      return NextResponse.json({ status: "none" });
    }

    const isRequester = connection.requester.toString() === session.user.id;
    const status = isRequester
      ? connection.status === "pending"
        ? "pending_sent"
        : "accepted"
      : connection.status === "pending"
        ? "pending_received"
        : "accepted";

    return NextResponse.json({
      status,
      connectionId: connection._id.toString(),
      requester: connection.requester.toString(),
      recipient: connection.recipient.toString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to check connection" }, { status: 500 });
  }
}
