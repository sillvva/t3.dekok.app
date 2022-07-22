import Link from "next/link";
import { inferQueryOutput, trpc } from "$src/utils/trpc";
import Image from "next/future/image";
import { concatenate } from "$src/utils/misc";
import { useRouter } from "next/router";
import Pagination from "$src/components/pagination";
import { itemsPerPage } from "$src/utils/constants";
import { AnimatePresence, motion } from "framer-motion";
import MainLayout, { mainMotion } from "$src/layouts/main";
import { NextPageWithLayout } from "../_app";

const Blog: NextPageWithLayout = () => {
  const { query } = useRouter();
  const page = parseInt(query.page ? (Array.isArray(query.page) ? query.page[0] : query.page) : "1");
  const limit = parseInt(query.limit ? (Array.isArray(query.limit) ? query.limit[0] : query.limit) : itemsPerPage.toString());
  const { data: posts } = trpc.useQuery(["posts.get"]);

  if (!posts) return <p className="col-span-full text-center">Loading...</p>;
  if (!posts.length) return <p className="col-span-full text-center">No posts found</p>;

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
          className="grid gap-3 pt-3 mt-3 mx-auto md:grid-cols-2 xl:grid-cols-3 xl:max-w-7xl">
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
  return (
    <Link href={post.link || `/blog/${post.slug}`}>
      <a
        className={concatenate(
          "flex justify-start duration-500 bg-theme-article rounded-lg overflow-hidden",
          "shadow-md shadow-black/15 motion-safe:hover:scale-105 hover:shadow-lg hover:shadow-black/25"
        )}>
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
      </a>
    </Link>
  );
};
