import type { NextPageWithLayout } from "../_app";
import MainLayout from "$src/layouts/main";
import { useAuthentication } from "./_hooks";
import PageMessage from "$src/components/page-message";
import { trpc } from "$src/utils/trpc";

const Admin: NextPageWithLayout = () => {
  const { user, isLoading } = useAuthentication({ login: true });
  const { data } = trpc.useQuery(["posts.admin"], {
    enabled: !!user,
    refetchOnWindowFocus: false
  });

  if (isLoading && !user) return <PageMessage>Authenticating...</PageMessage>;

  return <>Test</>;
};

Admin.getLayout = function (page) {
  return <MainLayout layout="admin">{page}</MainLayout>;
};

export default Admin;
