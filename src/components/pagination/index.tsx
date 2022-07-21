import { useRouter } from "next/router";
import styles from "./Pagination.module.scss";

export const blogStyles = styles;

export type PaginationProps = {
  page: number | string;
  pages: number;
};

function Pagination(props: PaginationProps) {
  const router = useRouter();
  const page = typeof props.page == "string" ? parseInt(props.page) : props.page;
  const pages = props.pages;

  const pagination: (number | null)[] = pages > 1 ? [1, pages] : [];
  if (pagination.length > 0) {
    const inMin = Math.max(2, page - 2);
    const inMax = Math.min(pages - 1, page + 2);
    const inserts =
      pages <= 2
        ? []
        : inMax - Math.min(page, inMin) >= 2
        ? Array(inMax - inMin + 1)
            .fill(null)
            .map((x, i) => i + inMin)
        : [2];
    pagination.splice(1, 0, ...inserts);
    if (inMin > 2) pagination.splice(1, 0, null);
    if (pages - inMax >= 2) pagination.splice(-1, 0, null);
  }

  const pageHandler = (page: number) => {
    const query = router.query;
    query.p = page.toString();
    if (page == 1) delete query.p;
    const params = Object.entries(query)
      .map(q => `${q[0]}=${q[1]}`)
      .join("&");
    router.push(`${router.pathname}${params ? `?${params}` : ""}`);
  };

  return (
    <div className={styles.Pagination}>
      {pagination.map((p, i) =>
        p == page ? (
          <span key={`pg${i}`} className={[styles.Page, styles.Active].join(" ")}>
            {p}
          </span>
        ) : p ? (
          <button
            key={`pg${i}`}
            className={styles.Page}
            onClick={() => {
              pageHandler(p);
            }}>
            {p}
          </button>
        ) : (
          <span key={`pg${i}`} className={styles.PageSeparator}>
            |
          </span>
        )
      )}
    </div>
  );
}

export default Pagination;
