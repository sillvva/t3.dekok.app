import Page from "$src/components/layouts/main/page";
import { NextPageWithLayout } from "../_app";
import MainLayout from "$src/layouts/main";

const Images: NextPageWithLayout = () => {
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

Images.getLayout = function (page) {
  return (
    <MainLayout title="Images" menu>
      {page}
    </MainLayout>
  );
};

export default Images;
