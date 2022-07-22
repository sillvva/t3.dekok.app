import Page from "$src/components/layouts/main/page";
import { NextPageWithLayout } from "./_app";
import MainLayout from "$src/layouts/main";
import Rating from "$src/components/ratings";
import { prisma } from "$src/server/db/client";
import { skills, skill_categories } from "@prisma/client";

const Skills: NextPageWithLayout<{
  skills: (skill_categories & {
    skills: skills[];
  })[];
}> = props => {
  const cols = {
    sm: 12,
    md: 6,
    xl: 4
  };

  return (
    <Page.Body>
      <Page.Article className="w-full sm:w-8/12 md:w-10/12 lg:w-9/12">
        <Page.Section>
          <p>
            The following are personal measurements based on years of experience and the amount of dedication to the subject over those years. They reflect my
            confidence in my abilities with the subject.
          </p>
        </Page.Section>
        {props.skills.map((section, i) => (
          <Rating.Section key={`rsect${i}`} name={section.name} columns={cols}>
            {section.skills.map((skill, j) => (
              <Rating.Item key={`${i}-${j}`} name={skill.name} rating={skill.rating} />
            ))}
          </Rating.Section>
        ))}
      </Page.Article>
    </Page.Body>
  );
};

export default Skills;

Skills.getLayout = function (page) {
  return (
    <MainLayout title="Skills" menu>
      {page}
    </MainLayout>
  );
};

export async function getStaticProps() {
  const skills = await prisma.skill_categories.findMany({
    select: {
      name: true,
      skills: {
        orderBy: {
          name: "asc"
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  });

  return {
    props: {
      skills
    },
    revalidate: 6 * 3600
  };
}
