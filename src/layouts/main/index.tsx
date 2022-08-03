import { useEffect, useState, useCallback } from "react";
import ReactDom from "react-dom";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { mdiChevronLeft, mdiMenu, mdiPalette } from "@mdi/js";
import { AnimatePresence, motion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import { Slide, ToastContainer } from "react-toastify";
import { concatenate, debounce } from "$src/utils/misc";
import { useAuthentication } from "$src/utils/hooks";
import Link from "next/link";
import Image from "next/future/image";
import Page from "./components/page";
import Icon from "@mdi/react";
import NextNProgress from "$src/components/progress";
import PageMeta from "$src/components/meta";
import { trpc } from "$src/utils/trpc";
import PageMessage from "$src/components/page-message";

const PageMenu = dynamic(() => import("./components/menu"));
const Drawer = dynamic(() => import("./components/drawer"));
const menuItems = [
	{ link: "/", label: "Intro" },
	{ link: "/about", label: "About Me" },
	{ link: "/experience", label: "Experience" },
	{ link: "/skills", label: "Skills" },
	{ link: "/projects", label: "Projects" },
	{ link: "/blog", label: "Blog" }
];

const MainLayout = (props: React.PropsWithChildren<MainLayoutProps>) => {
	const { theme, setTheme } = useTheme();
	const { user, isLoading } = useAuthentication({ login: props.layout === "admin" });
	const [oldTheme, setOldTheme] = useState(theme || "");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const mm = matchMedia("(prefers-color-scheme: dark)");
		const listener = () => setTheme(mm.matches ? "dark" : "light");

		if (theme == "system") listener();
		mm.addEventListener("change", listener);
		return () => mm.removeEventListener("change", listener);
	}, [theme, setTheme]);

	useEffect(() => {
		document.documentElement.dataset.scroll = window.scrollY.toString();
		const scrollHandler = debounce(() => {
			document.documentElement.dataset.scroll = window.scrollY.toString();
		});

		setMounted(true);
		window.addEventListener("scroll", scrollHandler, { passive: true });
		return () => window.removeEventListener("scroll", scrollHandler);
	}, []);

	const themeChangeHandler = (newTheme: string) => {
		setOldTheme(newTheme);
	};

	if (props.layout == "admin" && !user) return null;

	return (
		<div id="app" className="min-h-screen min-w-screen">
			<NextNProgress color="var(--color-bg-link)" height={1} options={{ showSpinner: false }} />
			<PageMeta title={props.title} description={props.meta?.description} image={props.meta?.image} articleMeta={props.meta?.articleMeta} />
			<AnimatePresence initial={mounted}>
				{theme && theme !== oldTheme && <Page.Bg theme={oldTheme || ""} mounted={mounted} />}
				<Page.Bg key={theme} theme={theme} mounted={mounted} />
			</AnimatePresence>
			<PageHeader head={props} layoutMotion={fadeMotion} onThemeChange={themeChangeHandler} />
			{props.layout == "admin" ? (
				<div className="flex flex-col md:flex-row relative">
					<AdminMenu {...props} />
					{!user ? <PageMessage>{isLoading ? "Authenticating..." : "Not logged in"}</PageMessage> : <LayoutBody {...props}>{props.children}</LayoutBody>}
				</div>
			) : (
				<LayoutBody {...props}>{props.children}</LayoutBody>
			)}
			<div id="drawer-root" />
			<ToastContainer position="top-center" transition={Slide} autoClose={10000} pauseOnHover pauseOnFocusLoss closeOnClick toastClassName="!alert" />
		</div>
	);
};

export default MainLayout;

const LayoutBody = (props: React.PropsWithChildren<MainLayoutProps>) => {
	const router = useRouter();

	return (
		<AnimatePresence initial={false} exitBeforeEnter>
			<motion.main
				key={`main${router.pathname}`}
				className={concatenate(
					"relative flex-1 flex-col justify-center items-center z-[2] px-2 md:px-4",
					router.pathname == "/" ? "h-screen" : props.layout === "admin" ? "md:pt-20 pb-4" : props.title ? "pt-24 lg:pt-36 pb-4" : "pt-20 pb-4"
				)}
				variants={fadeMotion.variants}
				initial="hidden"
				animate="enter"
				exit="exit"
				transition={fadeMotion.transition}>
				{props.children}
			</motion.main>
		</AnimatePresence>
	);
};

type Motion = { variants?: Variants; transition?: Transition };

export const fadeMotion: Motion = {
	variants: {
		hidden: { opacity: 0 },
		enter: { opacity: 1 },
		exit: { opacity: 0 }
	},
	transition: {
		duration: 0.25
	}
};

export type MainLayoutProps = {
	title?: string;
	menu?: boolean;
	layout?: "admin";
	drawer?: boolean;
	path?: string;
	meta?: LayoutMeta;
	headerClasses?: string[];
	backTo?: string | boolean;
};

type LayoutMeta = {
	title: string;
	description: string;
	image: string;
	articleMeta?: object;
};

type PageHeaderProps = {
	head: MainLayoutProps;
	layoutMotion?: { variants?: Variants; transition?: Transition };
	onThemeChange?: (theme: string) => void;
};

const PageHeader = ({ head, layoutMotion, onThemeChange }: PageHeaderProps) => {
	const router = useRouter();
	const { user } = useAuthentication();
	const { theme, setTheme, themes } = useTheme();
	const [menu, setMenu] = useState(true);
	const [drawerRoot, setDrawerRoot] = useState<HTMLElement | null>(null);
	const [drawer, setDrawer] = useState({
		state: false,
		action: ""
	});

	useEffect(() => {
		const listener = (ev: string) => {
			if (ev == "/") setMenu(false);
			else setMenu(true);
		};

		router.events.on("routeChangeStart", listener);
		return () => router.events.off("routeChangeStart", listener);
	}, [router.events]);

	const smallTitle = (head?.title?.length || 0) > 12;
	const items = head?.menu && menu ? menuItems : [];
	const baseThemes = themes.filter(t => t !== "system");
	const nextTheme = baseThemes[(baseThemes.indexOf(theme || "") + 1) % baseThemes.length] || "";

	const themeChangeHandler = useCallback(
		(theme: string) => {
			if (!onThemeChange) return;
			onThemeChange(theme);
			setTimeout(() => {
				onThemeChange(nextTheme);
			}, 500);
		},
		[onThemeChange, nextTheme]
	);

	function drawerToggleHandler() {
		if (!drawerRoot) setDrawerRoot(document.getElementById("drawer-root"));
		if (drawer.state) {
			setDrawer({ state: true, action: "closing" });
			setTimeout(() => {
				setDrawer({ state: false, action: "" });
			}, 500);
		} else {
			setDrawer({ state: true, action: "opening" });
			setTimeout(() => {
				drawer.action = "";
				setDrawer({ state: true, action: "" });
			}, 500);
		}
	}

	return (
		<header className={concatenate("flex flex-col items-center transition-all duration-500", "fixed top-0 left-0 right-0 z-[3] scroll-blur")}>
			<div className="flex gap-4 w-full py-4 px-2 2xs:px-3 items-center text-center max-h-[80px]">
				<div className="w-12">
					{head?.backTo === true ? (
						<button className="fab" onClick={router.back}>
							<Icon path={mdiChevronLeft} />
						</button>
					) : head?.backTo ? (
						<Link href={head?.backTo}>
							<a className="fab">
								<Icon path={mdiChevronLeft} />
							</a>
						</Link>
					) : (
						<button
							type="button"
							aria-label="Open Drawer"
							onClick={drawerToggleHandler}
							className={concatenate("fab", "flex", (head?.menu || router.asPath === "/") && "lg:hidden")}>
							<Icon path={mdiMenu} />
						</button>
					)}
				</div>
				{drawerRoot && drawer.state && ReactDom.createPortal(<Drawer {...drawer} toggle={drawerToggleHandler} menuItems={menuItems} />, drawerRoot)}
				<div className="flex-1 block relative h-14">
					{head?.menu ? <nav className={concatenate("hidden justify-center gap-3 px-3 lg:flex")}>{items.length ? <PageMenu items={items} /> : ""}</nav> : ""}
					<AnimatePresence initial={false} exitBeforeEnter>
						{head?.title && (
							<motion.h1
								variants={layoutMotion?.variants}
								key={`title: ${head?.title} ${router.pathname}`}
								initial="hidden"
								animate="enter"
								exit="exit"
								transition={layoutMotion?.transition}
								className={concatenate(
									"text-theme-heading font-medium font-montserrat",
									"drop-shadow-theme-text-outline lg:mt-4 lg:mb-4",
									"flex lg:hidden justify-center items-center flex-1 p-2 absolute inset-0",
									smallTitle ? "text-sm sm:text-lg md:text-2xl" : "text-3xl"
								)}>
								{head?.title}
							</motion.h1>
						)}
					</AnimatePresence>
					{head?.layout == "admin" && user && (
						<div className="flex flex-1 justify-end items-center w-full h-14 gap-4">
							<Link href="/api/auth/logout">
								<a className="text-theme-link">Sign out</a>
							</Link>
							<span className="hidden xs:inline">|</span>
							<a href={`https://github.com/${user.user_metadata.user_name}`} target="_blank" rel="noreferrer noopener" className="flex gap-4 items-center">
								<span className="hidden xs:inline">{user.user_metadata.preferred_username}</span>
								<div className="avatar">
									<div className="w-10 rounded-full ring ring-theme-link ring-offset-theme-base ring-offset-2">
										<Image
											src={user.user_metadata.avatar_url}
											alt={user.user_metadata.preferred_username}
											priority
											width={40}
											height={40}
											className="rounded-full"
										/>
									</div>
								</div>
							</a>
						</div>
					)}
				</div>
				<div className={concatenate("w-12", head?.layout == "admin" && "hidden xs:block")}>
					<button
						type="button"
						aria-label="Toggle Theme"
						onClick={() => {
							themeChangeHandler(theme || "");
							setTheme(nextTheme);
						}}
						className={`fab my-3`}>
						<Icon path={mdiPalette} />
					</button>
				</div>
			</div>
			<AnimatePresence initial={false} exitBeforeEnter>
				{head?.title && (
					<motion.h1
						variants={layoutMotion?.variants}
						key={`title: ${head?.title} ${router.pathname}`}
						initial="hidden"
						animate="enter"
						exit="exit"
						transition={layoutMotion?.transition}
						className={concatenate(
							"text-3xl text-center text-theme-heading font-medium font-montserrat",
							"drop-shadow-theme-text-outline lg:mt-4 lg:mb-4",
							"hidden lg:block"
						)}>
						{head?.title}
					</motion.h1>
				)}
			</AnimatePresence>
		</header>
	);
};

const AdminMenu = (layoutProps: MainLayoutProps) => {
	const router = useRouter();
	const [menuState, setMenuState] = useState(false);

	const toggleMenu = useCallback((state: boolean) => {
		if (window.innerWidth >= 768) return false;
		setMenuState(!state);
	}, []);

	const utils = trpc.useContext();
	const { data: admin, isFetching } = trpc.useQuery(["site.admin"], {
		enabled: layoutProps.layout == "admin",
		refetchOnWindowFocus: false
	});

	useEffect(() => {
		if (!admin && !isFetching && router.pathname.startsWith("/admin")) {
			utils.invalidateQueries(["site.admin"]);
		}
	}, [utils, router.pathname, admin, isFetching]);

	const paths = [
		{ name: "Blog", path: "/admin", value: admin?.numposts, label: "posts" },
		{ name: "Images", path: "/admin/images", value: admin?.numimages, label: "images" }
		// { name: "Experience", path: "/admin/experience", value: $admin.numexperience, label: "items" },
		// { name: "Skills", path: "/admin/skills", value: $admin.numskills, label: "skills" },
		// { name: "Projects", path: "/admin/projects", value: $admin.numprojects, label: "projects" }
	];
	const resources = [
		{ name: "Github", path: "https://github.com/sillvva/t3.dekok.app" },
		{ name: "Vercel", path: "https://vercel.com/dashboard" },
		{ name: "Supabase", path: "https://app.supabase.com/" }
	];

	return (
		<div
			className={concatenate(
				"sticky w-full md:w-[300px] flex-col justify-center items-center z-[2] px-2 md:pl-4 md:pr-0",
				layoutProps.title ? "pt-24 lg:pt-36 pb-4" : "pt-20 pb-4"
			)}>
			<ul className="menu bg-theme-article w-full p-2 rounded-lg shadow-md" onClick={() => toggleMenu(menuState)}>
				<li className={concatenate("menu-title hidden md:block", menuState && "!block")}>
					<span>Admin</span>
				</li>
				<li>
					{paths.map(({ name, path, value, label }, i) =>
						router.pathname === path ? (
							<a
								key={path}
								className={concatenate(
									"md:flex justify-between active:bg-theme-hover/10",
									router.pathname === path && "bg-theme-hover/10 md:bg-theme-link md:text-theme-button"
								)}>
								<div>{name}</div>
								{!admin ? (
									<div className="w-24 h-4">
										<span className="motion-safe:animate-pulse bg-gray-500/50 block overflow-hidden w-full h-full rounded-full bg-theme-hover bg-opacity-15" />
									</div>
								) : (
									<div className="flex justify-end">
										{value} {label}
									</div>
								)}
							</a>
						) : (
							<Link key={`admin${i}`} href={path}>
								<a className={concatenate("md:flex justify-between active:bg-theme-hover/10", !menuState && "hidden")}>
									<div>{name}</div>
									{!admin ? (
										<div className="w-24 h-4">
											<span className="motion-safe:animate-pulse bg-gray-500/50 block overflow-hidden w-full h-full rounded-full bg-theme-hover bg-opacity-15" />
										</div>
									) : (
										<div className="flex justify-end">
											{value} {label}
										</div>
									)}
								</a>
							</Link>
						)
					)}
				</li>
				<li className={concatenate("menu-title hidden md:block", menuState && "!block")}>
					<span>Resources</span>
				</li>
				<li className={concatenate("hidden md:block", menuState && "!block")}>
					{resources.map(({ name, path }, i) => (
						<Link key={path} href={path}>
							<a target="_blank" rel="noreferrer noopener" className="active:bg-theme-hover/10">
								{name}
							</a>
						</Link>
					))}
				</li>
			</ul>
		</div>
	);
};
