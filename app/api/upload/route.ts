import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      if (authError) console.error(authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Allow reasonable batch uploads (no hard limit - let storage handle it)
    if (files.length > 50) {
      return NextResponse.json(
        { error: "Too many files in single request (max 50)" },
        { status: 400 },
      );
    }

    const uploadedFiles = [];
    const errors = [];

    for (const file of files) {
      try {
        // Get file extension from original filename
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin";

        // Generate unique file path with original extension
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage with actual content type
        const { data, error } = await supabase.storage
          .from("collection-media")
          .upload(fileName, file, {
            contentType: file.type || "application/octet-stream",
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          errors.push({ file: file.name, error: error.message });
        } else {
          // Build public URL directly (no additional API call needed for public buckets)
          const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/collection-media/${data.path}`;

          uploadedFiles.push({
            name: file.name,
            path: data.path,
            url: publicUrl,
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        errors.push({ file: file.name, error: errorMessage });
      }
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
