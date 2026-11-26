import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { checkDistributedRateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/security";

// Emergency fallback credentials only if DB has no matching staff row
const FALLBACK_HASH = bcrypt.hashSync(process.env.DEMO_PASSWORD || "Priya@2026#CRM", 10);

const FALLBACK_USERS = [
  {
    id: "1",
    name: "Arjun (Owner)",
    email: process.env.OWNER_EMAIL || "owner@floindia.com",
    passwordHash: process.env.OWNER_PASSWORD_HASH || FALLBACK_HASH,
    role: "OWNER",
  },
  {
    id: "1b",
    name: "Priya (Owner)",
    email: "owner@priya.com",
    passwordHash: process.env.OWNER_PASSWORD_HASH || FALLBACK_HASH,
    role: "OWNER",
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "MFA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = sanitizeText(credentials.email).toLowerCase();
        const rate = await checkDistributedRateLimit(`login:${email}`, 15, 900);
        if (!rate.allowed) {
          throw new Error("Too many failed attempts. Please try again in 15 minutes.");
        }

        // 1. Primary: DB-backed Staff authentication
        const dbStaff = await prisma.staff.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, passwordHash: true, role: true },
        });

        let matchedUser: { id: string; name: string; email: string; role: string; passwordHash: string } | null = null;

        if (dbStaff && dbStaff.email && dbStaff.passwordHash) {
          matchedUser = {
            id: String(dbStaff.id),
            name: dbStaff.name,
            email: dbStaff.email,
            role: dbStaff.role,
            passwordHash: dbStaff.passwordHash,
          };
        } else {
          // 2. Fallback for initial bootstrap
          const fb = FALLBACK_USERS.find((u) => u.email.toLowerCase() === email);
          if (fb) matchedUser = fb;
        }

        if (!matchedUser) return null;

        const isPasswordValid = bcrypt.compareSync(credentials.password, matchedUser.passwordHash);
        if (!isPasswordValid) return null;

        // Optional MFA enforcement when MFA_REQUIRED=true
        if (process.env.MFA_REQUIRED === "true") {
          const expectedOtp = process.env.MFA_STATIC_CODE;
          if (!credentials.otp || (expectedOtp && credentials.otp !== expectedOtp)) {
            throw new Error("Invalid MFA / OTP code");
          }
        }

        return {
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "priya-boutique-crm-fallback-secret-change-in-env",
};
