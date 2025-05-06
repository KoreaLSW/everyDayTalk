import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import db from "@/app/api/lib/db";

// JWT 타입 확장
type ExtendedJWT = JWT & {
  id: string;
  name?: string;
  email: string;
  picture?: string;
};

// Session 타입 확장
type ExtendedSession = DefaultSession & {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image?: string | null;
  };
};

// NextAuth 타입 확장 (세션에서 user에 id 추가)
declare module "next-auth" {
  interface Session extends ExtendedSession {}
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, account, profile }): Promise<ExtendedJWT> {
      if (account?.provider === "google" && profile) {
        const userId = profile.email && profile.email.split("@")[0];
        const name = profile.name ?? "";
        const email = profile.email as string;
        const picture = (profile as any).picture ?? "";
        console.log("profile", profile);

        try {
          // 1️⃣ DB에서 해당 이메일을 가진 유저가 있는지 확인
          const result = await db.query(
            "SELECT user_id FROM users WHERE email = $1",
            [email]
          );

          if (result.rows.length === 0) {
            // 2️⃣ 새로운 유저라면 DB에 추가
            await db.query(
              "INSERT INTO users (user_id, name, email, image) VALUES ($1, $2, $3, $4)",
              [userId, name, email, picture]
            );
          }
        } catch (error) {
          console.error("Error inserting user into database:", error);
        }

        return {
          ...token,
          id: userId!,
          name,
          email,
          picture,
        };
      }
      return token as ExtendedJWT;
    },

    async session({ session, token }): Promise<ExtendedSession> {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          name: token.name ?? null,
          email: token.email ?? null,
          image: token.picture ?? null,
        },
      };
    },

    async redirect({ url, baseUrl }): Promise<string> {
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
