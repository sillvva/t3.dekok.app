import type { NextPageWithLayout } from "../_app";
import { KeyboardEventHandler, useCallback, useState } from "react";
import Image from "next/future/image";
import Icon from "@mdi/react";
import { mdiOpenInNew, mdiRefresh, mdiTrashCan, mdiUpload } from "@mdi/js";
import { useRouter } from "next/router";
import MainLayout from "$src/layouts/main";
import PageMessage from "$src/components/page-message";
import { trpc } from "$src/utils/trpc";
import { useAuthentication } from "$src/utils/hooks";
import { itemsPerPage } from "$src/utils/constants";
import { toBase64 } from "$src/utils/misc";
import Pagination from "$src/components/pagination";

const Admin: NextPageWithLayout = () => {
  const router = useRouter();
  const { user, isLoading } = useAuthentication({ login: true });

  const page = parseInt(router.query.page ? (Array.isArray(router.query.page) ? router.query.page[0] : router.query.page) : "1");
  const qSearch = Array.isArray(router.query.search) ? router.query.search[0] : router.query.search;
  const [query, setQuery] = useState(qSearch || "");

  const queryHandler: KeyboardEventHandler<HTMLInputElement> = useCallback(
    e => {
      const search = new URLSearchParams(location.search);
      const target = e.target as HTMLInputElement;

      if (page <= 1) search.delete("page");
      else search.set("page", page.toString());
      if (target.value === "") search.delete("q");
      else search.set("q", target.value);

      const params = search.toString();
      history.pushState({}, "", `${location.pathname}${params ? `?${params}` : ""}`);
      setQuery(target.value);
    },
    [page]
  );

  const utils = trpc.useContext();

  const { data: posts, isFetching } = trpc.useQuery(["posts.get"], {
    enabled: !!user,
    refetchOnWindowFocus: false
  });

  const revalidator = trpc.useMutation(["site.revalidate"]);

  const refresh = useCallback(() => {
    utils.invalidateQueries(["posts.get"]);
    utils.invalidateQueries(["site.admin"]);
  }, [utils]);

  const uploadMutation = trpc.useMutation(["posts.post"], {
    onSuccess({ error }, { slug }) {
      // toasts.add("success", "Post uploaded successfully");
      // toasts.add("error", error);
      refresh();
      revalidator.mutate({ paths: [`/blog/${slug}`] });
    }
  });

  const deleteMutation = trpc.useMutation(["posts.delete"], {
    onSuccess({ error }, { slug }) {
      // toasts.add("success", "Post uploaded successfully");
      // toasts.add("error", error);
      refresh();
      revalidator.mutate({ paths: [`/blog/${slug}`] });
    }
  });

  const upload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*/*";
    input.onchange = async () => {
      if (!input.files) return;
      const file = input.files[0];
      if (!file.name.endsWith(".md")) return alert("Only markdown files are supported");
      const blob = new Blob([file], { type: file.type });
      const base64 = await toBase64(blob);
      uploadMutation.mutate({ file: base64, filename: file.name, slug: file.name.slice(0, -3) });
    };
    input.click();
  };

  const remove = async (slug: string) => {
    // if (!confirm("Are you sure you want to delete this post?")) return;
    revalidator.mutate({ paths: [`/blog/${slug}`] });
    // deleteMutation.mutate({ slug });
  };

  if (isLoading && !user) return <PageMessage>Authenticating...</PageMessage>;
  if (!posts || !posts.length) return <PageMessage>No posts found</PageMessage>;

  const loading = !(posts && !isFetching);
  const numloaders = Math.min(itemsPerPage, posts.length ?? itemsPerPage);
  const loaders = loading ? numloaders : 0;
  const filteredPosts =
    query.length > 2
      ? posts
          .filter(post => {
            return (
              post.title.toLowerCase().includes(query.toLowerCase()) ||
              (post.description || "").toLowerCase().includes(query.toLowerCase()) ||
              (post.tags as string[]).find(tag => tag.toLowerCase() == query.toLowerCase())
            );
          })
          .sort((a, b) => (a.date > b.date ? -1 : 1))
      : posts.sort((a, b) => (a.date > b.date ? -1 : 1));
  const pages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <input type="text" value={qSearch} onKeyUp={queryHandler} placeholder="Search" className="p-2 rounded-md w-full shadow-md" />
        </div>
        <div className="md:flex-1 flex justify-end gap-4">
          <button onClick={() => refresh()}>
            <Icon path={mdiRefresh} className="w-6 h-6" />
          </button>
          <button onClick={upload}>
            <Icon path={mdiUpload} className="w-6 h-6" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
        {loaders == 0
          ? paginatedPosts.map(post => (
              <div key={post.slug} className="flex flex-col bg-theme-article p-0 rounded-md shadow-md relative overflow-hidden">
                <div className="aspect-video relative hidden sm:block">
                  <a href="/blog/{post.slug}" target="_blank" className="relative block aspect-video overflow-hidden">
                    <Image src={post.image} alt={post.title} className="bg-black w-full h-full object-cover object-center" width={400} height={300} />
                  </a>
                  <a type="button" className="fab absolute top-2 right-2 !w-9 !h-9 bg-red-700 drop-shadow-theme-text" onClick={() => remove(post.slug)}>
                    <Icon path={mdiTrashCan} size={0.8} />
                  </a>
                </div>
                <div className="flex flex-row items-center gap-2 px-3 py-2">
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-semibold pb-1 font-robo-flex">
                      <a href="/blog/{post.slug}" target="_blank" className="text-theme-link">
                        {post.title}
                        <Icon path={mdiOpenInNew} size={0.8} className="ml-1 inline" />
                      </a>
                    </h4>
                    <div className="text-sm">Posted: {new Date(post.date).toLocaleDateString()}</div>
                  </div>
                  <a
                    type="button"
                    className="fab !w-9 !h-9 bg-red-700 drop-shadow-theme-text sm:hidden inline-flex justify-center items-center"
                    onClick={() => remove(post.slug)}>
                    <Icon path={mdiTrashCan} size={0.8} />
                  </a>
                </div>
              </div>
            ))
          : Array(loaders)
              .fill(1)
              .map((l, i) => (
                <div className="flex flex-col bg-theme-article p-0 rounded-md shadow-md relative overflow-hidden" key={i}>
                  <div className="aspect-video motion-safe:animate-pulse bg-theme-hover bg-opacity-15 hidden sm:block" />
                  <div className="flex-1 flex flex-col p-3 gap-2">
                    <div className="w-2/3 h-6 flex items-center max-w-xs">
                      <span className="motion-safe:animate-pulse bg-gray-500/50 block overflow-hidden w-full h-full rounded-full bg-theme-hover bg-opacity-15" />
                    </div>
                    <div className="w-full h-4 flex items-center">
                      <span className="motion-safe:animate-pulse bg-gray-500/50 block overflow-hidden w-full h-full rounded-full bg-theme-hover bg-opacity-15" />
                    </div>
                  </div>
                </div>
              ))}
      </div>
      {pages > 0 && loaders == 0 && <Pagination page={page} pages={pages} />}
    </div>
  );
};

Admin.getLayout = function (page) {
  return <MainLayout layout="admin">{page}</MainLayout>;
};

export default Admin;
