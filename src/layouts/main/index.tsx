import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import { concatenate, debounce } from "$src/utils/misc";
import MainLayoutContext, { MainLayoutContextProvider } from "./context";
import Page from "$src/components/layouts/main/page";
import PageHeader from "$src/components/layouts/main/page-header";
import NextNProgress from "$src/components/progress";
import { useQuery } from "@tanstack/react-query";

const Drawer = dynamic(() => import("$src/components/drawer"));

const Layout = (props: React.PropsWithChildren<PageHeadProps>) => {
  const router = useRouter();
  const { drawer } = useContext(MainLayoutContext);
  const { theme, setTheme } = useTheme();
  const { data: head } = useQuery<PageHeadProps>(["page-props"]);
  const [oldTheme, setOldTheme] = useState(theme || "");
  const init = useRef(false);

  useEffect(() => {
    const mm = matchMedia("(prefers-color-scheme: dark)");
    const listener = () => setTheme(mm.matches ? "dark" : "light");

    if (theme == "system") listener();
    mm.addEventListener("change", listener);
    return () => mm.removeEventListener("change", listener);
  }, [theme, setTheme]);

  useEffect(() => {
    document.documentElement.dataset.scroll = window.scrollY.toString();
    const scrollHandler = debounce(() => {
      document.documentElement.dataset.scroll = window.scrollY.toString();
    });

    init.current = true;
    window.addEventListener("scroll", scrollHandler, { passive: true });
    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);

  const themeChangeHandler = (newTheme: string) => {
    setOldTheme(newTheme);
  };

  return (
    <div id="app" className="min-h-screen min-w-screen">
      {theme && theme !== oldTheme && <Page.Bg theme={oldTheme || ""} />}
      <Page.Bg key={theme} theme={theme || "dark"} init={init.current} />
      <AnimatePresence initial={false} exitBeforeEnter>
        <motion.main
          key={`main${props.path}`}
          className={concatenate(
            "relative flex-col justify-center items-center z-[2] px-2 md:px-4",
            router.asPath == "/" ? "h-screen" : head?.title ? "pt-24 lg:pt-36 pb-4" : "pt-20 pb-4"
          )}
          variants={mainMotion.variants}
          initial="hidden"
          animate="enter"
          exit="exit"
          transition={mainMotion.transition}>
          {props.children}
        </motion.main>
      </AnimatePresence>
      {drawer.state ? <Drawer /> : ""}
      <PageHeader layoutMotion={mainMotion} onThemeChange={themeChangeHandler} />
    </div>
  );
};

const MainLayout = (props: React.PropsWithChildren<PageHeadProps>) => {
  const router = useRouter();

  return (
    <MainLayoutContextProvider>
      <NextNProgress color="var(--link)" height={1} options={{ showSpinner: false }} />
      <Layout {...{ ...props, path: router.pathname }}>{props.children}</Layout>
    </MainLayoutContextProvider>
  );
};

export default MainLayout;

export const headerClasses = ["transition-all duration-1000 bg-transparent sticky z-10 top-0"];

export const mainMotion: { variants?: Variants; transition?: Transition } = {
  variants: {
    hidden: { opacity: 0 },
    enter: { opacity: 1 },
    exit: { opacity: 0 }
  },
  transition: {
    duration: 0.25
  }
};

export type PageHeadProps = {
  title?: string;
  menu?: boolean;
  drawer?: boolean;
  path?: string;
  meta?: LayoutMeta;
  headerClasses?: string[];
  backTo?: string | boolean;
};

type LayoutMeta = {
  description?: string;
  image?: string;
  articleMeta?: object;
};
