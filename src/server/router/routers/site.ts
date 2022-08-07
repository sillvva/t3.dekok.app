import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { z } from "zod";
import { env } from "$src/server/env.mjs";
import { createRouter } from "../context";
import { prisma } from "$src/server/db/client";
import { parseError } from "$src/utils/misc";

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
			if (env.NODE_ENV === "production") {
				for (let path of input.paths) {
					try {
						await res.revalidate(path);
						revalidated.push(path);
					} catch (err) {
						errors.push(parseError(err));
					}
				}
			} else {
				try {
					const url = `${env.PROD_URL}/api/trpc/site.revalidate?batch=1`;
					const response = await fetch(url, {
						method: "POST",
						body: JSON.stringify({ "0": { json: { paths: input.paths } } })
					});

					const result = await response.json();
					if (!result) throw new Error(`No result at ${url}`);

					revalidated.push(...result[0].result.data.json.revalidated);
				} catch (err) {
					errors.push(parseError(err));
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
