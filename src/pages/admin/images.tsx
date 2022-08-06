import { NextPageWithLayout } from "../_app";
import { ChangeEventHandler, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { mdiRefresh, mdiUpload } from "@mdi/js";
import qs from "qs";
import { z } from "zod";
import { toast } from "react-toastify";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { itemsPerPage } from "$src/utils/constants";
import { qsParse, toBase64 } from "$src/utils/misc";
import { trpc } from "$src/utils/trpc";
import MainLayout from "$src/layouts/main";
import PageMessage from "$src/components/page-message";
import Icon from "@mdi/react";
import Pagination from "$src/components/pagination";
import AdminCard from "$src/components/admin-card";

const Images: NextPageWithLayout = () => {
	const router = useRouter();
	const { images, isFetching, isMutating, upload, remove, refresh } = useImages();
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

	const loading = !(images && !isFetching) || isMutating;
	const numloaders = Math.min(itemsPerPage, images?.length ?? itemsPerPage);
	const loaders = loading ? numloaders : 0;
	const filteredImages =
		query.length > 2
			? (images || [])
					.filter(image => {
						return image.name.toLowerCase().includes(query.toLowerCase());
					})
					.sort((a, b) => (a.created_at > b.created_at ? -1 : 1))
			: (images || []).sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
	const pages = Math.ceil(filteredImages.length / itemsPerPage);
	const paginatedImages = filteredImages.slice((page - 1) * itemsPerPage, page * itemsPerPage);

	useEffect(() => {
		setPage(search.page ?? 1);
	}, [search.page]);

	useEffect(() => {
		if (qsErrors) qsErrors.forEach(message => console.error(message));
    
		const newSearch: typeof search = {};
		let currentPage = page;

		if (currentPage > pages) currentPage = pages;
		if (currentPage > 1) newSearch.page = currentPage;
		if (query !== "") newSearch.q = query;

		if (page !== newSearch.page) setPage(newSearch.page || 1);

		const params = qs.stringify(newSearch);
    
    const url = `${location.pathname}${params ? `?${params}` : ""}`;
    if (router.asPath !== url) router.push(url);
	}, [page, query, pages, search, qsErrors, router]);

	if (!loading && !images.length) return <PageMessage>No images found</PageMessage>;

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
					? paginatedImages.map(image => (
							<AdminCard key={image.name} id={image.name} url={image.url} title={image.name} image={image.url} date={image.created_at} copy remove={remove} />
					  ))
					: Array(loaders)
							.fill(1)
							.map((l, i) => (
								<div className="bg-theme-article p-0 rounded-md shadow-md relative overflow-hidden h-16 sm:h-56" key={i}>
									<div className="absolute inset-0 motion-safe:animate-pulse bg-theme-hover bg-opacity-15 hidden sm:block" />
									<div className="absolute bottom-0 w-full flex-1 flex flex-col p-3 gap-2">
										<div className="loader-line w-2/3 h-4 max-w-xs" />
										<div className="loader-line w-1/2 h-3" />
									</div>
								</div>
							))}
			</div>
			{pages > 0 && loaders == 0 && <Pagination page={page} pages={pages} />}
		</div>
	);
};

Images.getLayout = function (page) {
	return <MainLayout layout="admin" metaTitle="Images - Admin">{page}</MainLayout>;
};

export default Images;

const useImages = () => {
	const utils = trpc.useContext();
	const [isMutating, setMutating] = useState(true);

	const { data: images, isFetching } = trpc.useQuery(["images.get"], {
		refetchOnWindowFocus: false,
		onSuccess() {
			setMutating(false);
		}
	});

	const refresh = useCallback(() => {
		utils.invalidateQueries(["images.get"]);
		utils.invalidateQueries(["site.admin"]);
	}, [utils]);

	const uploadMutation = trpc.useMutation(["images.post"], {
		onSuccess({ success }) {
			if (success) toast("Image uploaded successfully", { className: "!alert !alert-success !rounded-lg" });
			else toast("Image upload failed", { className: "!bg-red-400 !text-white !rounded-lg" });
			refresh();
		},
		onMutate() {
			setMutating(true);
		}
	});

	const deleteMutation = trpc.useMutation(["images.delete"], {
		onSuccess({ success }) {
			if (success) toast("Image deleted successfully", { className: "!alert !alert-success !rounded-lg" });
			else toast("Image delete failed", { className: "!bg-red-400 !text-white !rounded-lg" });
			refresh();
		},
		onMutate() {
			setMutating(true);
		}
	});

	const fileExists = useCallback(
		(name: string) => {
			return images?.find(image => image.name === name);
		},
		[images]
	);

	const upload = useCallback(async () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/*";
		input.onchange = async () => {
			if (!input.files) return;
			const file = input.files[0];
			let name = file.name;
			const parts = name.split(".");
			const blob = new Blob([file], { type: file.type });
			const base64 = await toBase64(blob);
			let overwrite = false;

			if (fileExists(name)) {
				if (confirm("File already exists. Overwrite?")) {
					overwrite = true;
				} else {
					let newName = prompt("Enter a new file name", `_${name}`) || "";
					if (newName.trim()) {
						const newParts = newName.trim().split(".");
						newName = newName + (parts[parts.length - 1] === newParts[newParts.length - 1] ? "" : "." + parts[parts.length - 1]);
						if (newName.trim() === name) {
							while (fileExists(name)) {
								name = `_${name}`;
							}
						} else name = newName;
					} else {
						return;
					}
				}
			}
			uploadMutation.mutate({ file: base64, filename: file.name, upsert: overwrite });
		};
		input.click();
	}, [uploadMutation, fileExists]);

	const remove = useCallback(
		async (filename: string) => {
			if (!confirm("Are you sure you want to delete this image?")) return;
			deleteMutation.mutate({ filename });
		},
		[deleteMutation]
	);

	return {
		images,
		isFetching,
		isMutating,
		upload,
		remove,
		refresh
	};
};
