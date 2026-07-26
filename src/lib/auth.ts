import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "crestyve-default-development-secret-key-safe-to-fallback-locally",
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) return null;

        // TODO: Replace with database lookup when Prisma is connected
        // const user = await prisma.user.findUnique({ where: { email } });
        // if (user && await bcrypt.compare(password, user.password)) { ... }

        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@crestyve.com";
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "crestyve2024";

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          return {
            id: "1",
            name: "Admin",
            email: ADMIN_EMAIL,
            role: "ADMIN",
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
