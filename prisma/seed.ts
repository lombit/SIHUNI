import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subMonths, addDays, isWeekend } from "date-fns";

const prisma = new PrismaClient();

function hitungSLAHariKerja(tanggalMulai: Date, tingkat: string): Date {
  const targetHari = tingkat === "BERAT" ? 2 : tingkat === "SEDANG" ? 5 : 10;
  let sisa = targetHari;
  let cur = new Date(tanggalMulai);
  while (sisa > 0) {
    cur = addDays(cur, 1);
    if (!isWeekend(cur)) sisa--;
  }
  cur.setHours(16, 0, 0, 0);
  return cur;
}

async function main() {
  console.log("Memulai inisialisasi / seeding data ringkas (5 data)...");

  // Jika database sudah memiliki data dan bukan mode force seed, jangan hapus data
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0 && process.env.FORCE_SEED !== "true") {
      console.log(`✓ Database sudah memiliki ${userCount} akun pengguna. Seeding dilewati untuk menjaga integritas data produksi.`);
      return;
    }
  } catch (e) {
    // Tabel mungkin belum terbentuk, lanjutkan
  }

  // 1. Bersihkan seluruh data sebelumnya
  await prisma.logAudit.deleteMany();
  await prisma.pembayaran.deleteMany();
  await prisma.tagihan.deleteMany();
  await prisma.pengaduan.deleteMany();
  await prisma.perjanjianSewa.deleteMany();
  await prisma.anggotaKeluarga.deleteMany();
  await prisma.penghuni.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.tower.deleteMany();
  await prisma.user.deleteMany();

  console.log("✓ Seluruh data lama berhasil dibersihkan.");

  // 2. Buat 3 Akun Pengguna: admin, petugas, pimpinan
  const passwordHash = await bcrypt.hash("sihuni123", 10);

  const userAdmin = await prisma.user.create({
    data: {
      nama: "Administrator Sistem Rusunawa",
      username: "admin",
      passwordHash,
      peran: "ADMIN",
      aktif: true,
    },
  });

  const userPetugas = await prisma.user.create({
    data: {
      nama: "Petugas Pelayanan Rusunawa",
      username: "petugas",
      passwordHash,
      peran: "PETUGAS",
      aktif: true,
    },
  });

  const userPimpinan = await prisma.user.create({
    data: {
      nama: "Kepala UPTD Rusunawa",
      username: "pimpinan",
      passwordHash,
      peran: "PIMPINAN",
      aktif: true,
    },
  });

  console.log("✓ 3 Akun Pengguna dibuat (admin, petugas, pimpinan - password: sihuni123)");

  // 3. Buat 2 Tower & Tepat 5 Unit Hunian
  // Variasi: 3 Dihuni, 1 Kosong, 1 Perbaikan
  const towerA = await prisma.tower.create({
    data: { nama: "Tower A", jumlahLantai: 5 },
  });

  const towerB = await prisma.tower.create({
    data: { nama: "Tower B", jumlahLantai: 5 },
  });

  const unitA101 = await prisma.unit.create({
    data: {
      towerId: towerA.id,
      lantai: 1,
      nomor: "A-101",
      tipe: "Tipe 24",
      luas: 24.0,
      tarifSewa: 350000,
      status: "DIHUNI",
    },
  });

  const unitA102 = await prisma.unit.create({
    data: {
      towerId: towerA.id,
      lantai: 1,
      nomor: "A-102",
      tipe: "Tipe 24",
      luas: 24.0,
      tarifSewa: 350000,
      status: "DIHUNI",
    },
  });

  const unitA201 = await prisma.unit.create({
    data: {
      towerId: towerA.id,
      lantai: 2,
      nomor: "A-201",
      tipe: "Tipe 24",
      luas: 24.0,
      tarifSewa: 325000,
      status: "DIHUNI",
    },
  });

  const unitB101 = await prisma.unit.create({
    data: {
      towerId: towerB.id,
      lantai: 1,
      nomor: "B-101",
      tipe: "Tipe 24",
      luas: 24.0,
      tarifSewa: 350000,
      status: "KOSONG", // Siap untuk ditest penerbitan sewa baru
    },
  });

  const unitB201 = await prisma.unit.create({
    data: {
      towerId: towerB.id,
      lantai: 2,
      nomor: "B-201",
      tipe: "Tipe 24",
      luas: 24.0,
      tarifSewa: 325000,
      status: "PERBAIKAN", // Siap untuk ditest pengelolaan unit & pemeliharaan
    },
  });

  console.log("✓ 5 Unit Hunian dibuat (3 Dihuni, 1 Kosong, 1 Perbaikan)");

  // 4. Buat Tepat 5 Data Penghuni
  // Penghuni 1 - 3: Menghuni unit aktif
  // Penghuni 4 - 5: Calon penghuni terdaftar (siap disewakan ke unit kosong)
  const penghuni1 = await prisma.penghuni.create({
    data: {
      nik: "3214011508850001",
      nomorKk: "3214012001050001",
      nama: "Asep Sunandar",
      tempatLahir: "Purwakarta",
      tanggalLahir: new Date(1985, 7, 15),
      jenisKelamin: "L",
      statusKawin: "Kawin",
      pekerjaan: "Karyawan Swasta",
      penghasilan: 3500000,
      noHp: "081234567891",
      alamatKtp: "Kp. Krajan RT 02/01 Desa Cikopo, Purwakarta",
      berkasLengkap: true,
      anggota: {
        create: [
          { nama: "Siti Aminah", hubungan: "Istri", usia: 36 },
          { nama: "Rizky Sunandar", hubungan: "Anak", usia: 10 },
        ],
      },
    },
  });

  const penghuni2 = await prisma.penghuni.create({
    data: {
      nik: "3214015003920002",
      nomorKk: "3214012001050002",
      nama: "Siti Nurhaliza",
      tempatLahir: "Purwakarta",
      tanggalLahir: new Date(1992, 2, 10),
      jenisKelamin: "P",
      statusKawin: "Kawin",
      pekerjaan: "Wiraswasta",
      penghasilan: 3200000,
      noHp: "081398765432",
      alamatKtp: "Jl. Veteran No. 45, Nagri Kaler, Purwakarta",
      berkasLengkap: true,
      anggota: {
        create: [
          { nama: "Dedi Supriadi", hubungan: "Suami", usia: 35 },
        ],
      },
    },
  });

  const penghuni3 = await prisma.penghuni.create({
    data: {
      nik: "3214012206880003",
      nomorKk: "3214012001050003",
      nama: "Budi Santoso",
      tempatLahir: "Purwakarta",
      tanggalLahir: new Date(1988, 5, 22),
      jenisKelamin: "L",
      statusKawin: "Kawin",
      pekerjaan: "Buruh Pabrik",
      penghasilan: 2800000,
      noHp: "085712345678",
      alamatKtp: "Babakan Cikao RT 05/02, Purwakarta",
      berkasLengkap: true,
      anggota: {
        create: [
          { nama: "Lilis Suryani", hubungan: "Istri", usia: 34 },
          { nama: "Bima Santoso", hubungan: "Anak", usia: 6 },
        ],
      },
    },
  });

  const penghuni4 = await prisma.penghuni.create({
    data: {
      nik: "3214010811900004",
      nomorKk: "3214012001050004",
      nama: "Cecep Mulyana",
      tempatLahir: "Purwakarta",
      tanggalLahir: new Date(1990, 10, 8),
      jenisKelamin: "L",
      statusKawin: "Kawin",
      pekerjaan: "Ojek Online",
      penghasilan: 2500000,
      noHp: "087812340004",
      alamatKtp: "Sindangkasih RT 01/03, Purwakarta",
      berkasLengkap: true,
      anggota: {
        create: [
          { nama: "Rina Marlina", hubungan: "Istri", usia: 31 },
        ],
      },
    },
  });

  const penghuni5 = await prisma.penghuni.create({
    data: {
      nik: "3214016509950005",
      nomorKk: "3214012001050005",
      nama: "Dewi Lestari",
      tempatLahir: "Purwakarta",
      tanggalLahir: new Date(1995, 8, 25),
      jenisKelamin: "P",
      statusKawin: "Belum Kawin",
      pekerjaan: "Pegawai Honorer",
      penghasilan: 2700000,
      noHp: "089612340005",
      alamatKtp: "Campaka RT 04/02, Purwakarta",
      berkasLengkap: false, // Untuk variasi pengujian verifikasi berkas
    },
  });

  console.log("✓ 5 Data Penghuni dibuat (3 aktif menghuni, 2 pemohon baru)");

  // 5. Buat 3 Perjanjian Sewa Aktif
  const sekarang = new Date();
  const tahunSekarang = sekarang.getFullYear();
  const tglMulai = new Date(tahunSekarang, 0, 1);
  const tglBerakhir = new Date(tahunSekarang, 11, 31);

  const sewa1 = await prisma.perjanjianSewa.create({
    data: {
      nomor: `SPS/${tahunSekarang}/0001`,
      unitId: unitA101.id,
      penghuniId: penghuni1.id,
      tanggalMulai: tglMulai,
      tanggalBerakhir: tglBerakhir,
      tarifBulanan: unitA101.tarifSewa,
      status: "AKTIF",
    },
  });

  const sewa2 = await prisma.perjanjianSewa.create({
    data: {
      nomor: `SPS/${tahunSekarang}/0002`,
      unitId: unitA102.id,
      penghuniId: penghuni2.id,
      tanggalMulai: tglMulai,
      tanggalBerakhir: tglBerakhir,
      tarifBulanan: unitA102.tarifSewa,
      status: "AKTIF",
    },
  });

  const sewa3 = await prisma.perjanjianSewa.create({
    data: {
      nomor: `SPS/${tahunSekarang}/0003`,
      unitId: unitA201.id,
      penghuniId: penghuni3.id,
      tanggalMulai: tglMulai,
      tanggalBerakhir: tglBerakhir,
      tarifBulanan: unitA201.tarifSewa,
      status: "AKTIF",
    },
  });

  console.log("✓ 3 Perjanjian Sewa Aktif dibuat");

  // 6. Buat Tepat 5 Data Tagihan Retribusi (Representasi Lengkap: Lunas, Belum Bayar, Terlambat SP-1 s/d SP-3)
  const bulanSekarang = sekarang.getMonth() + 1;

  // Tagihan 1: Unit A-101 (Asep Sunandar) - LUNAS (Lengkap dengan Bukti Kuitansi & STS Kasda)
  const tagihan1 = await prisma.tagihan.create({
    data: {
      perjanjianId: sewa1.id,
      periodeBulan: bulanSekarang,
      periodeTahun: tahunSekarang,
      jumlah: sewa1.tarifBulanan,
      jatuhTempo: new Date(tahunSekarang, bulanSekarang - 1, 20, 23, 59, 59),
      status: "LUNAS",
    },
  });

  await prisma.pembayaran.create({
    data: {
      tagihanId: tagihan1.id,
      tanggalBayar: new Date(tahunSekarang, bulanSekarang - 1, 10),
      jumlah: tagihan1.jumlah,
      nomorBukti: `BKT/${tahunSekarang}/${bulanSekarang.toString().padStart(2, "0")}/0001`,
      dicatatOleh: userPetugas.id,
      tanggalSetor: new Date(tahunSekarang, bulanSekarang - 1, 12),
      nomorSetoran: `STS-KASDA-${tahunSekarang}-00001`,
    },
  });

  // Tagihan 2: Unit A-102 (Siti Nurhaliza) - BELUM_BAYAR (Bulan ini, siap ditest bayar / kirim WA pengingat)
  await prisma.tagihan.create({
    data: {
      perjanjianId: sewa2.id,
      periodeBulan: bulanSekarang,
      periodeTahun: tahunSekarang,
      jumlah: sewa2.tarifBulanan,
      jatuhTempo: new Date(tahunSekarang, bulanSekarang - 1, 20, 23, 59, 59),
      status: "BELUM_BAYAR",
    },
  });

  // Tagihan 3: Unit A-201 (Budi Santoso) - TERLAMBAT (Bulan ini, lewat jatuh tempo)
  await prisma.tagihan.create({
    data: {
      perjanjianId: sewa3.id,
      periodeBulan: bulanSekarang,
      periodeTahun: tahunSekarang,
      jumlah: sewa3.tarifBulanan,
      jatuhTempo: new Date(tahunSekarang, bulanSekarang - 1, 20, 23, 59, 59),
      status: "TERLAMBAT",
    },
  });

  // Tagihan 4: Unit A-201 (Budi Santoso) - TERLAMBAT (1 Bulan lalu)
  const periodeBulanLalu1 = subMonths(sekarang, 1);
  await prisma.tagihan.create({
    data: {
      perjanjianId: sewa3.id,
      periodeBulan: periodeBulanLalu1.getMonth() + 1,
      periodeTahun: periodeBulanLalu1.getFullYear(),
      jumlah: sewa3.tarifBulanan,
      jatuhTempo: new Date(periodeBulanLalu1.getFullYear(), periodeBulanLalu1.getMonth(), 20, 23, 59, 59),
      status: "TERLAMBAT",
    },
  });

  // Tagihan 5: Unit A-201 (Budi Santoso) - TERLAMBAT (2 Bulan lalu)
  // Menunggak 3 bulan berturut-turut -> Otomatis memicu status SP-3 dan akumulasi tunggakan Rp975.000
  const periodeBulanLalu2 = subMonths(sekarang, 2);
  await prisma.tagihan.create({
    data: {
      perjanjianId: sewa3.id,
      periodeBulan: periodeBulanLalu2.getMonth() + 1,
      periodeTahun: periodeBulanLalu2.getFullYear(),
      jumlah: sewa3.tarifBulanan,
      jatuhTempo: new Date(periodeBulanLalu2.getFullYear(), periodeBulanLalu2.getMonth(), 20, 23, 59, 59),
      status: "TERLAMBAT",
    },
  });

  console.log("✓ 5 Tagihan Retribusi dibuat (1 Lunas, 1 Belum Bayar, 3 Terlambat SP-3)");

  // 7. Buat Tepat 5 Data Pengaduan Gangguan (Variasi Kategori, Status, dan SLA)
  const tglAduan1 = addDays(sekarang, -4); // Overdue SLA (4 hari lalu, tingkat BERAT max 2 hari kerja)
  await prisma.pengaduan.create({
    data: {
      nomorTiket: `ADU-${tahunSekarang}-0001`,
      unitId: unitA101.id,
      namaPelapor: penghuni1.nama,
      noHp: penghuni1.noHp,
      kategori: "AIR_BERSIH",
      tingkat: "BERAT",
      uraian: "Air keran tidak mengalir sama sekali sejak pagi hari di seluruh kamar mandi.",
      tanggalLapor: tglAduan1,
      batasWaktu: hitungSLAHariKerja(tglAduan1, "BERAT"),
      status: "BARU", // Overdue SLA
      petugasId: null,
      tindakan: null,
      tanggalSelesai: null,
    },
  });

  const tglAduan2 = addDays(sekarang, -1);
  await prisma.pengaduan.create({
    data: {
      nomorTiket: `ADU-${tahunSekarang}-0002`,
      unitId: unitA102.id,
      namaPelapor: penghuni2.nama,
      noHp: penghuni2.noHp,
      kategori: "LISTRIK",
      tingkat: "BERAT",
      uraian: "MCB meteran unit meletup dan tercium bau hangus, aliran listrik padam.",
      tanggalLapor: tglAduan2,
      batasWaktu: hitungSLAHariKerja(tglAduan2, "BERAT"),
      status: "DIPROSES",
      petugasId: userPetugas.id,
      tindakan: "Sedang dilakukan pengecekan kabel induk dan menunggu penggantian komponen MCB.",
      tanggalSelesai: null,
    },
  });

  const tglAduan3 = sekarang;
  await prisma.pengaduan.create({
    data: {
      nomorTiket: `ADU-${tahunSekarang}-0003`,
      unitId: unitA201.id,
      namaPelapor: penghuni3.nama,
      noHp: penghuni3.noHp,
      kategori: "SANITASI",
      tingkat: "SEDANG",
      uraian: "Saluran pembuangan air cucian dapur tersumbat dan aliran air lambat.",
      tanggalLapor: tglAduan3,
      batasWaktu: hitungSLAHariKerja(tglAduan3, "SEDANG"),
      status: "BARU",
      petugasId: null,
      tindakan: null,
      tanggalSelesai: null,
    },
  });

  const tglAduan4 = addDays(sekarang, -7);
  await prisma.pengaduan.create({
    data: {
      nomorTiket: `ADU-${tahunSekarang}-0004`,
      unitId: unitA101.id,
      namaPelapor: penghuni1.nama,
      noHp: penghuni1.noHp,
      kategori: "BANGUNAN",
      tingkat: "RINGAN",
      uraian: "Gagang pintu kamar tidur terasa longgar.",
      tanggalLapor: tglAduan4,
      batasWaktu: hitungSLAHariKerja(tglAduan4, "RINGAN"),
      status: "SELESAI",
      petugasId: userPetugas.id,
      tindakan: "Gagang pintu telah dikencangkan dan silinder kunci dilumasi kembali.",
      tanggalSelesai: addDays(tglAduan4, 1),
    },
  });

  const tglAduan5 = addDays(sekarang, -10);
  await prisma.pengaduan.create({
    data: {
      nomorTiket: `ADU-${tahunSekarang}-0005`,
      unitId: unitA102.id,
      namaPelapor: penghuni2.nama,
      noHp: penghuni2.noHp,
      kategori: "KEBERSIHAN",
      tingkat: "RINGAN",
      uraian: "Sampah sisa pekerjaan perbaikan lorong belum dibersihkan.",
      tanggalLapor: tglAduan5,
      batasWaktu: hitungSLAHariKerja(tglAduan5, "RINGAN"),
      status: "SELESAI",
      petugasId: userPetugas.id,
      tindakan: "Petugas kebersihan telah menyapu dan membuang sampah sisa ke tempat penampungan luar.",
      tanggalSelesai: addDays(tglAduan5, 1),
    },
  });

  console.log("✓ 5 Data Pengaduan dibuat (1 Lewat SLA Merah, 1 Diproses, 1 Baru, 2 Selesai)");

  // 8. Log Audit Awal
  await prisma.logAudit.create({
    data: {
      userId: userAdmin.id,
      entitas: "Sistem",
      entitasId: userAdmin.id,
      aksi: "BUAT",
      sesudah: JSON.stringify({ keterangan: "Inisialisasi dataset ringkas 5 sampel per entitas untuk pengujian sistem SIHUNI" }),
    },
  });

  console.log("\n=======================================================");
  console.log("✓ SEED DATA RINGKAS BERHASIL DIJALANKAN!");
  console.log("  - Unit Hunian       : 5 unit (A-101, A-102, A-201, B-101, B-201)");
  console.log("  - Penghuni          : 5 penghuni (Asep, Siti, Budi, Cecep, Dewi)");
  console.log("  - Perjanjian Sewa   : 3 perjanjian aktif");
  console.log("  - Tagihan Retribusi : 5 tagihan (Lunas, Belum Bayar, Terlambat SP-3)");
  console.log("  - Pengaduan Tiket   : 5 tiket (SLA Merah, Diproses, Baru, 2 Selesai)");
  console.log("  - Akun Login        : admin / petugas / pimpinan (sandi: sihuni123)");
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error("Error saat seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
