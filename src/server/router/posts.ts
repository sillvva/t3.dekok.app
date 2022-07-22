import { createRouter } from "./context";
import { z } from "zod";

export const postsRouter = createRouter()
  .query("get", {
    input: z.object({
      page: z.number().default(1),
      q: z.string().nullish(),
      limit: z.number().default(12)
    }),
    async resolve({ input, ctx }) {
      const posts = await ctx.prisma.blog.findMany({
        orderBy: { date: "desc" },
        where: input.q ? {
          OR: [
            { title: { contains: input.q } },
            { description: { contains: input.q } },
            { tags: { array_contains: input.q } }
          ]
        } : undefined
      });
      return {
        posts,
        num: posts.length
      };
    },
  });
