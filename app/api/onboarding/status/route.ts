import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check 1: Environment variables
    const hasEnvVars =
      !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!hasEnvVars) {
      return NextResponse.json({
        complete: false,
        step: "welcome",
        envVarsSet: false,
        migrationsRun: false,
        userCreated: false,
      });
    }

    const supabase = createServiceClient();

    // Check 2: Migrations (check if required tables exist)
    let migrationsRun = false;
    try {
      const requiredTables = ["profiles", "collections", "items"];

      const tableChecks = await Promise.all(
        requiredTables.map((table) =>
          supabase.from(table).select("*").limit(1),
        ),
      );

      migrationsRun = !tableChecks.some(({ error }) =>
        error?.message?.includes("Could not find the table"),
      );
    } catch (error) {
      console.error("Migration check error:", error);
      migrationsRun = false;
    }

    if (!migrationsRun) {
      return NextResponse.json({
        complete: false,
        step: "migrations",
        envVarsSet: true,
        migrationsRun: false,
        userCreated: false,
      });
    }

    // Check 3: First user created (check profiles table)
    let userCreated = false;
    try {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      userCreated = (count ?? 0) > 0;
    } catch {
      userCreated = false;
    }

    if (!userCreated) {
      return NextResponse.json({
        complete: false,
        step: "create_user",
        envVarsSet: true,
        migrationsRun: true,
        userCreated: false,
      });
    }

    // All checks passed
    return NextResponse.json({
      complete: true,
      step: "complete",
      envVarsSet: true,
      migrationsRun: true,
      userCreated: true,
    });
  } catch (error) {
    console.error("Onboarding status check error:", error);
    return NextResponse.json(
      {
        error: "Failed to check onboarding status",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 },
    );
  }
}
