import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import Connection from "@/models/Connection";
import Notification from "@/models/Notification";
import { getIO } from "@/app/api/socket/io/route";

export async function PATCH(req: Request, { params }: { params: Promise<{ action: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await params;
    const { connectionId } = await req.json();

    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await connectDB();

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    if (connection.recipient.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    connection.status = action === "accept" ? "accepted" : "rejected";
    await connection.save();

    if (action === "reject") {
      await Notification.findOneAndDelete({
        $or: [
          { sender: connection.requester, recipient: connection.recipient, type: "connection_request" },
          { sender: connection.recipient, recipient: connection.requester, type: "connection_request" },
        ],
      });
    }

    if (action === "accept") {
      const notification = await Notification.create({
        recipient: connection.requester,
        sender: session.user.id,
        type: "connection_accepted",
      });

      const io = getIO();
      if (io) {
        io.to(connection.requester.toString()).emit("new_notification", notification);
      }
    }

    return NextResponse.json(connection);
  } catch {
    return NextResponse.json({ error: "Failed to update connection" }, { status: 500 });
  }
}
