import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { z } from "zod";
import { env } from "../env.mjs";
import { createRouter } from "./context";
import { prisma } from "../db/client";

export const siteRouter = createRouter()
  .mutation("revalidate", {
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
          } catch (err: any) {
            errors.push(err.message);
          }
        }
      } else {
        try {
          const result = await fetch(`${env.PROD_URL}/api/trpc/site.revalidate?batch=1`, {
            method: "POST",
            body: JSON.stringify({ "0": { json: { paths: input.paths } } })
          });
          console.log((await result.json())[0].result.data.json)
          revalidated.push(...(await result.json())[0].result.data.json.revalidated);
        } catch (err: any) {
          errors.push(err.message);
        }
      }

      return {
        host: req.headers.host,
        revalidated,
        errors
      };
    }
  })
  .query("admin", {
    async resolve() {
      if (!supabaseClient) throw new Error("Supabase not initialized");

      const numposts = await prisma.blog.count();
      const numexperience = await prisma.experience.count();
      const numskills = await prisma.skills.count();
      const numprojects = await prisma.projects.count();

      const { data: imageData } = await supabaseClient.storage.from("images").list();
      const numimages = (imageData || []).filter(
        image =>
          image.name.endsWith(".png") ||
          image.name.endsWith(".jpg") ||
          image.name.endsWith(".jpeg") ||
          image.name.endsWith(".svg") ||
          image.name.endsWith(".webp")
      ).length;

      return {
        numposts,
        numimages,
        numexperience,
        numskills,
        numprojects
      };
    }
  });
