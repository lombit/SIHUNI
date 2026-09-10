import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/backend/session";
import { bayarTagihan } from "@/backend/services/tagihan.service";
import { BayarSchema } from "@/backend/validations/tagihan.schema";

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
    const validated = BayarSchema.parse(body);

    const hasil = await bayarTagihan(id, validated, user.id);
    return NextResponse.json({ success: true, ...hasil });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validasi data gagal" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Gagal mencatat pembayaran" },
      { status: 400 }
    );
  }
}
