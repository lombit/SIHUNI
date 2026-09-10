import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const peran = token?.peran as string;

    // PIMPINAN: hanya diperkenankan mengakses Dasbor dan Laporan
    if (peran === "PIMPINAN") {
      const allowed =
        path === "/" ||
        path.startsWith("/laporan") ||
        path.startsWith("/api/laporan") ||
        path.startsWith("/api/dasbor");

      if (!allowed && !path.startsWith("/api/auth")) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // PETUGAS: tidak bisa mengakses pengaturan / audit log
    if (peran === "PETUGAS") {
      if (path.startsWith("/pengaturan")) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
