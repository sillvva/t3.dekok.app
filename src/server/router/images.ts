import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { TRPCError } from "@trpc/server";
import { parse } from "cookie";
import path from "path";
import { z } from "zod";
import { createRouter } from "./context";

const allowedTypes = [".png", ".jpg", ".jpeg", ".svg", ".webp"];
const imagePath = "https://slxazldgfeytirfrculz.supabase.co/storage/v1/object/public/images/";

export const imagesRouter = createRouter()
  .query("get", {
    async resolve() {
      const { data: files } = await supabaseClient.storage.from("images").list();
      return (files || []).filter(file => {
        const extname = path.extname(file.name || "");
        return allowedTypes.includes(extname);
      }).map(file => ({
        name: file.name,
        url: imagePath + file.name,
        created_at: file.created_at,
        updated_at: file.updated_at
      }));
    }
  })
  .middleware(async ({ ctx, next }) => {
    let accessToken = "";
    if (ctx.req?.headers.cookie) {
      const cookies = parse(ctx.req.headers.cookie);
      accessToken = cookies["sb-access-token"];
    }

    if (!accessToken) throw new TRPCError({ message: "Unauthorized", code: "UNAUTHORIZED" });

    const { user, error } = await supabaseClient.auth.api.getUser(accessToken);
    if (!user) throw new TRPCError({ message: `Unauthorized: ${error?.message}`, code: "UNAUTHORIZED" });

    supabaseClient.auth.setAuth(accessToken);

    return next({
      ctx: {
        ...ctx,
        user: user
      }
    });
  })
  .mutation("post", {
    input: z.object({
      file: z.string(),
      filename: z.string(),
      upsert: z.boolean()
    }),
    async resolve({ input: { file, filename, upsert } }) {
      if (!file || !filename) throw new TRPCError({ message: "No file", code: "BAD_REQUEST" });

      const extname = path.extname(filename || "");
      if (!allowedTypes.includes(extname)) throw new TRPCError({ message: "Invalid file extension", code: "BAD_REQUEST" });

      const buffer = Buffer.from(file, "base64");
      const { error } = await supabaseClient.storage.from("images").upload(filename, buffer, {
        upsert
      });

      if (error) throw new TRPCError({ message: error?.message, code: "BAD_REQUEST" });

      return {
        success: true,
        error: ""
      };
    }
  })
  .mutation("delete", {
    input: z.object({
      filename: z.string()
    }),
    async resolve({ input: { filename } }) {
      const images = supabaseClient.storage.from("images");
      const { data } = await images.list("archive", { search: filename });
      const suffix = data && data.length ? ` (${data.length + 1})` : "";
      const extname = path.extname(filename);
      const basename = path.basename(filename, extname);
      const { error } = await images.move(`${filename}`, `archive/${basename}${suffix}${extname}`);
      if (error) throw new TRPCError({ message: error.message, code: "BAD_REQUEST" });

      return {
        success: true,
        error: ""
      };
    }
  });
