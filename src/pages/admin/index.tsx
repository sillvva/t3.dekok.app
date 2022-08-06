import type { NextPageWithLayout } from "../_app";
import type { ChangeEventHandler } from "react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { mdiRefresh, mdiUpload } from "@mdi/js";
import qs from "qs";
import { z } from "zod";
import { toast } from "react-toastify";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { trpc } from "$src/utils/trpc";
import { itemsPerPage } from "$src/utils/constants";
import { qsParse, toBase64 } from "$src/utils/misc";
import MainLayout from "$src/layouts/main";
import PageMessage from "$src/components/page-message";
import Icon from "@mdi/react";
import Pagination from "$src/components/pagination";
import AdminCard from "$src/components/admin-card";

const Admin: NextPageWithLayout = () => {
	const router = useRouter();
	const { posts, isFetching, isMutating, upload, remove, refresh } = usePosts();
	const [parent] = useAutoAnimate<HTMLDivElement>();

	const { data: search, errors: qsErrors } = qsParse(
		router.query,
		z.object({
			page: z.number().optional(),
			q: z.union([z.string(), z.number(), z.boolean()]).optional()
		})
	);

	const [page, setPage] = useState(search.page ?? 1);
	const [query, setQuery] = useState((search.q ?? "").toString());

	const queryHandler: ChangeEventHandler<HTMLInputElement> = useCallback(e => {
		const target = e.target as HTMLInputElement;
		setQuery(target.value);
	}, []);

	const loading = !(posts && !isFetching) || isMutating;
	const numloaders = Math.min(itemsPerPage, posts?.length ?? itemsPerPage);
	const loaders = loading ? numloaders : 0;
	const filteredPosts =
		query.length > 2
			? (posts || [])
					.filter(post => {
						return (
							post.title.toLowerCase().includes(query.toLowerCase()) ||
							(post.description || "").toLowerCase().includes(query.toLowerCase()) ||
							(post.tags as string[]).find(tag => tag.toLowerCase() == query.toLowerCase())
						);
					})
					.sort((a, b) => (a.date > b.date ? -1 : 1))
			: (posts || []).sort((a, b) => (a.date > b.date ? -1 : 1));
	const pages = Math.ceil(filteredPosts.length / itemsPerPage);
	const paginatedPosts = filteredPosts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

	useEffect(() => {
		setPage(search.page ?? 1);
	}, [search.page]);

	useEffect(() => {
		if (qsErrors) qsErrors.forEach(message => console.error(message));
    
    const newSearch: typeof search = {};
    let currentPage = page;

    if (isNaN(currentPage)) currentPage = 1;
    if (currentPage > pages) currentPage = pages;
    if (currentPage > 1) newSearch.page = currentPage;
    if (query !== "") newSearch.q = query;

    if (page !== newSearch.page) setPage(newSearch.page || 1);

    const params = qs.stringify(newSearch);
    
    const url = `${location.pathname}${params ? `?${params}` : ""}`;
    if (router.asPath !== url) router.push(url);
	}, [page, query, pages, search, qsErrors, router]);

	if (!loading && !posts.length) return <PageMessage>No posts found</PageMessage>;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex gap-2">
				<div className="flex-1">
					<input type="text" value={query} onChange={queryHandler} placeholder="Search" className="input bg-theme-article w-full shadow-md" />
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
			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2" ref={parent}>
				{loaders == 0
					? paginatedPosts.map(post => (
							<AdminCard
								key={post.id}
								id={post.slug}
								url={`/blog/${post.slug}`}
								title={post.title}
								description={post.description}
								image={post.image}
								date={post.date}
								remove={remove}
							/>
					  ))
					: Array(loaders)
							.fill(1)
							.map((l, i) => (
								<div className="bg-theme-article p-0 rounded-md shadow-md relative overflow-hidden h-16 sm:h-56" key={i}>
									<div className="absolute inset-0 motion-safe:animate-pulse bg-theme-hover bg-opacity-15 hidden sm:block" />
									<div className="absolute bottom-0 w-full flex-1 flex flex-col p-3 gap-2">
										<div className="loader-line w-2/3 h-4 max-w-xs" />
										<div className="loader-line w-1/2 h-3" />
										<div className="loader-line w-full h-3" />
										<div className="loader-line w-full h-3" />
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

const usePosts = () => {
	const utils = trpc.useContext();
	const [isMutating, setMutating] = useState(true);

	const { data: posts, isFetching } = trpc.useQuery(["posts.get"], {
		refetchOnWindowFocus: false,
		onSuccess() {
			setMutating(false);
		}
	});

	const revalidator = trpc.useMutation(["site.revalidate"]);

	const refresh = useCallback(() => {
		utils.invalidateQueries(["posts.get"]);
		utils.invalidateQueries(["site.admin"]);
	}, [utils]);

	const uploadMutation = trpc.useMutation(["posts.post"], {
		onSuccess({ success }, { slug }) {
			if (success) {
				toast("Post uploaded successfully", { className: "!alert !alert-success !rounded-lg" });
				revalidator.mutate({ paths: [`/blog/${slug}`] });
			} else toast("Post upload failed", { className: "!bg-red-400 !text-white !rounded-lg" });
			refresh();
		},
		onMutate() {
			setMutating(true);
		}
	});

	const deleteMutation = trpc.useMutation(["posts.delete"], {
		onSuccess({ success }, { slug }) {
			if (success) {
				toast("Post deleted successfully", { className: "!alert !alert-success !rounded-lg" });
				revalidator.mutate({ paths: [`/blog/${slug}`] });
			} else toast("Post delete failed", { className: "!bg-red-400 !text-white !rounded-lg" });
			refresh();
		},
		onMutate() {
			setMutating(true);
		}
	});

	const upload = useCallback(async () => {
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
	}, [uploadMutation]);

	const remove = useCallback(
		async (slug: string) => {
			if (!confirm("Are you sure you want to delete this post?")) return;
			deleteMutation.mutate({ slug });
		},
		[deleteMutation]
	);

	return {
		posts,
		isFetching,
		isMutating,
		upload,
		remove,
		refresh
	};
};
