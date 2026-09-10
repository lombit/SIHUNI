import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/backend/session";
import { createPengaduan, getPengaduanList } from "@/backend/services/pengaduan.service";
import { PengaduanSchema } from "@/backend/validations/pengaduan.schema";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const kategori = searchParams.get("kategori") || undefined;
    const q = searchParams.get("q") || undefined;

    const aduan = await getPengaduanList({ status, kategori, q });
    return NextResponse.json({ data: aduan });
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
    const validated = PengaduanSchema.parse(body);

    const pengaduanBaru = await createPengaduan(validated, user.id);
    return NextResponse.json({ success: true, pengaduan: pengaduanBaru }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validasi data gagal" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Gagal membuat pengaduan" },
      { status: 400 }
    );
  }
}
