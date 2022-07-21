import Image from "next/image";
import { PropsWithChildren } from "react";
import styles from "./Gallery.module.scss";

export const galleryStyles = styles;

type GalleryItemProps = {
  link: string | null | undefined;
  image: string | null;
  title: string;
  subtitle: string;
  description: string | null;
};

function GalleryItem(props: GalleryItemProps) {
  return (
    <GalleryItemWrapper link={props.link || ""}>
      {props.image && (
        <Image src={props.image.startsWith("http") ? props.image : `/images/preview-${props.image}.jpg`} alt={props.title} width={400} height={400} />
      )}
      <div className={styles.Cover}>
        <h3>{props.title}</h3>
        {props.subtitle && <h4>{props.subtitle}</h4>}
        {props.description && <div>{props.description}</div>}
      </div>
    </GalleryItemWrapper>
  );
}

export default GalleryItem;

export type GalleryItemWrapperProps = {
  link: string;
};

function GalleryItemWrapper(props: PropsWithChildren<GalleryItemWrapperProps>) {
  if (props.link) {
    return (
      <a href={props.link} target="_blank" rel="noopener noreferrer" className={styles.LinkedGalleryItem}>
        {props.children}
      </a>
    );
  }

  return <div className={styles.GalleryItem}>{props.children}</div>;
}
