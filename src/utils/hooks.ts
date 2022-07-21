import { PageHeadProps } from "$src/layouts/main";
import { useQuery } from "@tanstack/react-query";

export const usePageProps = (props: PageHeadProps) => {
  return useQuery(["page-props"], async () => props, {
    refetchOnMount: "always"
  });
};
