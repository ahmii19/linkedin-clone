import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const bcrypt = await import("bcryptjs").then((m) => m.default);
        const User = await import("@/models/User").then((m) => m.default);
        const { connectDB } = await import("./db");

        await connectDB();

        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.profilePhoto,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.username = user.username ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && typeof token.id === "string") {
        session.user.id = token.id;
        session.user.username = token.username as string;
        try {
          const User = await import("@/models/User").then((m) => m.default);
          const { connectDB } = await import("./db");
          await connectDB();
          const fresh = await User.findById(token.id).lean();
          if (fresh) {
            session.user.name = fresh.name;
            session.user.email = fresh.email;
            session.user.image = fresh.profilePhoto;
            if (fresh.username) session.user.username = fresh.username;
          }
        } catch {
          /* return session with token data as fallback */
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
