import matter from "gray-matter";
import { writeFileSync } from "fs";
import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "../db/client";
import { getContentDir } from "$src/utils/server.func";
import type { ZodFormattedError } from "zod";

interface FetchOptions {
  getPosts?: boolean;
  page?: number;
  perpage?: number;
  query?: string;
}

export async function fetchPosts(options: FetchOptions = {}) {
  if (!supabaseClient) throw new Error("Supabase not initialized");
  const { getPosts, page, perpage, query } = options;

  let changes = 0;
  let added = 0;
  const upserted: string[] = [];
  const removed: number[] = [];
  const errors: { slug: string; error: any }[] = [];

  const { data: stgData } = await supabaseClient.storage.from("blog").list();
  const contentList = (stgData || []).filter(post => post.name.endsWith(".md"));

  const posts = (
    await prisma.blog.findMany({
      where: query
        ? {
            OR: [{ title: { contains: query } }, { description: { contains: query } }, { tags: { array_contains: query } }]
          }
        : {},
      ...(page && perpage ? { skip: (page - 1) * perpage, take: perpage } : {})
    })
  ).map(post => ({
    ...post,
    tags: (post.tags as string[]) || []
  }));

  const num = await prisma.blog.count({
    where: query
      ? {
          OR: [{ title: { contains: query } }, { description: { contains: query } }, { tags: { array_contains: query } }]
        }
      : {}
  });

  if (query || (page && perpage)) return { changes, upserted, removed, errors, posts, num };

  for (const file of contentList) {
    const slug = file.name.slice(0, file.name.length - 3);

    const fsIndex = posts.findIndex(p => p.slug == slug);
    const fsItem = posts[fsIndex];
    if (!fsItem) added++;
    if (!fsItem || !fsItem.created_at || file.updated_at > fsItem.updated_at.toISOString()) {
      console.log(`Upserting: ${slug}`);
      upserted.push(slug);
      changes++;
    } else continue;

    const { publicURL: url } = supabaseClient.storage.from("blog").getPublicUrl(file.name);
    if (!url) throw new Error(`Could not get public URL for ${file.name}`);
    const response = await fetch(`${url}?t=${Date.now()}`);
    const result = await response.text();

    const parsedData = matter(result);
    const postData = {
      id: fsItem?.id,
      name: file.name,
      slug: slug,
      created_at: file.created_at,
      updated_at: file.updated_at,
      ...{
        title: parsedData.data.title,
        description: parsedData.data.description,
        ...(parsedData.data.date && { date: new Date(parsedData.data.date).toISOString() }),
        ...(parsedData.data.updated && { updated: new Date(parsedData.data.updated).toISOString() }),
        link: parsedData.data.link,
        image: parsedData.data.image,
        tags: parsedData.data.tags,
        full: parsedData.data.full
      }
    };
    if (fsItem) posts.splice(fsIndex, 1, postData);
    else posts.push(postData);
  }

  posts.forEach((post, pi) => {
    const storageFile = contentList.find(item => item.name === `${post.slug}.md`);
    if (!storageFile) {
      console.log(`Removing: ${post.slug}`);
      posts.splice(pi, 1);
      removed.push(post.id);
      changes++;
    }
  });

  writeFileSync(`${getContentDir()}/blog.json`, JSON.stringify(posts));

  if (changes) {
    console.log("Storing metadata to Firestore");
    for (const post of posts.filter(p => !!upserted.find(a => a === p.slug))) {
      try {
        await prisma.blog.upsert({
          where: { id: post.id },
          update: post,
          create: post
        });
      } catch (err: any) {
        errors.push({ slug: post.slug, error: err.message });
      }
    }
    for (const id of removed) {
      try {
        await prisma.blog.delete({ where: { id } });
      } catch (err: any) {
        errors.push({ slug: posts.find(p => p.id === id)?.slug || "", error: err.message });
      }
    }
  } else console.log("No changes found");

  return {
    changes,
    upserted,
    removed: removed.map(id => posts.find(p => p.id === id)?.slug || ""),
    errors,
    posts: getPosts ? posts : [],
    num: (num || 0) + added - removed.length
  };
}

export const formatErrors = (errors: ZodFormattedError<Map<string, string>, string>) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && "_errors" in value) return `${name}: ${value._errors.join(", ")}\n`;
      return "";
    })
    .filter(s => !!s);
