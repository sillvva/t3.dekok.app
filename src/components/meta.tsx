import Head from "next/head";
import { PropsWithChildren } from "react";
import { useTheme } from "next-themes";

type MetaProps = {
  title?: string;
  description?: string;
  image?: string;
  articleMeta?: object;
};

const themeColors: { [key: string]: string } = {
  dark: "#00aa99",
  blue: "#32b2e8",
  light: "#0070e7"
};

const PageMeta = (props: PropsWithChildren<MetaProps>) => {
  const { theme } = useTheme();
  const color = themeColors[theme || "dark"] ?? "#111";

  const dtitle = props.title ? `${props.title} - Matt DeKok` : "Matt DeKok";
  const description = props.description || "Experienced full stack web developer with a demonstrated history of working in the wireless industry.";
  const ogProperties: any = {
    title: dtitle,
    description: description,
    image: `https://matt.dekok.app${props.image || "/images/preview-me2.jpg"}`,
    url: "https://matt.dekok.app"
  };
  const twProperties: any = {
    site: "@sillvvasensei",
    card: "summary_large_image",
    ...ogProperties
  };
  const articleProps: any = {
    ...props.articleMeta
  };

  return (
    <Head>
      <title>{dtitle}</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.png" />
      <link rel="apple-touch-icon" href={`${ogProperties.url}/icon_x128.png`}></link>
      <link rel="manifest" href="/manifest.webmanifest" />

      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-TileColor" content={color} />
      <meta name="msapplication-tap-highlight" content="no" />
      <meta name="theme-color" content={color} />
      {Object.keys(articleProps).map(t => {
        return <meta key={`article:${t}`} property={`article:${t}`} content={articleProps[t]} />;
      })}
      {Object.keys(ogProperties).map(t => {
        return <meta key={`og:${t}`} name={t} property={`og:${t}`} content={ogProperties[t]} />;
      })}
      {Object.keys(twProperties).map(t => {
        return <meta key={`tw:${t}`} name={`tw:${t}`} content={twProperties[t]} />;
      })}
    </Head>
  );
};

export default PageMeta;
