import NextAuth from "next-auth";
import { authConfig } from "./config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // FIX: Cast adapter to 'any' to resolve type mismatch with custom User model (role field)
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  trustHost: true,
});