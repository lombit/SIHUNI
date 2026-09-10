import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/backend/session";
import { getPenghuniList, createPenghuni } from "@/backend/services/penghuni.service";
import { PenghuniSchema } from "@/backend/validations/penghuni.schema";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    const penghuni = await getPenghuniList(q);
    return NextResponse.json({ data: penghuni });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.peran !== "ADMIN" && user.peran !== "PETUGAS")) {
      return NextResponse.json({ error: "Tidak memiliki hak akses" }, { status: 403 });
    }

    const body = await req.json();
    const validated = PenghuniSchema.parse(body);

    const penghuniBaru = await createPenghuni(validated, user.id);
    return NextResponse.json({ success: true, penghuni: penghuniBaru }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validasi data gagal" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message || "Gagal menyimpan data" }, { status: 400 });
  }
}
