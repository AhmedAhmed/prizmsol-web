import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    plugins: [
        emailOTPClient()
    ]
});

// Now, useSession, signIn, signUp, signOut are correctly typed as React hooks
export const { useSession, signIn, signUp, signOut } = authClient;