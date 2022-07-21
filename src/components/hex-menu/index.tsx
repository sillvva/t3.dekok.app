import React, { useMemo } from "react";
import Link from "next/link";
import styles from "./HexMenu.module.scss";
import { useRouter } from "next/router";
import { conClasses, parseCSSModules } from "../../lib/misc";

export type Item = {
  link: string;
  label: string;
  active?: boolean;
  color?: string;
  hoverColor?: string;
  activeColor?: string;
  textColor?: string;
};
type HexMenuProps = {
  items: (Item | null)[];
  maxLength: number;
  classes: string[];
  rotated: boolean;
  color?: string;
  hoverColor?: string;
  activeColor?: string;
  textColor?: string;
  itemClasses: string[];
};

const HexMenu = (props: HexMenuProps) => {
  const { pathname } = useRouter();

  const menuRows = useMemo(() => {
    const out: Item[][] = [[]];
    props.items.forEach((item, i) => {
      const rowIndex = out.length - 1;
      if (item)
        out[rowIndex].push({
          ...item,
          ...(item.link === pathname && { active: true })
        });
      else out[rowIndex].push({ link: "", label: "" });
      const rotDiff = !props.rotated && out.length % 2 === 0 ? 1 : 0;
      if (props.maxLength >= 0 && out[rowIndex].length === props.maxLength - rotDiff && props.items.length - 1 > i) {
        out.push([]);
      }
    });
    return out;
  }, [props.items, props.maxLength, pathname, props.rotated]);

  return (
    <div className={conClasses([styles.HexWrapper, props.rotated && styles.Rotated, ...props.classes])}>
      {useMemo(
        () =>
          menuRows.map((row, r) => {
            return (
              <div className={conClasses([styles.HexRow, r % 2 === 1 && !props.rotated && styles.Shift])} key={`hex-row${r}`}>
                {row.map((item, i) => {
                  return (
                    <HexMenuItem
                      key={`hex-item-${i}`}
                      link={item.link}
                      label={item.label}
                      active={!!item.active}
                      rotated={props.rotated}
                      color={item.color || props.color}
                      activeColor={item.activeColor || props.activeColor}
                      hoverColor={item.hoverColor || props.hoverColor}
                      textColor={item.textColor || props.textColor}
                      classes={props.itemClasses}
                    />
                  );
                })}
              </div>
            );
          }),
        [menuRows, props.rotated, props.activeColor, props.hoverColor, props.textColor, props.itemClasses, props.color]
      )}
    </div>
  );
};

HexMenu.defaultProps = {
  maxLength: 0,
  classes: [],
  rotated: false,
  color: "var(--menu)",
  hoverColor: "var(--menuHover)",
  activeColor: "var(--menuHover)",
  textColor: "var(--menuText)",
  itemClasses: []
};

export default HexMenu;

type HexMenuItemProps = {
  link: string;
  label: string;
  active: boolean;
  rotated: boolean;
  color?: string;
  hoverColor?: string;
  activeColor?: string;
  textColor?: string;
  classes: string[];
};

const HexMenuItem = (props: HexMenuItemProps) => {
  const menuItem = props.label ? (
    <a
      className={parseCSSModules(styles, ["HexMenuItem", props.active && "Active", props.rotated && "Rotated", ...props.classes])}
      style={
        {
          ...(props.color && { "--item-color": props.color }),
          ...(props.hoverColor && { "--hover-color": props.hoverColor }),
          ...(props.activeColor && { "--active-color": props.activeColor }),
          ...(props.textColor && { "--text-color": props.textColor })
        } as React.CSSProperties
      }>
      <span className={styles.ItemLabel}>{props.label}</span>
      <div className={`${styles.Face} ${styles.BackFace} ${styles.Face1}`}></div>
      <div className={`${styles.Face} ${styles.BackFace} ${styles.Face2}`}></div>
      <div className={`${styles.Face} ${styles.BackFace} ${styles.Face3}`}></div>
      <div className={`${styles.Face} ${styles.Face1}`}></div>
      <div className={`${styles.Face} ${styles.Face2}`}></div>
      <div className={`${styles.Face} ${styles.Face3}`}></div>
    </a>
  ) : (
    <span className={parseCSSModules(styles, ["HexMenuItem", props.rotated && "Rotated", "Empty"])}></span>
  );

  if (!props.link) return menuItem;

  return <Link href={props.link}>{menuItem}</Link>;
};

HexMenuItem.defaultProps = {
  active: false,
  rotated: false,
  classes: []
};
