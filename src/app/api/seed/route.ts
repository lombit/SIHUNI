import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== "sihuni123") {
    return NextResponse.json(
      { error: "Akses ditolak. Sertakan parameter ?secret=sihuni123" },
      { status: 403 }
    );
  }

  try {
    const { stdout } = await execAsync("npx tsx prisma/seed.ts", {
      env: { ...process.env, FORCE_SEED: "true" },
    });
    return NextResponse.json({
      success: true,
      message: "Database berhasil di-seed dengan 5 sampel data PKP!",
      output: stdout,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
