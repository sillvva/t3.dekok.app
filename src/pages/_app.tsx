import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { withTRPC } from "@trpc/next";
import type { AppRouter } from "$src/server/router";
import superjson from "superjson";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "@supabase/auth-helpers-react";
import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import "../styles/globals.scss";

export type NextPageWithLayout<P = {}> = NextPage<P> & {
  getLayout?: (page: ReactElement, props: P) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const queryClient = new QueryClient();

const MyApp = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? (page => page);
  return (
    <UserProvider supabaseClient={supabaseClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider themes={["dark", "light", "blue"]}>
          {getLayout(<Component {...pageProps} />, pageProps)}
        </ThemeProvider>
      </QueryClientProvider>
    </UserProvider>
  );
};

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`;

    return {
      url,
      transformer: superjson
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: true
})(MyApp);
