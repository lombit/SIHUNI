import { NextResponse } from "next/server";
import { getCurrentUser } from "@/backend/session";
import { updateUnitStatus } from "@/backend/services/unit.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.peran !== "ADMIN" && user.peran !== "PETUGAS")) {
      return NextResponse.json({ error: "Tidak memiliki hak akses" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const unitBaru = await updateUnitStatus(id, status, user.id);

    return NextResponse.json({ success: true, unit: unitBaru });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Terjadi kesalahan" }, { status: 400 });
  }
}
