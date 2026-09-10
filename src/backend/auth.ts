import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import db from "./db";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 jam
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Akun SIHUNI",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username dan kata sandi wajib diisi");
        }

        const user = await db.user.findUnique({
          where: { username: credentials.username.toLowerCase().trim() },
        });

        if (!user || !user.aktif) {
          throw new Error("Pengguna tidak ditemukan atau akun dinonaktifkan");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error("Kata sandi yang Anda masukkan salah");
        }

        return {
          id: user.id,
          name: user.nama,
          username: user.username,
          peran: user.peran,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.peran = (user as any).peran;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).peran = token.peran;
      }
      return session;
    },
  },
};
