const { execSync } = require("child_process");

// Fallback otomatis jika Vercel menggunakan nama POSTGRES_PRISMA_URL atau POSTGRES_URL
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
}

if (!process.env.DATABASE_URL) {
  console.error("======================================================================");
  console.error("GALAT VERCEL: Variabel DATABASE_URL belum diatur atau bernilai kosong!");
  console.error("======================================================================");
  console.error("Cara memperbaikinya:");
  console.error("1. Buka dashboard project di https://vercel.com");
  console.error("2. Masuk ke tab Settings -> Environment Variables");
  console.error("3. Tambahkan variabel baru:");
  console.error("   - Key  : DATABASE_URL");
  console.error("   - Value: (URL koneksi PostgreSQL dari Vercel Postgres / Supabase / Neon)");
  console.error("   - Environment: Centang Production, Preview, dan Development");
  console.error("4. Simpan, lalu lakukan Redeploy!");
  console.error("======================================================================");
  process.exit(1);
}

try {
  console.log("-> 1. Menjalankan prisma generate...");
  execSync("npx prisma generate", { stdio: "inherit", env: process.env });

  console.log("-> 2. Melakukan sinkronisasi skema database (prisma db push)...");
  execSync("npx prisma db push --accept-data-loss", { stdio: "inherit", env: process.env });

  console.log("-> 3. Melakukan inisialisasi akun & data sampel awal (seed)...");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit", env: process.env });

  console.log("-> 4. Membangun aplikasi Next.js (next build)...");
  execSync("npx next build", { stdio: "inherit", env: process.env });

  console.log("✓ Build Vercel berhasil diselesaikan!");
} catch (error) {
  console.error("Build gagal:", error);
  process.exit(1);
}
