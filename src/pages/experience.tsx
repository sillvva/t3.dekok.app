import type { NextPageWithLayout } from "./_app";
import Page from "$src/layouts/main/components/page";
import MainLayout from "$src/layouts/main";
import { prisma } from "$src/server/db/client";
import { experience, experience_categories } from "@prisma/client";

const Experience: NextPageWithLayout<{
  experience: (experience_categories & {
    experience: experience[];
  })[];
}> = props => {
  return (
    <Page.Body>
      <Page.Article className="w-full md:w-9/12 lg:w-9/12 xl:w-8/12 2xl:w-7/12">
        {props.experience.map(section => (
          <Page.Section key={section.name}>
            <h2 className="section-heading">{section.name}</h2>
            <Page.SectionItems>
              {section.experience.map((exp, i) => (
                <Page.SectionItem key={`${exp.name}${i}`} image={exp.image}>
                  <h3 className="text-base font-medium m-0 font-robo-flex">
                    {!exp.nameLink ? (
                      exp.name
                    ) : (
                      <a href={exp.nameLink} target="_blank" rel="noreferrer noopener" className="font-normal text-theme-link">
                        {exp.name}
                      </a>
                    )}
                  </h3>
                  <p className="text-sm font-light mb-0 text-theme-faded">
                    {!exp.h4Link ? (
                      exp.h4
                    ) : (
                      <a href={exp.h4Link} target="_blank" rel="noreferrer noopener" className="font-normal text-theme-link">
                        {exp.h4}
                      </a>
                    )}
                  </p>
                  <p className="text-sm font-light mb-0 text-theme-faded">
                    {!exp.h5Link ? (
                      exp.h5
                    ) : (
                      <a href={exp.h5Link} target="_blank" rel="noreferrer noopener" className="font-normal text-theme-link">
                        {exp.h5}
                      </a>
                    )}
                  </p>
                </Page.SectionItem>
              ))}
            </Page.SectionItems>
          </Page.Section>
        ))}
      </Page.Article>
    </Page.Body>
  );
};

Experience.getLayout = function (page) {
  return (
    <MainLayout title="Experience" menu>
      {page}
    </MainLayout>
  );
};

export default Experience;

export async function getStaticProps() {
  const experience = await prisma.experience_categories.findMany({
    select: {
      name: true,
      experience: {
        orderBy: {
          created_at: "desc"
        }
      }
    },
    orderBy: {
      sort: "asc"
    }
  });

  return {
    props: {
      experience: experience.map(section => ({
        ...section,
        experience: section.experience.map(exp => ({
          ...exp,
          created_at: new Date(exp.created_at).toISOString()
        }))
      }))
    },
    revalidate: 6 * 3600
  };
}
