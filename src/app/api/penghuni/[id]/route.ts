import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/backend/session";
import {
  getPenghuniById,
  updatePenghuni,
  deletePenghuni,
} from "@/backend/services/penghuni.service";
import { PenghuniSchema } from "@/backend/validations/penghuni.schema";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const penghuni = await getPenghuniById(id);

    if (!penghuni) {
      return NextResponse.json({ error: "Penghuni tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ data: penghuni });
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
    const validated = PenghuniSchema.parse(body);

    const penghuniBaru = await updatePenghuni(id, validated, user.id);
    return NextResponse.json({ success: true, penghuni: penghuniBaru });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validasi data gagal" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message || "Gagal mengubah data" }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.peran !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya Administrator yang memiliki hak menghapus data penghuni" },
        { status: 403 }
      );
    }

    const { id } = await params;
    await deletePenghuni(id, user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal menghapus data" }, { status: 400 });
  }
}
