import { PropsWithChildren, Fragment } from "react";
import { mdiStar, mdiStarHalfFull, mdiStarOutline } from "@mdi/js";
import Icon from "@mdi/react";
import ratingStyles from "./Ratings.module.scss";
import Page from "../layouts/main/page";

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
      <h2 className={ratingStyles.Header}>{props.name}</h2>
      <div className={ratingStyles.Columns}>
        {colClasses.map((col, c) => (
          <Fragment key={`col${c}`}>
            <div className={[ratingStyles.Column, c > 0 && `hidden ${col}`].join(" ")}>
              <strong>Skills</strong>
            </div>
            <div className={[ratingStyles.Column, c > 0 && `hidden ${col}`].join(" ")}>
              <strong>Rating</strong>
            </div>
          </Fragment>
        ))}
      </div>
      <div className={ratingStyles.Body}>{props.children}</div>
    </Page.Section>
  );
};

type RatingItemProps = {
  name: string;
  rating: number;
};

const RatingItem = (props: RatingItemProps) => {
  return (
    <div className={ratingStyles.Entry}>
      <div className={ratingStyles.EntryRow}>
        <div className={ratingStyles.EntryCol}>{props.name}</div>
        <div className={ratingStyles.EntryCol}>
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
    <div className={`rating text-right ${ratingStyles.Zoom}`}>
      {getStars().map((star, s) => (
        <Icon path={star} key={`star${s}`} style={{ color: star === mdiStarOutline ? `var(--ratingOff)` : `var(--ratingOn)` }} />
      ))}
    </div>
  );
};

const Rating = {
  Section: RatingSection,
  Item: RatingItem
};

export default Rating;
