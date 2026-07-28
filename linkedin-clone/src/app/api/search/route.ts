import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q?.trim()) {
      return NextResponse.json([]);
    }

    await connectDB();

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { username: { $regex: q, $options: "i" } },
      ],
    })
      .select("name username profilePhoto headline")
      .limit(20)
      .lean();

    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
