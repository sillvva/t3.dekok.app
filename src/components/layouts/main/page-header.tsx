import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { useCallback, useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";
import Icon from "@mdi/react";
import { mdiChevronLeft, mdiMenu, mdiBrightness6 } from "@mdi/js";
import { AnimatePresence, motion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import MainLayoutContext, { menuItems } from "$src/layouts/main/context";
import styles from "$src/layouts/main/styles.module.scss";
import type { PageHeadProps } from "../../../layouts/main";
import { conClasses } from "$src/utils/misc";

// const PageMenu = dynamic(() => import("./page-menu"));

type PageHeaderProps = {
  head: PageHeadProps;
  layoutMotion?: { variants?: Variants; transition?: Transition };
  onThemeChange?: (theme: string) => void;
};

const PageHeader = ({ head, layoutMotion, onThemeChange }: PageHeaderProps) => {
  const router = useRouter();
  const { data } = useQuery<string>(["backTo", head?.backTo]);
  const { drawer } = useContext(MainLayoutContext);
  const { theme, setTheme, themes } = useTheme();
  const [menu, setMenu] = useState(true);

  useEffect(() => {
    const listener = (ev: string) => {
      if (ev == "/") setMenu(false);
      else setMenu(true);
    };

    router.events.on("routeChangeStart", listener);
    return () => router.events.off("routeChangeStart", listener);
  }, [router.events]);

  const smallTitle = (head?.title?.length || 0) > 12;
  const items = head?.menu && menu ? menuItems : [];
  const baseThemes = themes.filter(t => t !== "system");
  const nextTheme = baseThemes[(baseThemes.indexOf(theme || "") + 1) % baseThemes.length] || "";

  const themeChangeHandler = useCallback(
    (theme: string) => {
      if (!onThemeChange) return;
      onThemeChange(theme);
      setTimeout(() => {
        onThemeChange(nextTheme);
      }, 500);
    },
    [onThemeChange, nextTheme]
  );

  return (
    <header className={conClasses(["flex flex-col items-center transition-all duration-500", "fixed top-0 left-0 right-0 z-[3] scroll-blur"])}>
      <div className="flex gap-4 w-full py-4 px-2 2xs:px-3 items-center text-center max-h-[80px]">
        <div className="w-12">
          {head?.backTo === true ? (
            <a type="button" className="fab" onClick={router.back}>
              <Icon path={mdiChevronLeft} />
            </a>
          ) : head?.backTo ? (
            <Link href={data || head?.backTo}>
              <a type="button" className="fab">
                <Icon path={mdiChevronLeft} />
              </a>
            </Link>
          ) : (
            <button type="button" aria-label="Open Drawer" onClick={drawer.toggle} className="fab">
              <Icon path={mdiMenu} />
            </button>
          )}
        </div>
        <div className="flex-1 block relative h-14">
          <nav className={conClasses(["hidden justify-center gap-3 px-3 lg:flex"])}>
            {/* {items.length ? <PageMenu items={items} /> : ""} */}
          </nav>
        </div>
        <div className="hidden xs:block w-12">
          <button
            type="button"
            aria-label="Toggle Theme"
            onClick={() => {
              themeChangeHandler(theme || "");
              setTheme(nextTheme);
            }}
            className={`fab my-3`}>
            <Icon path={mdiBrightness6} />
          </button>
        </div>
      </div>
      <AnimatePresence initial={false} exitBeforeEnter>
        {head?.title && (
          <motion.h1
            variants={layoutMotion?.variants}
            key={`title: ${head?.title}`}
            initial="hidden"
            animate="enter"
            exit="exit"
            transition={layoutMotion?.transition}
            className={`${styles.PageTitle} hidden lg:block`}>
            {head?.title}
          </motion.h1>
        )}
      </AnimatePresence>
    </header>
  );
};

export default PageHeader;
