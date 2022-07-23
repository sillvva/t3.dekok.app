import type { NextPageWithLayout } from "../_app";
import Page from "$src/layouts/main/components/page";
import MainLayout from "$src/layouts/main";
import { useAuthentication } from "./_hooks";
import PageMessage from "$src/components/page-message";

const Admin: NextPageWithLayout = () => {
  const { user, isLoading } = useAuthentication({ login: true });

  if (isLoading && !user) return <PageMessage>Authenticating...</PageMessage>;

  return <>Test</>;
};

Admin.getLayout = function (page) {
  return <MainLayout layout="admin">{page}</MainLayout>;
};

export default Admin;
