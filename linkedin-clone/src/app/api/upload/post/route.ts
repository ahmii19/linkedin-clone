import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { imagekit } from "@/lib/upload";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const uploadFile = new File([bytes], file.name, { type: file.type });

    const result = await imagekit.files.upload({
      file: uploadFile,
      fileName: file.name,
      folder: "/linkedin-clone/posts",
    });

    return NextResponse.json({ url: result.url });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
