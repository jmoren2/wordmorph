import bcrypt from "bcryptjs";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "./prisma";

export const authOptions: AuthOptions = {
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        });
        if (
          !user ||
          !credentials?.password ||
          !bcrypt.compareSync(credentials.password, user.password)
        ) {
          throw new Error("Invalid email or password");
        }
        return user;
        // if (
        //   credentials?.email === "test@example.com" &&
        //   credentials?.password === "password123"
        // ) {
        //   return { id: "1", name: "Test User", email: credentials.email };
        // }
        // throw new Error("Invalid email or password");
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
