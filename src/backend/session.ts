import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { Peran } from "@/types";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as {
    id: string;
    name: string;
    username: string;
    peran: Peran;
  };
}

export async function requireAuth(allowedRoles?: Peran[]) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  if (allowedRoles && !allowedRoles.includes(user.peran)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
