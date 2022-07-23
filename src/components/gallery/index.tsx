import Image from "next/future/image";
import { PropsWithChildren } from "react";

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
        <Image
          src={props.image.startsWith("http") ? props.image : `/images/preview-${props.image}.jpg`}
          alt={props.title}
          className="object-cover object-center max-h-full"
          width={500}
          height={500}
        />
      )}
      <div className="absolute inset-0 m-2 p-2 flex flex-col justify-end bg-gradient-to-b from-transparent to-black text-white">
        <h3 className="text-lg font-medium my-0 drop-shadow-sm">{props.title}</h3>
        {props.subtitle && <h4 className="text-base font-light m-0 drop-shadow-sm">{props.subtitle}</h4>}
        {props.description && <div className="text-sm font-light mt-1 drop-shadow-sm">{props.description}</div>}
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
      <a href={props.link} target="_blank" rel="noopener noreferrer" className="gallery-item hover:shadow-xl motion-safe:hover:scale-105">
        {props.children}
      </a>
    );
  }

  return <div className="gallery-item">{props.children}</div>;
}
