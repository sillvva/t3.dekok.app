import Page from "$src/components/layouts/main/page";
import { NextPageWithLayout } from "./_app";
import MainLayout from "$src/layouts/main";
import { prisma } from "$src/server/db/client";
import { projects } from "@prisma/client";
import GalleryItem from "$src/components/gallery";

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
