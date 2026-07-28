import { NextResponse } from "next/server";
import type { Server as IOServer } from "socket.io";

const globalForSocket = globalThis as unknown as {
  socketIO?: { port: number; io: IOServer };
};

export function getIO(): IOServer | null {
  return globalForSocket.socketIO?.io ?? null;
}

export async function GET() {
  if (!globalForSocket.socketIO) {
    const { createServer } = await import("http");
    const { Server } = await import("socket.io");

    const httpServer = createServer();
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
      transports: ["polling", "websocket"],
    });

    io.on("connection", (socket) => {
      const userId = socket.handshake.query.userId as string;
      if (userId) {
        socket.join(userId);
      }

      socket.on("send_message", (data) => {
        const senderId = typeof data.sender === "string" ? data.sender : data.sender?._id;
        const receiverId = typeof data.receiver === "string" ? data.receiver : data.receiver?._id;
        if (receiverId) io.to(receiverId).emit("new_message", data);
        if (senderId) io.to(senderId).emit("new_message", data);
      });

      socket.on("typing", (data) => {
        io.to(data.receiver).emit("typing", { sender: data.sender });
      });

      socket.on("stop_typing", (data) => {
        io.to(data.receiver).emit("stop_typing", { sender: data.sender });
      });

      socket.on("disconnect", () => {});
    });

    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        resolve();
      });
    });

    const address = httpServer.address();
    const port = typeof address === "object" && address ? address.port : 3001;

    globalForSocket.socketIO = { port, io };
  }

  return NextResponse.json({
    port: globalForSocket.socketIO.port,
    url: `http://localhost:${globalForSocket.socketIO.port}`,
  });
}
