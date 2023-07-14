import Image from "next/future/image";
import Link from "next/link";
import Icon from "@mdi/react";
import { mdiContentCopy, mdiTrashCan } from "@mdi/js";
import { toast } from "react-toastify";
import { useRipple } from "./ripple";

type CardProps = {
	id: string;
	url: string;
	title: string;
	description?: string | null;
	image: string;
	date: Date | string;
	copy?: boolean;
	remove: (id: string) => Promise<void>;
};

export default function AdminCard({ id, url, title, description, image, date, copy, remove }: CardProps) {
	const { ripples, mouseHandler } = useRipple();

	return (
		<Link href={url}>
			<a className={`block relative isolate overflow-hidden rounded-lg h-16 sm:h-56`} target="_blank" rel="noreferrer noopener">
				<button
					className="fab fab-small absolute z-20 hidden sm:flex top-2 right-2 bg-red-700 drop-shadow-theme-text"
					onClick={ev => {
						ev.preventDefault();
						remove(id);
					}}>
					<Icon path={mdiTrashCan} size={0.8} />
				</button>
				{copy && (
					<button
						className="fab fab-small absolute hidden sm:flex top-12 right-2 bg-theme-link drop-shadow-theme-text"
						onClick={ev => {
							ev.preventDefault();
							navigator.clipboard.writeText(url);
							toast("Copied to clipboard", { className: "!alert !alert-success !rounded-lg" });
						}}>
						<Icon path={mdiContentCopy} size={0.8} />
					</button>
				)}
				<div className="flex sm:block gap-2 absolute bottom-0 w-full h-full sm:h-auto p-4 bg-theme-body/90">
					<div className="flex-1">
						<h5 className="text-sm text-theme-link">{title}</h5>
						<p className="text-xs text-theme-faded">Posted: {new Date(date).toLocaleDateString()}</p>
						{description && <p className="text-xs text-theme-base hidden sm:block">{description}</p>}
					</div>
					<div className="flex sm:hidden items-center">
						<button
							className="fab fab-small bg-red-700 drop-shadow-theme-text relative z-20"
							onClick={ev => {
								ev.preventDefault();
								remove(id);
							}}>
							<Icon path={mdiTrashCan} size={0.8} />
						</button>
					</div>
				</div>
				<Image
					src={image}
					alt={title}
					priority
					className="bg-black w-full h-full object-cover object-center"
					onMouseDown={mouseHandler}
					width={400}
					height={300}
				/>
				{ripples}
			</a>
		</Link>
	);
}
