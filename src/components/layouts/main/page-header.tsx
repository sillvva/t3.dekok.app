import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { useCallback, useContext, useEffect, useState } from "react";
import Icon from "@mdi/react";
import { mdiChevronLeft, mdiMenu, mdiBrightness6 } from "@mdi/js";
import { AnimatePresence, motion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import MainLayoutContext, { menuItems } from "$src/layouts/main/context";
import type { PageHeadProps } from "../../../layouts/main";
import { concatenate } from "$src/utils/misc";

const PageMenu = dynamic(() => import("./page-menu"));

type PageHeaderProps = {
  head: PageHeadProps;
  layoutMotion?: { variants?: Variants; transition?: Transition };
  onThemeChange?: (theme: string) => void;
};

const PageHeader = ({ head, layoutMotion, onThemeChange }: PageHeaderProps) => {
  const router = useRouter();
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
    <header className={concatenate("flex flex-col items-center transition-all duration-500", "fixed top-0 left-0 right-0 z-[3] scroll-blur")}>
      <div className="flex gap-4 w-full py-4 px-2 2xs:px-3 items-center text-center max-h-[80px]">
        <div className="w-12">
          {head?.backTo === true ? (
            <a type="button" className="fab" onClick={router.back}>
              <Icon path={mdiChevronLeft} />
            </a>
          ) : head?.backTo ? (
            <Link href={head?.backTo}>
              <a type="button" className="fab">
                <Icon path={mdiChevronLeft} />
              </a>
            </Link>
          ) : (
            <button
              type="button"
              aria-label="Open Drawer"
              onClick={drawer.toggle}
              className={concatenate("fab", "flex", (head?.menu || router.asPath === "/") && "lg:hidden")}>
              <Icon path={mdiMenu} />
            </button>
          )}
        </div>
        <div className="flex-1 block relative h-14">
          {head?.menu ? <nav className={concatenate("hidden justify-center gap-3 px-3 lg:flex")}>{items.length ? <PageMenu items={items} /> : ""}</nav> : ""}
          <AnimatePresence initial={false} exitBeforeEnter>
            {head?.title && (
              <motion.h1
                variants={layoutMotion?.variants}
                key={`title: ${head?.title} ${router.pathname}`}
                initial="hidden"
                animate="enter"
                exit="exit"
                transition={layoutMotion?.transition}
                className={concatenate(
                  "text-3xl text-center text-theme-heading font-medium font-montserrat",
                  "drop-shadow-theme-text-outline lg:mt-4 lg:mb-4",
                  "block lg:hidden flex-1 p-2 absolute inset-0",
                  smallTitle && "text-sm sm:text-lg md:text-2xl flex lg:hidden justify-center items-center"
                )}>
                {head?.title}
              </motion.h1>
            )}
          </AnimatePresence>
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
            key={`title: ${head?.title} ${router.pathname}`}
            initial="hidden"
            animate="enter"
            exit="exit"
            transition={layoutMotion?.transition}
            className={concatenate(
              "text-3xl text-center text-theme-heading font-medium font-montserrat",
              "drop-shadow-theme-text-outline lg:mt-4 lg:mb-4",
              "hidden lg:block"
            )}>
            {head?.title}
          </motion.h1>
        )}
      </AnimatePresence>
    </header>
  );
};

export default PageHeader;
