import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/backend/session";
import { getPengaduanById, updatePengaduan } from "@/backend/services/pengaduan.service";
import { UpdateAduanSchema } from "@/backend/validations/pengaduan.schema";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const aduan = await getPengaduanById(id);

    if (!aduan) {
      return NextResponse.json({ error: "Pengaduan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: aduan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
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
    const validated = UpdateAduanSchema.parse(body);

    const aduanBaru = await updatePengaduan(id, validated, user.id);
    return NextResponse.json({ success: true, pengaduan: aduanBaru });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validasi data gagal" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui pengaduan" },
      { status: 400 }
    );
  }
}
