import type { NextPage } from "next";
import Link from "next/link";
import PageMeta from "$src/components/meta";
import { usePageProps } from "$src/utils/hooks";

const Home: NextPage = () => {
  usePageProps({});

  return (
    <>
      <PageMeta />
      <main className="flex flex-col items-center justify-center">
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
