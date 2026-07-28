import type { Server as SocketIOServer } from "socket.io";

const globalForSocket = globalThis as unknown as {
  socketIO?: { port: number; io: SocketIOServer };
};
