import styles from "../../../layouts/main/MainLayout.module.scss";
import { useRouter } from "next/router";
import AnimatedButton from "../../animated-button";

export type Item = {
  link: string;
  label: string;
  color?: string;
  hoverColor?: string;
  activeColor?: string;
  textColor?: string;
};
type PageMenuProps = {
  items: (Item | null)[];
  maxLength?: number;
  color?: string;
  hoverColor?: string;
  activeColor?: string;
  textColor?: string;
  itemClasses?: string[];
};

const PageMenu = (props: PageMenuProps) => {
  const {
    maxLength = 0,
    itemClasses = [],
    color = "var(--link)",
    hoverColor = "var(--linkHover)",
    activeColor = "var(--linkHover)",
    textColor = "var(--linkText)",
    items
  } = props;

  const { pathname } = useRouter();

  const menuRows: Item[][] = [[]];
  items.forEach((item, i) => {
    const rowIndex = menuRows.length - 1;
    if (item) menuRows[rowIndex].push(item);
    if (maxLength >= 0 && menuRows[rowIndex].length === maxLength && items.length - 1 > i) {
      menuRows.push([]);
    }
  });

  return (
    <>
      {menuRows.map((row, r) => {
        return (
          <div className={styles.PageMenu} key={`menu-row${r}`}>
            {row.map((item, i) => {
              return (
                <AnimatedButton
                  key={`${item.link}-${item.link === pathname}`}
                  link={item.link}
                  label={item.label}
                  color={item.color || color}
                  itemClasses={itemClasses}
                  active={item.link === pathname}
                  activeColor={item.activeColor || activeColor}
                  hoverColor={item.hoverColor || hoverColor}
                  textColor={item.textColor || textColor}
                  clickRipple
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
};

export default PageMenu;
