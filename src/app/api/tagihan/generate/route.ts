import { NextResponse } from "next/server";
import { getCurrentUser } from "@/backend/session";
import { buatTagihanBulanan } from "@/backend/services/tagihan.service";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.peran !== "ADMIN" && user.peran !== "PETUGAS")) {
      return NextResponse.json({ error: "Tidak memiliki hak akses" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const sekarang = new Date();
    const bulan = body.bulan || sekarang.getMonth() + 1;
    const tahun = body.tahun || sekarang.getFullYear();

    const hasil = await buatTagihanBulanan(bulan, tahun, user.id);

    return NextResponse.json({
      success: true,
      dibuat: hasil.dibuat,
      dilewati: hasil.dilewati,
      totalAktif: hasil.totalAktif,
      bulan,
      tahun,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal membuat tagihan bulanan" },
      { status: 500 }
    );
  }
}
