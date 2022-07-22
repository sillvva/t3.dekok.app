import { createRouter } from "./context";
import { z } from "zod";
import { env } from "../env.mjs";

export const siteRouter = createRouter()
  .query("revalidate", {
    input: z.object({
      paths: z.array(z.string())
    }),
    async resolve({ input, ctx }) {
      const { req, res } = ctx;
      if (!req || !res) return { revalidated: [] };

      const revalidated = [];
      const errors = [];
      if (env.PROD_URL.includes(req.headers.host || "xN/Ax")) {
        for (let path of input.paths) {
          try {
            await res.revalidate(path);
            revalidated.push(path);
          }
          catch(err: any) {
            errors.push(err.message);
          }
        }
      } else {
        try {
          const data = {"0":{json:{paths:input.paths}}};
          await fetch(`${env.PROD_URL}/api/trpc/site.revalidate?batch=1&input=${encodeURIComponent(JSON.stringify(data))}`);
          revalidated.push(...input.paths);
        }
        catch(err: any) {
          errors.push(err.message);
        }
      }

      return {
        revalidated,
        errors
      };
    }
  });
