import HexMenu, { Item } from "$src/components/hex-menu";
import Image from "next/future/image";
import MainLayout from "$src/layouts/main";
import type { NextPageWithLayout } from "./_app";

const Home: NextPageWithLayout = () => {
  const items: (Item | null)[] = [
    { link: "/about", label: "About Me" },
    { link: "/experience", label: "Experience" },
    { link: "/skills", label: "Skills" },
    { link: "/projects", label: "Projects" },
    null,
    { link: "/blog", label: "Blog" }
  ];

  return (
    <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 bg-left-bottom bg-no-repeat bg-cover">
      <span className="absolute inset-0 transition-all duration-500 bg-none -left-36 sm:-left-12 md:-left-4 lg:left-0">
        <Image src="/images/me3x.webp" id="me" priority alt="" width={1104} height={828} className="w-full h-full object-cover object-left md:object-center" />
      </span>
      <div className="col-start-6 col-span-6 row-start-2 row-span-3 2xl:col-start-5">
        <div className="mt-0 fixed bottom-12 left-0 right-0 z-10 text-center font-montserrat lg:relative lg:text-right lg:bottom-0">
          <h2 className="text-3xl sm:text-5xl lg:text-5xl font-montserrat font-semibold tracking-widest drop-shadow-theme-text-thick">Matt DeKok</h2>
          <h3 className="text-xl sm:text-3xl xl:text-4xl font-montserrat font-medium tracking-normal drop-shadow-theme-text-thick">
            Full&nbsp;Stack Web&nbsp;Developer
          </h3>
        </div>
        <div className="menu-container hidden flex-row justify-end md:flex mt-8">
          <HexMenu items={items} maxLength={3} classes={["lg:[--scale:1.2]"]} itemClasses={["Bounce"]} rotated={true} />
        </div>
      </div>
    </div>
  );
};

Home.getLayout = function (page) {
  return <MainLayout>{page}</MainLayout>;
};

export default Home;
