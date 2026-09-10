import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/backend/session";
import { getPerjanjianList, createPerjanjian } from "@/backend/services/perjanjian.service";
import { PerjanjianSchema } from "@/backend/validations/perjanjian.schema";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const q = searchParams.get("q") || undefined;

    const perjanjian = await getPerjanjianList(status, q);
    return NextResponse.json({ data: perjanjian });
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
    const validated = PerjanjianSchema.parse(body);

    const hasil = await createPerjanjian(validated, user.id);

    revalidatePath("/perjanjian");
    revalidatePath("/unit");
    revalidatePath(`/unit/${validated.unitId}`);
    revalidatePath("/penghuni");
    revalidatePath(`/penghuni/${validated.penghuniId}`);
    revalidatePath("/tagihan");
    revalidatePath("/");

    return NextResponse.json({ success: true, perjanjian: hasil }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validasi data gagal" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message || "Gagal membuat perjanjian sewa" }, { status: 400 });
  }
}
