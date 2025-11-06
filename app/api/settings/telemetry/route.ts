import { createServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { enabled } = await request.json();

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request body. 'enabled' must be a boolean" },
        { status: 400 },
      );
    }

    const supabase = createServiceClient();

    // Update or insert the telemetry setting
    const { error } = await supabase.from("paperclip_settings").upsert(
      {
        setting_key: "telemetry",
        setting_value: enabled.toString(),
      },
      {
        onConflict: "setting_key",
      },
    );

    if (error) {
      console.error("Error updating telemetry setting:", error);
      return NextResponse.json(
        { error: "Failed to update telemetry setting" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telemetry setting update error:", error);
    return NextResponse.json(
      { error: "Failed to update telemetry setting" },
      { status: 500 },
    );
  }
}
