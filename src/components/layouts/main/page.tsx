import Image from "next/image";
import type { FunctionComponent, PropsWithChildren } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { mainMotion } from "$src/layouts/main";
import styles from "$src/layouts/main/styles.module.scss";
import { concatenate as concatenate } from "$src/utils/misc";

type PageBgProps = {
  theme: string;
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
  return <div className="flex flex-col justify-center items-center relative px-2 md:px-4 pt-24 lg:pt-0 pb-4">{props.children}</div>;
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
  return <div className={styles.SectionItems}>{props.children}</div>;
};

type PageSectionItemProps = {
  image: string;
};

const PageSectionItem = (props: PropsWithChildren<PageSectionItemProps>) => {
  return (
    <div className={styles.SectionItem}>
      <div className={styles.SectionItem__Image}>
        <Image src={props.image} alt="" layout="fill" objectFit="contain" />
      </div>
      <div className={styles.SectionItem__Content}>{props.children}</div>
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
