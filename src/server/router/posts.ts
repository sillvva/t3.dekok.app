import { createRouter } from "./context";
import { z } from "zod";

export const postsRouter = createRouter()
  .query("get", {
    async resolve({ ctx }) {
      return await ctx.prisma.blog.findMany({
        orderBy: { date: "desc" }
      });
    },
  });
