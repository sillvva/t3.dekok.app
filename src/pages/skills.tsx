import type { NextPageWithLayout } from "./_app";
import Page from "$src/layouts/main/components/page";
import MainLayout from "$src/layouts/main";
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
      name: "desc"
    }
  });

  return {
    props: {
      skills
    },
    revalidate: 6 * 3600
  };
}

import { PropsWithChildren, Fragment } from "react";
import { mdiStar, mdiStarHalfFull, mdiStarOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { concatenate } from "$src/utils/misc";

type RatingColumnBreakpoints = {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  "2xl"?: number;
};

type RatingSectionProps = {
  name: string;
  columns: RatingColumnBreakpoints;
};

const RatingSection = (props: PropsWithChildren<RatingSectionProps>) => {
  const colClasses = [
    ...(props.columns.sm ? ["sm:block"] : []),
    ...(props.columns.md ? ["md:block"] : []),
    ...(props.columns.xl ? ["xl:block"] : []),
    ...(props.columns.lg ? ["lg:block"] : []),
    ...(props.columns["2xl"] ? ["2xl:block"] : [])
  ];

  return (
    <Page.Section className="sm:block md:block lg:block xl:block 2xl:block">
      <h2 className="section-heading">{props.name}</h2>
      <div className="flex flex-wrap -m-3 mt-4 mb-2">
        {colClasses.map((col, c) => (
          <Fragment key={`col${c}`}>
            <div className={concatenate("p-3 pt-0.5 basis-0 grow even:text-right even:max-w-max", c > 0 && `hidden ${col}`)}>
              <strong>Skills</strong>
            </div>
            <div className={concatenate("p-3 pt-0.5 basis-0 grow even:text-right even:max-w-max", c > 0 && `hidden ${col}`)}>
              <strong>Rating</strong>
            </div>
          </Fragment>
        ))}
      </div>
      <div className="flex flex-wrap -m-3">{props.children}</div>
    </Page.Section>
  );
};

type RatingItemProps = {
  name: string;
  rating: number;
};

const RatingItem = (props: RatingItemProps) => {
  return (
    <div className="basis-full md:basis-6/12 xl:basis-4/12 p-3 grow-0">
      <div className="flex -m-3">
        <div className="p-3 pt-0.5 basis-0 grow">{props.name}</div>
        <div className="p-3 pt-0.5 basis-0 grow text-right max-w-max whitespace-nowrap">
          <RatingStars rating={props.rating} />
        </div>
      </div>
    </div>
  );
};

type RatingStarsProps = {
  rating: number;
};

const RatingStars = (props: RatingStarsProps) => {
  const getStars = () => {
    const max = 5;
    let full = Math.floor(props.rating);
    let half = full === props.rating ? 0 : 1;
    let empty = max - full - half;
    if (props.rating - full !== 0) {
      if (props.rating - full >= 3 / 4) {
        half = 0;
        full += 1;
      } else if (props.rating - full < 1 / 4) {
        half = 0;
        empty += 1;
      }
    }

    return [...Array(full).fill(mdiStar), ...Array(half).fill(mdiStarHalfFull), ...Array(empty).fill(mdiStarOutline)];
  };

  return (
    <div className={`rating flex text-right`}>
      {getStars().map((star, s) => (
        <Icon
          path={star}
          key={`star${s}`}
          className="w-4 inline-block motion-safe:scale-0 motion-safe:animate-zoom-bounce"
          style={{ color: star === mdiStarOutline ? `var(--ratingOff)` : `var(--ratingOn)`, animationDelay: `${400 + s * 125}ms` }}
        />
      ))}
    </div>
  );
};

const Rating = {
  Section: RatingSection,
  Item: RatingItem
};