import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const Home: NextPage = () => {
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
        <div className="flex justify-center">
          <Link href="/admin">
            <a className="text-teal-500">Admin</a>
          </Link>
        </div>
      </main>
    </>
  );
};

export default Home;
