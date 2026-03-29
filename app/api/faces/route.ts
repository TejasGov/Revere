import { NextRequest, NextResponse } from "next/server";
import { addFace, listFaces } from "@/lib/firebase-store";
import { put } from '@vercel/blob';

export async function GET() {
  try {
    return NextResponse.json(await listFaces());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load faces.'
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const file = formData.get("image");
    const name = formData.get("name");
    const relationship = formData.get("relationship");
    
    if (!(file instanceof File) || typeof name !== 'string' || typeof relationship !== 'string') {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const filename = `face-${Date.now()}-${safeName || 'upload.jpg'}`

    const blob = await put(filename, file, {
      access: 'public',
    });

    const newFace = await addFace({
      name,
      relationship,
      imageUrl: blob.url,
    })

    return NextResponse.json(newFace, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
