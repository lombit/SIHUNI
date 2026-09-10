import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/backend/session";
import { akhiriPerjanjian } from "@/backend/services/perjanjian.service";

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
    const hasil = await akhiriPerjanjian(id, user.id);

    revalidatePath("/perjanjian");
    revalidatePath("/unit");
    revalidatePath(`/unit/${hasil.unitId}`);
    revalidatePath("/penghuni");
    revalidatePath(`/penghuni/${hasil.penghuniId}`);
    revalidatePath("/tagihan");
    revalidatePath("/");

    return NextResponse.json({ success: true, perjanjian: hasil });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal mengakhiri perjanjian sewa" },
      { status: 400 }
    );
  }
}
