import { NextResponse } from "next/server";
import { getCurrentUser } from "@/backend/session";
import { generateCsvLaporan } from "@/backend/services/laporan.service";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jenis = searchParams.get("jenis") as "retribusi" | "tunggakan" | "pengaduan";

    if (!["retribusi", "tunggakan", "pengaduan"].includes(jenis)) {
      return NextResponse.json({ error: "Jenis laporan tidak valid" }, { status: 400 });
    }

    const { csv, filename } = await generateCsvLaporan(jenis);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal mengekspor laporan" }, { status: 500 });
  }
}
