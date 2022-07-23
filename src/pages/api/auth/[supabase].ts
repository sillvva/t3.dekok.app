import { handleAuth } from "@supabase/auth-helpers-nextjs";

export default handleAuth({ logout: { returnTo: "/" }, tokenRefreshMargin: 10 * 60 });
