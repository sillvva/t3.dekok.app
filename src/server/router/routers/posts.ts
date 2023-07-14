import { isoDateRegex } from "$src/utils/constants";
import { parse } from "cookie";
import matter from "gray-matter";
import path from "path";
import { z } from "zod";
import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { TRPCError } from "@trpc/server";
import { createRouter } from "../context";
import { fetchPosts, formatErrors } from "../helpers";

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
			slug: z.string(),
			file: z.string(),
			filename: z.string()
		}),
		async resolve({ input: { file, filename } }) {
			if (!file || !filename) throw new TRPCError({ message: "No file", code: "INTERNAL_SERVER_ERROR" });

			const extname = path.extname(filename || "");
			if (extname !== ".md") throw new TRPCError({ message: "Invalid file extension", code: "INTERNAL_SERVER_ERROR" });

			const buffer = Buffer.from(file, "base64");
			const markdown = buffer.toString("utf8");

			const envSchema = z.object({
				title: z.string(),
				description: z.string(),
				date: z.union([z.date(), z.string().regex(new RegExp(isoDateRegex), "Must be a valid ISO date")]),
				updated: z.union([z.date(), z.string().regex(new RegExp(isoDateRegex), "Must be a valid ISO date")]).optional(),
				image: z.string().url("Invalid URL").optional(),
				tags: z.array(z.string()).optional(),
				full: z.boolean().optional()
			});

			const { data } = matter(markdown);
			const _env = envSchema.safeParse(data);

			if (!_env.success) {
				const message = ["❌ Invalid markdown data:\n", ...formatErrors(_env.error.format())].join();
				throw new TRPCError({ message: message, code: "INTERNAL_SERVER_ERROR" });
			}

			const { error } = await supabaseClient.storage.from("blog").upload(filename, buffer, {
				contentType: "text/markdown",
				upsert: true
			});

			if (error) throw new TRPCError({ message: error?.message, code: "BAD_REQUEST" });
			await fetchPosts();

			return {
				success: true
			};
		}
	})
	.mutation("delete", {
		input: z.object({
			slug: z.string()
		}),
		async resolve({ input: { slug } }) {
			const blog = supabaseClient.storage.from("blog");
			const { data } = await blog.list("archive", { search: slug });
			const suffix = data && data.length ? ` (${data.length + 1})` : "";
			const { error } = await blog.move(`${slug}.md`, `archive/${slug}${suffix}.md`);

			if (error) throw new TRPCError({ message: error.message, code: "BAD_REQUEST" });
			await fetchPosts();

			return {
				success: true
			};
		}
	});
