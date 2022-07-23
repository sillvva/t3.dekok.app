import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const useAuthentication = (options?: { login?: boolean }) => {
  const { login = false } = options || {};
  const userState = useUser();
  const router = useRouter();

  useEffect(() => {
    if (login && !userState.isLoading && !userState.user) {
      supabaseClient.auth.signIn(
        {
          provider: "github"
        },
        {
          redirectTo: `${location.origin}${router.asPath.split("#")[0]}`
        }
      );
    }
  }, [login, router, userState.isLoading, userState.user]);

  useEffect(() => {
    // If auth helpers is not working, handle session manually
    if (userState.user) return;
    const [url, hash] = router.asPath.split("#");
    if (hash && hash.startsWith("access_token=")) {
      const parts = hash.split("&");
      const refreshToken = parts.find(p => p.startsWith("refresh_token="));
      if (refreshToken) {
        const [, refreshTokenValue] = refreshToken.split("=");
        supabaseClient.auth.setSession(refreshTokenValue);
        history.replaceState(null, "", url);
      }
    }
  }, [router, userState]);

  return userState;
};
