import { NextPageWithLayout } from "../_app";
import { KeyboardEventHandler, useCallback, useState } from "react";
import { useRouter } from "next/router";
import { mdiContentCopy, mdiRefresh, mdiTrashCan, mdiUpload } from "@mdi/js";
import { toast } from "react-toastify";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { inferQueryOutput, trpc } from "$src/utils/trpc";
import { itemsPerPage } from "$src/utils/constants";
import { toBase64 } from "$src/utils/misc";
import MainLayout from "$src/layouts/main";
import PageMessage from "$src/components/page-message";
import Image from "next/future/image";
import Icon from "@mdi/react";
import Pagination from "$src/components/pagination";
import { useRipple } from "$src/components/ripple";

const Images: NextPageWithLayout = () => {
	const router = useRouter();
	const { images, isFetching, isMutating, upload, remove, refresh } = useImages();
	const [parent] = useAutoAnimate<HTMLDivElement>();

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

	const loading = !(images && !isFetching) || isMutating;
	if (!loading && !images.length) return <PageMessage>No images found</PageMessage>;

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

	return (
		<div className="flex flex-col gap-4">
			<div className="flex gap-2">
				<div className="flex-1">
					<input type="text" value={qSearch} onKeyUp={queryHandler} placeholder="Search" className="input bg-theme-article w-full shadow-md" />
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
					? paginatedImages.map(image => <Card key={image.name} image={image} remove={remove} />)
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
	return <MainLayout layout="admin">{page}</MainLayout>;
};

export default Images;

const Card = ({ image, remove }: { image: inferQueryOutput<"images.get">[number]; remove: (name: string) => void }) => {
	const { ripples, rippleClass, mouseHandler } = useRipple();

	return (
		<a
			key={image.name}
			href={image.url}
			className={`block relative overflow-hidden rounded-lg h-16 sm:h-56 ${rippleClass}`}
			target="_blank"
			rel="noreferrer noopener">
			<button
				className="fab fab-small absolute hidden sm:flex top-2 right-2 bg-red-700 drop-shadow-theme-text"
				onClick={ev => {
					ev.preventDefault();
					remove(image.name);
				}}>
				<Icon path={mdiTrashCan} size={0.8} />
			</button>
			<button
				className="fab fab-small absolute hidden sm:flex top-12 right-2 bg-theme-link drop-shadow-theme-text"
				onClick={ev => {
					ev.preventDefault();
					navigator.clipboard.writeText(image.url);
          toast("Copied to clipboard", { className: "!alert !alert-success !rounded-lg" });
				}}>
				<Icon path={mdiContentCopy} size={0.8} />
			</button>
			<div className="flex sm:block gap-2 absolute bottom-0 w-full h-full sm:h-auto p-4 bg-theme-body/90">
				<div className="flex-1">
					<h5 className="text-sm text-theme-link">{image.name}</h5>
					<p className="text-xs text-theme-faded">Uploaded: {new Date(image.created_at).toLocaleDateString()}</p>
				</div>
				<div className="flex sm:hidden items-center">
					<button
						className="fab fab-small bg-red-700 drop-shadow-theme-text"
						onClick={ev => {
							ev.preventDefault();
							remove(image.name);
						}}>
						<Icon path={mdiTrashCan} size={0.8} />
					</button>
				</div>
			</div>
			<Image
				src={image.url}
				alt={image.name}
				priority
				className="bg-black w-full h-full object-cover object-center"
        onMouseDown={mouseHandler}
				width={400}
				height={300}
			/>
			{ripples}
		</a>
	);
};

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
