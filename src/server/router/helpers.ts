import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "../db/client";

export const getResult = async (select: string | null, getImages?: boolean) => {
  if (!supabaseClient) throw new Error("Supabase not initialized");

  const numposts = await prisma.blog.count();
  const posts = select === "posts" ? await prisma.blog.findMany() : [];

  const numexperience = await prisma.experience.count();
  const experience = select === "experience" ? await prisma.experience.findMany() : [];

  const numskills = await prisma.skills.count();
  const skills = select === "skills" ? await prisma.skills.findMany() : [];

  const numprojects = await prisma.projects.count();
  const projects = select === "projects" ? await prisma.projects.findMany() : [];

  let images: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    last_accessed_at: string;
    copied?: boolean;
    metadata: {
      size?: number;
      mimetype?: string;
      cacheControl?: string;
    };
  }[] = [];
  if (select === "images" || getImages) {
    const { data: imageData } = await supabaseClient.storage.from("images").list();
    images = (imageData || []).filter(
      image =>
        image.name.endsWith(".png") ||
        image.name.endsWith(".jpg") ||
        image.name.endsWith(".jpeg") ||
        image.name.endsWith(".svg") ||
        image.name.endsWith(".webp")
    );
  }

  return {
    success: true,
    numposts,
    posts: posts.map(post => ({ ...post, tags: post.tags as string[] })),
    numimages: images.length,
    images: select === "images" ? images : [],
    numexperience,
    experience,
    numskills,
    skills,
    numprojects,
    projects
  };
};
