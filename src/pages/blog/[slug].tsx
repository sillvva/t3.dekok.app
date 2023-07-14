import PageMessage from "$src/components/page-message";
import MainLayout from "$src/layouts/main";
import Page from "$src/layouts/main/components/page";
import { prisma } from "$src/server/db/client";
import { concatenate } from "$src/utils/misc";
import { getContentDir } from "$src/utils/server.func";
import matter from "gray-matter";
import { GetStaticPropsContext } from "next";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import Image from "next/future/image";
import Link from "next/link";
import { existsSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { JSXElementConstructor, ReactElement, ReactNode } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/cjs/languages/prism/bash";
import css from "react-syntax-highlighter/dist/cjs/languages/prism/css";
import docker from "react-syntax-highlighter/dist/cjs/languages/prism/docker";
import javascript from "react-syntax-highlighter/dist/cjs/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/cjs/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/cjs/languages/prism/jsx";
import scss from "react-syntax-highlighter/dist/cjs/languages/prism/scss";
import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/cjs/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/cjs/languages/prism/yaml";
import lightStyles from "react-syntax-highlighter/dist/cjs/styles/prism/vs";
import darkStyles from "react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { supabaseClient } from "@supabase/auth-helpers-nextjs";

import type { NextPageWithLayout } from "../_app";
import type { blog } from "@prisma/client";
const ReactCodepen = dynamic(() => import("../../components/codepen"));

SyntaxHighlighter.registerLanguage("yaml", yaml);
SyntaxHighlighter.registerLanguage("yml", yaml);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("js", javascript);
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("ts", typescript);
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("scss", scss);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("docker", docker);

type SerializedBlog = Omit<blog, "date" | "updated" | "created_at" | "updated_at"> & {
	date: string;
	updated: string | null;
	created_at: string;
	updated_at: string;
};

type ServerProps = {
	data: SerializedBlog;
	slug: string;
	content: string;
};

const Blog: NextPageWithLayout<ServerProps> = props => {
	const { data, content, slug } = props;
	const { theme } = useTheme();

	try {
		if (!data) throw new Error("Could not load post");

		const components: Components = {
			p({ children }) {
				const child = children[0] as string | ReactElement;
				if (typeof child === "object") {
					if (child.type === "img") {
						const image = child as ReactElement<HTMLImageElement, string | JSXElementConstructor<HTMLImageElement>>;
						const alt = (image.props.alt || "").split(":");

						return (
							<figure className="flex flex-col mb-6 mt-6">
								<a
									href={image.props.src}
									target="_blank"
									rel="noreferrer noopener"
									className={concatenate("relative flex justify-center w-full max-w-[800px] mb-2 mx-auto", !alt.includes("no-aspect") && "aspect-video")}>
									<Image
										src={image.props.src}
										alt={alt[0]}
										width={800}
										height={400}
										loading="lazy"
										className={concatenate(!alt.includes("no-aspect") && "object-cover md:object-contain")}
									/>
								</a>
								<figcaption className="block text-white/70 text-sm text-center">Click to open full screen</figcaption>
							</figure>
						);
					}
				}

				return <p className="mb-4 leading-7 text-theme-base/80">{children}</p>;
			},

			h1({ children }) {
				return (
					<h1 className="text-theme-heading text-4xl font-semibold mb-2 mt-4 leading-7 relative">
						<span
							className="absolute -top-40"
							id={flattenChildren(children)
								.replace(/[^a-z0-9]{1,}/gi, "-")
								.toLowerCase()}></span>
						{children}
					</h1>
				);
			},

			h2({ children }) {
				return (
					<h2 className="text-theme-heading text-2xl font-semibold mb-2 mt-4 leading-7 relative">
						<span
							className="absolute -top-40"
							id={flattenChildren(children)
								.replace(/[^a-z0-9]{1,}/gi, "-")
								.toLowerCase()}></span>
						{children}
					</h2>
				);
			},

			h3({ children }) {
				return (
					<h3 className="text-theme-heading text-lg font-semibold mb-2 mt-4 leading-7 relative">
						<span
							className="absolute -top-40"
							id={flattenChildren(children)
								.replace(/[^a-z0-9]{1,}/gi, "-")
								.toLowerCase()}></span>
						{children}
					</h3>
				);
			},

			a({ href, children }) {
				const url = href ?? "";
				const isExternal = url.startsWith("http");
				return (
					<Link href={url} scroll={false}>
						<a target={isExternal ? "_blank" : ""} rel={isExternal ? "noreferrer noopener" : ""} className="text-theme-link">
							{children}
						</a>
					</Link>
				);
			},

			ul({ children }) {
				return <ul className="list-outside ml-4 mb-7 text-theme-base/80">{children}</ul>;
			},

			li({ children }) {
				return <li className="list-item-icon leading-7 mb-3">{children}</li>;
			},

			pre({ children }) {
				return <pre className="text-sm mb-4 md:p-4 bg-theme-pre text-theme-base rounded-lg overflow-x-auto">{children}</pre>;
			},

			code({ className, children, inline }) {
				if (inline || typeof children[0] !== "string") return <code className="px-1 outline outline-1 rounded-sm bg-white/10 text-theme-base">{children}</code>;
				const content = children as string[];
				let language = (className ?? "").split("-")[1];

				if (!language)
					return (
						<pre className="language-raw-container">
							<code className="language-raw">{children}</code>
						</pre>
					);

				if (language == "codepen") {
					try {
						const cpProps = JSON.parse(content[0]);
						return <ReactCodepen {...cpProps} />;
					} catch (err) {
						return <code>{children}</code>;
					}
				}

				if (language === "env") language = "bash";
				if (language === "svelte") language = "html";

				if (language.startsWith("svelte")) {
					return (
						<p className="whitespace-normal">
							If you&apos;re viewing this on matt.dekok.app, this demo will not work, because it was designed for Svelte. To view the demo, visit the post on{" "}
							<a href={`https://sveltekit.dekok.app/blog/${slug}`} target="_blank" className="text-theme-link" rel="noopener noreferrer">
								sveltekit.dekok.app
							</a>
							.
						</p>
					);
				}

				if (language == "bash" && children[0].includes("npm install")) {
					const bashes = ["npm", "pnpm", "yarn"];
					const bashInstructions = ["npm install", "pnpm add", "yarn add"];
					return (
						<>
							<div className="flex gap-2 mb-4">
								{bashes.map(bash => (
									<button
										key={bash}
										onClick={e => {
											const parent = e.currentTarget.parentElement?.parentElement;
											if (!parent) return;
											bashes.forEach(b => {
												if (b === bash) {
                          parent.querySelector(`button.${b}`)?.classList.replace("bg-theme-article", "bg-theme-link");
                          parent.querySelector(`.tab-body.${b}`)?.classList.remove("hidden");
                        }
												else {
                          parent.querySelector(`button.${b}`)?.classList.replace("bg-theme-link", "bg-theme-article");
												  parent.querySelector(`.tab-body.${b}`)?.classList.add("hidden");
                        }
											});
										}}
										className={concatenate(
											bash,
											bash === bashes[0] ? "bg-theme-link text-theme-button" : "bg-theme-article text-theme-base",
											"font-semibold p-2 rounded-md"
										)}>
										{bash}
									</button>
								))}
							</div>
							{bashes.map((bash, b) => (
								<SyntaxHighlighter
									key={bash}
									style={theme === "light" ? lightStyles : darkStyles}
									language={language}
									className={concatenate("tab-body !bg-theme-code rounded-md", bash, bash !== bashes[0] && "hidden")}>
									{content.map((c: string) => c.replaceAll(bashInstructions[0], bashInstructions[b]))}
								</SyntaxHighlighter>
							))}
						</>
					);
				}

				return (
					<SyntaxHighlighter
						style={theme === "light" ? lightStyles : darkStyles}
						language={language}
						showLineNumbers={!["bash"].includes(language)}
						className="!bg-theme-code rounded-md">
						{content.map(c => c.trim())}
					</SyntaxHighlighter>
				);
			}
		};

		const mdContent = content
			.replace(/(```(svelte|html)) \[([^\]]+)\]/g, "$1\n<!-- $3 -->")
			.replace(/(```(bash|text|env)) \[([^\]]+)\]/g, "$1\n# $3")
			.replace(/(```[^\n ]+) \[([^\]]+)\]/g, "$1\n// $2");

		return (
			<Page.Body>
				<Page.Article className="w-full xl:w-9/12 2xl:w-8/12">
					{!data.full && (
						<div className="aspect-video relative">
							{/* <Image src={data.image} alt={"Cover"} fill sizes="100vw" className="object-cover" priority />  */}
							<Image src={data.image} alt={"Cover"} width={1200} height={(1200 * 2) / 3} className="object-cover" priority />
						</div>
					)}
					<Page.Section>
						<p className="text-theme-faded mb-2 text-sm underline decoration-dotted underline-offset-2" aria-label="Date published">
							<span>{data.date}</span> <span>{data.updated && `(Updated: ${data.updated})`}</span>
						</p>
						<div className="mb-4">
							<ReactMarkdown components={components} rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
								{mdContent}
							</ReactMarkdown>
						</div>
						{!!(data.tags as string[]).length && (
							<>
								<p className="mt-4 mb-2">Tags:</p>
								<div className="flex flex-wrap gap-2">
									{(data.tags as string[]).map((tag, i) => (
										<span className="rounded-full text-theme-base py-1 px-3 bg-theme-body" key={`tag${i}`}>
											{tag}
										</span>
									))}
								</div>
							</>
						)}
					</Page.Section>
				</Page.Article>
			</Page.Body>
		);
	} catch (e) {
		return (
			<Page.Body>
				<Page.Article>
					<Page.Section>
						<PageMessage>
							{e instanceof Error ? e.message : typeof e === "string" ? e : typeof e === "object" ? <pre>{JSON.stringify(e)}</pre> : "Unkown Error"}
						</PageMessage>
					</Page.Section>
				</Page.Article>
			</Page.Body>
		);
	}
};

export default Blog;

Blog.getLayout = function (page, { data }) {
	if (!data) return page;

	const meta = {
		title: data.title,
		description: data.description || "",
		image: data.image,
		articleMeta: {
			published_date: data.date,
			...(data?.updated && { modified_date: data.updated })
		}
	};

	return (
		<MainLayout title={data.title} meta={meta} menu backTo="/blog">
			{page}
		</MainLayout>
	);
};

export async function getStaticProps(context: GetStaticPropsContext) {
	const slug = context.params?.slug;
	if (typeof slug !== "string") throw new Error("Missing slug");

	const dirPath = getContentDir();
	const postsPath = `${dirPath}/posts.json`;
	const filePath = `${dirPath}/${slug}.md`;

	let meta: blog | null = null;
	if (existsSync(postsPath)) {
		const data = readFileSync(postsPath, "utf8");
		const posts: blog[] = JSON.parse(data);
		const result = posts.find(p => p.slug == slug);
		if (result) meta = result;
	}
	if (!meta) {
		meta = await prisma.blog.findFirst({ where: { slug } });
	}
	if (!meta) throw new Error(`Slug "${slug}" not found`);

	let result = { data: "" };
	let write = false;
	if (existsSync(filePath)) {
		const stat = statSync(filePath);
		const tdiff = (new Date(meta.created_at).getTime() - stat.ctime.getTime()) / 1000;
		if (tdiff > 0) {
			write = true;
			rmSync(filePath);
		} else {
			result.data = readFileSync(filePath, "utf8");
		}
	} else write = true;

	if (write) {
		console.log("Revalidating...", slug);
		const { publicURL: url } = supabaseClient.storage.from("blog").getPublicUrl(meta.name);
		if (!url) throw new Error(`Could not get public URL for ${meta.name}`);
		const response = await fetch(`${url}?t=${Date.now()}`);
		const content = await response.text();
		result.data = content;
		writeFileSync(filePath, content);
	}

	const { content } = matter(result.data);

	const data: SerializedBlog = {
		...meta,
		date: meta.date.toLocaleDateString("en-us", { weekday: "long", year: "numeric", month: "short", day: "numeric" }),
		updated: meta.updated?.toLocaleDateString("en-us", { weekday: "long", year: "numeric", month: "short", day: "numeric" }) || null,
		created_at: meta.created_at.toLocaleDateString("en-us", {
			weekday: "long",
			year: "numeric",
			month: "short",
			day: "numeric"
		}),
		updated_at: meta.updated_at.toLocaleDateString("en-us", {
			weekday: "long",
			year: "numeric",
			month: "short",
			day: "numeric"
		})
	};

	return {
		props: {
			content,
			slug,
			data
		}
	};
}

export async function getStaticPaths() {
	// When this is true (in preview environments), don't prerender any static pages
	// (faster builds, but slower initial page load)
	if (process.env.SKIP_BUILD_STATIC_GENERATION) {
		return { paths: [] };
	}

	// Get the paths we want to prerender based on posts
	// In production environments, prerender all pages
	// (slower builds, but faster initial page load)
	const result = await prisma?.blog.findMany();
	const posts = result || [];

	return {
		paths: posts.map(p => ({
			params: { slug: p.slug }
		}))
	};
}

const flattenChildren = (children: ReactNode[]): string => {
	return (children || [])
		.map(c => {
			if (!c) return null;
			if (typeof c == "string") return c;
			if (typeof c == "number" || typeof c === "boolean") return c.toString();
			if ("children" in c) return flattenChildren([c.children]);
			if ("props" in c) return flattenChildren(c.props.children);
			return "";
		})
		.filter(c => c)
		.join(" ");
};
