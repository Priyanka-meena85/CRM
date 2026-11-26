import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { checkRateLimit, sanitizeText } from "@/lib/security";

// Pre-hashed credentials (bcrypt) — override via env/DB in production
const DEFAULT_HASH = bcrypt.hashSync(process.env.DEMO_PASSWORD || "Priya@2026#CRM", 10);

const USERS = [
  {
    id: "1",
    name: "Priya (Owner)",
    email: process.env.OWNER_EMAIL || "owner@priya.com",
    passwordHash: process.env.OWNER_PASSWORD_HASH || DEFAULT_HASH,
    role: "OWNER",
  },
  {
    id: "2",
    name: "Raju (Staff)",
    email: "raju@priya.com",
    passwordHash: DEFAULT_HASH,
    role: "STAFF",
  },
  {
    id: "3",
    name: "Pooja (Staff)",
    email: "pooja@priya.com",
    passwordHash: DEFAULT_HASH,
    role: "STAFF",
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
        const rate = checkRateLimit(`login:${email}`, 15, 15 * 60 * 1000);
        if (!rate.allowed) {
          throw new Error("Bahut zyada galat attempts! 15 minute baad try karein.");
        }

        const user = USERS.find((u) => u.email.toLowerCase() === email);
        if (!user) return null;

        const isPasswordValid = bcrypt.compareSync(credentials.password, user.passwordHash);
        if (!isPasswordValid) return null;

        // Optional MFA enforcement when MFA_REQUIRED=true
        if (process.env.MFA_REQUIRED === "true") {
          const expectedOtp = process.env.MFA_STATIC_CODE;
          if (!credentials.otp || (expectedOtp && credentials.otp !== expectedOtp)) {
            throw new Error("Invalid MFA / OTP code");
          }
        }

        return { id: user.id, name: user.name, email: user.email, role: user.role };
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
    maxAge: 12 * 60 * 60, // 12 hours
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NEXTAUTH_URL?.startsWith("https://")
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: Boolean(process.env.NEXTAUTH_URL?.startsWith("https://")),
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "priya-boutique-crm-fallback-secret-change-in-env",
};
