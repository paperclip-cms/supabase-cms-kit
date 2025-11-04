import { createServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabaseServiceClient = createServiceClient();

    const { count, error: profileCountError } = await supabaseServiceClient
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (profileCountError)
      return NextResponse.json(
        { error: profileCountError.message },
        { status: 500 },
      );
    if (count && count > 0) {
      return NextResponse.json(
        { error: "Setup already complete" },
        { status: 403 },
      );
    }

    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 500 },
      );

    const { data: userData, error: userCreationError } =
      await supabaseServiceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (userCreationError)
      return NextResponse.json(
        { error: `Error creating user: ${userCreationError.message}` },
        { status: 500 },
      );

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Setup error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 },
    );
  }
}
