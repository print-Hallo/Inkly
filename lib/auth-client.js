import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    // baseURL must match where your app is running
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"
});