import Image from "next/future/image";
import type { FunctionComponent, PropsWithChildren } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { mainMotion } from "$src/layouts/main";
import styles from "$src/layouts/main/styles.module.scss";
import { concatenate as concatenate } from "$src/utils/misc";

type PageBgProps = {
  theme?: string;
  init?: boolean;
};

const PageBg: FunctionComponent<PageBgProps> = ({ theme, init }) => {
  return (
    <AnimatePresence initial={!!init}>
      <motion.div
        key={theme}
        variants={mainMotion.variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        transition={{ duration: 0.5 }}
        data-theme={theme}
        className={concatenate(
          "page-background fixed inset-0 scale-x-[var(--bg-scale-x)]",
          "bg-fixed bg-cover bg-no-repeat bg-theme-body bg-[image:var(--bg-img)]"
        )}
      />
      {theme}
    </AnimatePresence>
  );
};

const PageBody = (props: PropsWithChildren<unknown>) => {
  return <div className="flex flex-col justify-center items-center relative md:px-2 md:px-4 lg:pt-0 pb-4">{props.children}</div>;
};

interface PageArticleProps {
  className?: string;
}

const PageArticle = (props: PropsWithChildren<PageArticleProps>) => {
  return (
    <article className={concatenate("shadow-xl ring-1 rounded-lg mb-4 ring-gray-900/5 overflow-hidden bg-theme-article", props.className || "")}>
      {props.children}
    </article>
  );
};

interface PageSectionProps {
  className?: string;
  bgImage?: string;
}

const PageSection = (props: PropsWithChildren<PageSectionProps>) => {
  return (
    <section
      className={concatenate(
        "p-5 section-divider text-theme-base",
        "last:border-b-0",
        props.className || "",
        props.bgImage ?? `bg-[image:url(${props.bgImage}))]`,
        `bg-cover bg-center`
      )}>
      {props.children}
    </section>
  );
};

const PageSectionItems = (props: PropsWithChildren<unknown>) => {
  return <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-5 gap-x-2">{props.children}</div>;
};

type PageSectionItemProps = {
  image: string;
};

const PageSectionItem = (props: PropsWithChildren<PageSectionItemProps>) => {
  return (
    <div
      className={concatenate(
        "text-[color:var(--text)] min-h-[60px] overflow-hidden",
        "border-[1px] border-solid border-black/15 lg:border-0 last:border-0",
        "pb-5 lg:pb-0 last:pb-0"
      )}>
      <div className={"float-left w-14 h-14 grid justify-center items-center bg-white rounded-md p-1 relative"}>
        <Image src={props.image} alt="" width={56} height={56} className="rounded-sm" />
      </div>
      <div className="ml-20 section-content">{props.children}</div>
    </div>
  );
};

const PageComponents = {
  Bg: PageBg,
  Body: PageBody,
  Article: PageArticle,
  Section: PageSection,
  SectionItems: PageSectionItems,
  SectionItem: PageSectionItem
};

export default PageComponents;
