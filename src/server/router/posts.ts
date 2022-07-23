import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { TRPCError } from "@trpc/server";
import { parse } from "cookie";
import { z } from "zod";
import { createRouter } from "./context";
import { getResult } from "./helpers";

export const postsRouter = createRouter()
  .query("get", {
    async resolve({ ctx }) {
      return await ctx.prisma.blog.findMany({
        orderBy: { date: "desc" }
      });
    }
  })
  .middleware(async ({ ctx, next }) => {
    let accessToken = "";
    if (ctx.req?.headers.cookie) {
      const cookies = parse(ctx.req.headers.cookie);
      accessToken = cookies["sb-access-token"];
      if (accessToken) supabaseClient.auth.setAuth(accessToken);
    }

    if (!accessToken) throw new TRPCError({ message: "Unauthorized", code: "UNAUTHORIZED" });

    const { user, error } = await supabaseClient.auth.api.getUser(accessToken);
    if (!user) throw new TRPCError({ message: `Unauthorized: ${error?.message}`, code: "UNAUTHORIZED" });

    return next({
      ctx: {
        ...ctx,
        user: user
      }
    });
  })
  .query("admin", {
    input: z
      .object({
        images: z.boolean().nullish()
      })
      .nullish(),
    async resolve({ ctx, input }) {
      return await getResult("posts", !!input?.images);
    }
  });
