import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Image from "next/future/image";
import { AnimatePresence, motion } from "framer-motion";
import { trpc } from "$src/utils/trpc";
import type { inferQueryOutput } from "$src/utils/trpc";
import { concatenate } from "$src/utils/misc";
import { itemsPerPage } from "$src/utils/constants";
import type { NextPageWithLayout } from "../_app";
import MainLayout, { mainMotion } from "$src/layouts/main";
import PageMessage from "$src/components/page-message";
import { useRipple } from "$src/components/ripple";

const Pagination = dynamic(() => import("$src/components/pagination"));

const Blog: NextPageWithLayout = () => {
  const { query } = useRouter();
  const page = parseInt(query.page ? (Array.isArray(query.page) ? query.page[0] : query.page) : "1");
  const limit = parseInt(query.limit ? (Array.isArray(query.limit) ? query.limit[0] : query.limit) : itemsPerPage.toString());
  const { data: posts } = trpc.useQuery(["posts.get"]);

  if (!posts) return <div className="grid gap-3 pt-3 mt-3 mx-auto md:grid-cols-2 xl:grid-cols-3 max-w-8xl">{Array(itemsPerPage).fill(<PostLoader />)}</div>;
  if (!posts.length) return <PageMessage>No posts found</PageMessage>;

  const paginatedPosts = posts.slice((page - 1) * limit, page * limit);

  return (
    <>
      <AnimatePresence exitBeforeEnter>
        <motion.div
          key={paginatedPosts[0]?.slug}
          variants={mainMotion.variants}
          initial="hidden"
          animate="enter"
          exit="exit"
          transition={mainMotion.transition}
          className="grid gap-3 pt-3 mt-3 mx-auto md:grid-cols-2 xl:grid-cols-3 max-w-8xl">
          {paginatedPosts.map(post => (
            <PostCard key={post.id} {...post} />
          ))}
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-center">
        {posts.length > itemsPerPage ? <Pagination page={page} pages={Math.ceil(posts.length / itemsPerPage)} /> : null}
      </div>
    </>
  );
};

Blog.getLayout = function (page) {
  return (
    <MainLayout title="Blog" menu>
      {page}
    </MainLayout>
  );
};

export default Blog;

export const PostCard = (post: inferQueryOutput<"posts.get">[number]) => {
  const { ripples, mouseHandler, rippleClass } = useRipple();
  const [focused, setFocused] = useState(false);

  return (
    <Link href={post.link || `/blog/${post.slug}`}>
      <a
        className={concatenate(
          "flex justify-start duration-500 bg-theme-article rounded-lg overflow-hidden",
          "shadow-md shadow-black/15 motion-safe:hover:scale-105 hover:shadow-lg hover:shadow-black/25",
          rippleClass,
          focused && !post.link && "motion-safe:post-focused"
        )}
        onClick={() => setFocused(true)}
        onPointerDown={mouseHandler}>
        <div className="relative h-full min-w-[8rem] max-w-[8rem]">
          <Image src={post.image} alt={post.title} width={100} height={100} className="w-full h-full object-cover object-center" />
        </div>
        <div className="flex flex-col flex-1 p-4">
          <h2 className="text-lg text-theme-heading">{post.title}</h2>
          <span className="mb-2 text-sm underline text-theme-link decoration-dotted underline-offset-2">
            {post.date.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            })}
          </span>
          <p className="text-sm text-theme-base">{post.description}</p>
        </div>
        {ripples}
      </a>
    </Link>
  );
};

export const PostLoader = () => {
  return (
    <div
      className={concatenate(
        "flex justify-start duration-500 bg-theme-article rounded-lg overflow-hidden",
        "shadow-md shadow-black/15 motion-safe:hover:scale-105 hover:shadow-lg hover:shadow-black/25"
      )}>
      <div className="relative h-full min-w-[8rem] max-w-[8rem] motion-safe:animate-pulse bg-gray-500/50"></div>
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="w-2/3 h-6 flex items-center">
          <span className="motion-safe:animate-pulse bg-gray-500/50 block overflow-hidden w-full h-full rounded-full bg-theme-hover bg-opacity-15"></span>
        </div>
        <div className="w-1/2 h-4 flex items-center">
          <span className="motion-safe:animate-pulse bg-gray-500/50 block overflow-hidden w-full h-full rounded-full bg-theme-hover bg-opacity-15"></span>
        </div>
        <div className="w-full h-4 flex items-center">
          <span className="motion-safe:animate-pulse bg-gray-500/50 block overflow-hidden w-full h-full rounded-full bg-theme-hover bg-opacity-15"></span>
        </div>
        <div className="w-full h-4 flex items-center">
          <span className="motion-safe:animate-pulse bg-gray-500/50 block overflow-hidden w-full h-full rounded-full bg-theme-hover bg-opacity-15"></span>
        </div>
      </div>
    </div>
  );
};
