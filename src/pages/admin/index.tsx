import type { NextPage } from "next";
import Link from "next/link";
import { trpc } from "$src/utils/trpc";
import { usePageProps } from "$src/utils/hooks";
import PageMeta from "$src/components/meta";

const Home: NextPage = () => {
  const { data } = trpc.useQuery(["posts.get"]);
  usePageProps({
    drawer: true,
    menu: true,
  });

  return (
    <>
      <PageMeta title="Admin" />
      <div className="grid gap-3 pt-3 mt-3 mx-auto md:grid-cols-2 xl:grid-cols-3 xl:max-w-7xl">
        {data ? (
          data.map(post => <TechnologyCard key={post.id} name={post.title} description={post.description || ""} documentation={`/${post.slug}`} />)
        ) : (
          <p className="col-span-full text-center">Loading..</p>
        )}
      </div>
    </>
  );
};

type TechnologyCardProps = {
  name: string;
  description: string;
  documentation: string;
};

const TechnologyCard = ({ name, description, documentation }: TechnologyCardProps) => {
  return (
    <Link href={documentation}>
      <a className="flex flex-col justify-center p-6 duration-500 bg-white/5 border-2 border-gray-500 rounded shadow-xl motion-safe:hover:scale-105 motion-safe:hover:bg-white/10">
        <h2 className="text-lg text-theme-heading">{name}</h2>
        <p className="text-sm text-theme-base">{description}</p>
        <span className="mt-3 text-sm underline text-theme-link hover:text-theme-link-hover decoration-dotted underline-offset-2">Read more</span>
      </a>
    </Link>
  );
};

export default Home;
