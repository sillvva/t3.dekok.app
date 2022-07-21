import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { trpc } from "../utils/trpc";

type TechnologyCardProps = {
  name: string;
  description: string;
  documentation: string;
};

const Home: NextPage = () => {
  const { data } = trpc.useQuery(["posts.get"]);

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-800">
        <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-300">
          Create <span className="text-purple-300">T3</span> App
        </h1>
        <div className="grid gap-3 pt-3 mt-3 mx-auto text-center md:grid-cols-2 xl:grid-cols-3 xl:max-w-7xl">
          {data ? (
            data.map(post => (
              <TechnologyCard key={post.id} name={post.title} description={post.description || ""} documentation={`/${post.slug}`} />
              // <pre key={post.id}>{JSON.stringify(post, null, 2)}</pre>
            ))
          ) : (
            <p>Loading..</p>
          )}
        </div>
      </main>
    </>
  );
};

const TechnologyCard = ({ name, description, documentation }: TechnologyCardProps) => {
  return (
    <Link href={documentation}>
      <a className="flex flex-col justify-center p-6 duration-500 bg-white/5 border-2 border-gray-500 rounded shadow-xl motion-safe:hover:scale-105 motion-safe:hover:bg-white/10">
        <h2 className="text-lg text-gray-300">{name}</h2>
        <p className="text-sm text-gray-400">{description}</p>
        <span className="mt-3 text-sm underline text-violet-500 decoration-dotted underline-offset-2">Read more</span>
      </a>
    </Link>
  );
};

export default Home;
