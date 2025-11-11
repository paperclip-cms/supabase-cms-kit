import { createClient } from "@/lib/supabase/server";
import { itemSchema } from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ collectionSlug: string }> },
) {
  try {
    const { collectionSlug } = await context.params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get collection
    const { data: collection, error: collectionError } = await supabase
      .from("collections")
      .select("id, slug, label, config")
      .eq("slug", collectionSlug)
      .single();

    if (collectionError || !collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = itemSchema.parse(body);

    const itemData = {
      ...(validatedData.id ? { id: validatedData.id } : {}), // Include ID if updating
      collection_id: collection.id,
      slug: validatedData.slug,
      title: validatedData.title,
      content: validatedData.content,
      user_id: user.id,
      author: validatedData.author || null,
      date: validatedData.date || null,
      tags: validatedData.tags,
      cover: validatedData.cover || null,
      published_at: validatedData.published ? new Date().toISOString() : null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      item_data: validatedData.item_data as any,
    };

    // Upsert: insert if new, update if ID is provided
    const { data: item, error: itemError } = await supabase
      .from("items")
      .upsert(itemData)
      .select()
      .single();

    if (itemError) {
      console.error("Error saving item:", itemError);
      return NextResponse.json(
        { error: itemError.message || "Failed to save item" },
        { status: 400 },
      );
    }

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error in POST items API:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
