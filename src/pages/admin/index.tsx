import type { NextPageWithLayout } from "../_app";
import Page from "$src/layouts/main/components/page";
import MainLayout from "$src/layouts/main";

const Admin: NextPageWithLayout = () => {
  return (
    <Page.Body>
      <Page.Article className="w-full md:w-9/12 lg:w-9/12 xl:w-8/12 2xl:w-7/12">
        <Page.Section>
          Test
        </Page.Section>
      </Page.Article>
    </Page.Body>
  );
};

Admin.getLayout = function (page) {
  return (
    <MainLayout title="Admin" menu>
      {page}
    </MainLayout>
  );
};

export default Admin;
