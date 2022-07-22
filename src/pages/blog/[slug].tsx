import type { NextPage } from "next";
import { usePageProps } from "$src/utils/hooks";

const BlogPost: NextPage = () => {
  usePageProps({
    title: "Blog Post",
    menu: true
  });

  return <div>Blog Post</div>;
}

export default BlogPost;