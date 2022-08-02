import type { NextPageWithLayout } from "./_app";
import type { PropsWithChildren } from "react";
import Image from "next/future/image";
import { prisma } from "$src/server/db/client";
import { projects } from "@prisma/client";
import MainLayout from "$src/layouts/main";
import Page from "$src/layouts/main/components/page";

const Projects: NextPageWithLayout<{ projects: projects[] }> = props => {
  return (
    <Page.Body>
      <div className="flex flex-wrap justify-center lg:mt-0 pb-4">
        <div className="p-0 md:p-2 basis-full 2xl:basis-11/12">
          <div className="flex flex-wrap -m-2 justify-center md:justify-start">
            {props.projects.map((project, i) => (
              <div className="p-1 px-0 sm:p-3 basis-full sm:basis-9/12 md:basis-6/12 xl:basis-4/12" key={`project-${i}`}>
                <GalleryItem image={project.image} title={project.title} subtitle={project.subtitle} description={project.description} link={project.link} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page.Body>
  );
};

Projects.getLayout = function (page) {
  return (
    <MainLayout title="Projects" menu>
      {page}
    </MainLayout>
  );
};

export default Projects;

export async function getStaticProps() {
  const projects = await prisma.projects.findMany({
    orderBy: {
      id: "desc"
    }
  });

  return {
    props: {
      projects: projects.map(project => ({
        ...project,
        created_at: project.created_at.toISOString()
      }))
    },
    revalidate: 6 * 3600
  };
}

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
        <h3 className="text-xl font-semibold my-0 drop-shadow-sm">{props.title}</h3>
        {props.subtitle && <h4 className="text-sm font-light m-0 drop-shadow-sm">{props.subtitle}</h4>}
        {props.description && <div className="text-xs text-white/75 font-light mt-1 drop-shadow-sm">{props.description}</div>}
      </div>
    </GalleryItemWrapper>
  );
}

type GalleryItemWrapperProps = {
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
