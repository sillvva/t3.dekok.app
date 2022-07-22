import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { readFileSync, rmSync, existsSync, statSync, writeFileSync } from "node:fs";
import ReactMarkdown from "react-markdown";
import matter from "gray-matter";
import remarkGfm from "remark-gfm";

import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import atomDark from "react-syntax-highlighter/dist/cjs/styles/prism/atom-dark";
import yaml from "react-syntax-highlighter/dist/cjs/languages/prism/yaml";
import json from "react-syntax-highlighter/dist/cjs/languages/prism/json";
import javascript from "react-syntax-highlighter/dist/cjs/languages/prism/javascript";
import jsx from "react-syntax-highlighter/dist/cjs/languages/prism/jsx";
import typescript from "react-syntax-highlighter/dist/cjs/languages/prism/typescript";
import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import css from "react-syntax-highlighter/dist/cjs/languages/prism/css";
import scss from "react-syntax-highlighter/dist/cjs/languages/prism/scss";
import bash from "react-syntax-highlighter/dist/cjs/languages/prism/bash";
import docker from "react-syntax-highlighter/dist/cjs/languages/prism/docker";

import type { NextPageWithLayout } from "../_app";
import MainLayout from "../../layouts/main";
import Page from "../../components/layouts/main/page";
import { blogStyles } from "../../components/blog";
import { getContentDir } from "$src/utils/server.func";
import PageMessage from "../../components/page-message";

import type { blog } from "@prisma/client";
import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "$src/server/db/client";
import { concatenate } from "$src/utils/misc";

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

type SerializedBlog = Omit<Omit<Omit<Omit<blog, "date">, "updated">, "created_at">, "updated_at"> & {
  date: string;
  updated: string | null;
  created_at: string;
  updated_at: string;
}

type ServerProps = {
  data: SerializedBlog;
  slug: string;
  content: string;
};

const Blog: NextPageWithLayout<ServerProps> = props => {
  const { data, content, slug } = props;

  try {
    if (!data) throw new Error("Could not load post");

    const renderers = {
      p(paragraph: any) {
        const { node } = paragraph;

        if (node.children[0].tagName === "img") {
          const image = node.children[0];

          return (
            <figure className={blogStyles.BlogFigure}>
              <a href={image.properties.src} target="_blank" rel="noreferrer noopener" className={blogStyles.BlogImage}>
                <Image src={image.properties.src} alt={image.alt} layout="fill" objectFit="contain" />
              </a>
              <figcaption>Click to open full screen</figcaption>
            </figure>
          );
        }

        return <p>{paragraph.children}</p>;
      },

      h1(h: any) {
        const { children } = h;
        const text = flattenChildren(children);
        return (
          <h1 className="text-theme-heading">
            <span id={text.replace(/[^a-z0-9]{1,}/gi, "-").toLowerCase()}></span>
            {children}
          </h1>
        );
      },

      h2(h: any) {
        const { children } = h;
        const text = flattenChildren(children);
        return (
          <h2 className="text-theme-heading">
            <span id={text.replace(/[^a-z0-9]{1,}/gi, "-").toLowerCase()}></span>
            {children}
          </h2>
        );
      },

      h3(h: any) {
        const { children } = h;
        const text = flattenChildren(children);
        return (
          <h3 className="text-theme-heading">
            <span id={text.replace(/[^a-z0-9]{1,}/gi, "-").toLowerCase()}></span>
            {children}
          </h3>
        );
      },

      a(anchor: any) {
        const { href, children } = anchor;
        const isExternal = href.startsWith("http");
        return (
          <Link href={href} scroll={false}>
            <a target={isExternal ? "_blank" : ""} rel={isExternal ? "noreferrer noopener" : ""}>
              {children}
            </a>
          </Link>
        );
      },

      pre(pre: any) {
        const { node, children } = pre;
        try {
          if (node.children[0].tagName === "code") {
            const code = node.children[0];
            const { properties, children2 } = code;
            const { className } = properties;
            const { value } = children2[0];
            const language = ((className || [""])[0] || "").split("-")[1];
            if (language == "codepen") {
              const codepen = JSON.parse(value.trim());
              return <ReactCodepen {...codepen} />;
            } else if (language.startsWith("svelte")) {
              return (
                <p>
                  If you&apos;re viewing this on matt.dekok.app, this demo will not work, because it was designed for Svelte. To view the demo, visit the post
                  on <a href={`https://sveltekit.dekok.app/blog/${slug}`}>sveltekit.dekok.app</a>.
                </p>
              );
            }
          }
        } catch (err) {
          // console.log(err);
        }
        return <pre>{children}</pre>;
      },

      code(code: any) {
        const { className, children } = code;
        let language = (className || "").split("-")[1];
        if (!language) return <code>{children}</code>;
        if (language == "codepen") return <code>{children}</code>;
        if (language === "svelte") language = "html";

        const bashes = ["npm", "pnpm", "yarn"];
        const bashInstructions = ["npm install", "pnpm add", "yarn add"];
        if (language == "bash" && children[0].includes("npm install"))
          return (
            <>
              <p className="mb-4 text-white">
                Using{" "}
                <a href="https://npmjs.org" target="_blank" rel="noreferrer noopener" className="text-theme-link">
                  npm
                </a>
                ,&nbsp;
                <a href="https://classic.yarnpkg.com" target="_blank" rel="noreferrer noopener" className="text-theme-link">
                  yarn
                </a>
                , or&nbsp;
                <a href="https://pnpm.js.org" target="_blank" rel="noreferrer noopener" className="text-theme-link">
                  pnpm
                </a>
                , you can install the packages with:
              </p>
              <div className="code npm">
                <div className="flex gap-2">
                  {bashes.map(bash => (
                    <button
                      key={bash}
                      onClick={e => {
                        const parent = e.currentTarget.parentElement?.parentElement;
                        if (!parent) return;
                        bashes.forEach(b => {
                          if (b === bash) parent.querySelector(`button.${b}`)?.classList.replace("bg-theme-article", "bg-theme-link");
                          else parent.querySelector(`button.${b}`)?.classList.replace("bg-theme-link", "bg-theme-article");
                        });
                        bashes.forEach(b => {
                          console.log(parent.querySelector(`.tab.${b}`), parent);
                          if (b === bash) parent.querySelector(`.tab.${b}`)?.classList.remove("hidden");
                          else parent.querySelector(`.tab.${b}`)?.classList.add("hidden");
                        });
                      }}
                      className={concatenate(bash, bash === bashes[0] ? "bg-theme-link" : "bg-theme-article", "text-theme-button p-2 rounded-md")}>
                      {bash}
                    </button>
                  ))}
                </div>
                {bashes.map((bash, b) => (
                  <SyntaxHighlighter key={bash} style={atomDark} language={language} className={concatenate("tab", bash, bash !== bashes[0] && "hidden")}>
                    {children.map((c: string) => c.replaceAll(bashInstructions[0], bashInstructions[b]))}
                  </SyntaxHighlighter>
                ))}
              </div>
            </>
          );

        return (
          <SyntaxHighlighter style={atomDark} language={language}>
            {children}
          </SyntaxHighlighter>
        );
      }
    };

    return (
      <Page.Body>
        <Page.Article className={[blogStyles.BlogArticle, "w-full xl:w-9/12 2xl:w-8/12"].join(" ")}>
          {!data.full && (
            <div className="aspect-video relative">
              <Image src={data.image} alt={"Cover"} layout="fill" objectFit="cover" priority />
            </div>
          )}
          <Page.Section>
            <p className="mb-4 text-gray-400mb-2 text-sm underline text-theme-link decoration-dotted underline-offset-2" aria-label="Date published">
              <span>{data.date}</span>
              <span>{data.updated && `(Updated: ${data.updated})`}</span>
            </p>
            <div className={blogStyles.BlogContent}>
              <ReactMarkdown components={renderers} remarkPlugins={[remarkGfm]}>
                {content}
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

export async function getStaticProps(context: any) {
  const {
    params: { slug }
  } = context;

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
    created_at: meta.created_at.toLocaleDateString("en-us", { weekday: "long", year: "numeric", month: "short", day: "numeric" }),
    updated_at: meta.updated_at.toLocaleDateString("en-us", { weekday: "long", year: "numeric", month: "short", day: "numeric" })
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
  const dirPath = getContentDir();
  const postsPath = `${dirPath}/posts.json`;

  let posts: blog[];
  if (existsSync(postsPath)) {
    const data = readFileSync(postsPath, "utf8");
    posts = JSON.parse(data);
  } else {
    const result = await prisma?.blog.findMany();
    posts = result || [];
  }

  return {
    paths: posts.map(p => ({
      params: { slug: p.slug }
    })),
    fallback: true
  };
}

const flattenChildren: any = (children: any[]) => {
  return (children || [])
    .map(c => {
      if (typeof c == "object") return flattenChildren(c.props.children);
      return c;
    })
    .join(" ");
};
