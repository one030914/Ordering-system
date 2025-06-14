import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
// @ts-ignore
import type { NextAuthConfig } from "next-auth";

const params = {
    prompt: "consent",
    access_type: "offline",
    response_type: "code",
};
const authOptions = {
    providers: [
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            authorization: {
                params: params,
            },
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: params,
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if(user) {
                token.role = user.role;
            }
            if(account) {
                token.provider = account.provider;
            }
            return token;
        },
        async session({ session, token }) {
            if(token && session?.user) {
                session.user.role = token.role;
                session.user.id = token.sub;
                session.user.provider = token.provider;
            }
            return session;
        },
    },
};

export default authOptions as NextAuthConfig;
