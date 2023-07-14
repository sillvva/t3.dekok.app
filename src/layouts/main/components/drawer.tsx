import { useEffect, useState } from "react";
import HexMenu from "$src/components/hex-menu";

const defaultMenuClasses = ["sm:scale-100", "md:scale-125"];

type DrawerProps = {
	state: boolean;
	action: string;
	toggle: () => void;
	menuItems: {
		link: string;
		label: string;
	}[];
};

const Drawer = (drawer: DrawerProps) => {
	let [menuClasses, setMenuClasses] = useState(defaultMenuClasses);
	let [drawerClasses, setDrawerClasses] = useState("hidden opacity-0");

	useEffect(() => {
		if (drawer.action == "opening") {
			setMenuClasses([...defaultMenuClasses, "animate-drawer-open"]);
			setDrawerClasses("flex opacity-0");
			setTimeout(() => {
				setDrawerClasses("flex opacity-100");
			}, 50);
		} else if (drawer.action == "closing") {
			setMenuClasses([...defaultMenuClasses, "animate-drawer-close"]);
			setDrawerClasses("flex opacity-0");
		} else if (!drawer.state) setDrawerClasses("hidden opacity-0");
	}, [drawer]);

	return (
		<nav
			className={`fixed z-30 inset-0 flex-row items-center justify-center duration-200 ease-linear bg-theme-body/80 ${drawerClasses}`}
			data-action={drawer.action}
			onClick={drawer.toggle}>
			<HexMenu items={drawer.menuItems} maxLength={3} classes={menuClasses} itemClasses={["menu-bounce"]} rotated={drawer.menuItems.length % 2 == 0} />
		</nav>
	);
};

export default Drawer;
