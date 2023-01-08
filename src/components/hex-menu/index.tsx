import { concatenate, parseCSSModules } from "$src/utils/misc";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import styles from "./HexMenu.module.scss";

export type Item = {
	link: string;
	label: string;
	active?: boolean;
	color?: string;
	hoverColor?: string;
	activeColor?: string;
	textColor?: string;
};
type HexMenuProps = {
	items: (Item | null)[];
	maxLength: number;
	classes: string[];
	rotated: boolean;
	color?: string;
	hoverColor?: string;
	activeColor?: string;
	textColor?: string;
	itemClasses: string[];
};

const HexMenu = (props: HexMenuProps) => {
	const { pathname } = useRouter();

	const menuRows = useMemo(() => {
		const out: Item[][] = [[]];
		props.items.forEach((item, i) => {
			const rowIndex = out.length - 1;
			if (item)
				out[rowIndex].push({
					...item,
					...(item.link === pathname && { active: true })
				});
			else out[rowIndex].push({ link: "", label: "" });
			const rotDiff = !props.rotated && out.length % 2 === 0 ? 1 : 0;
			if (props.maxLength >= 0 && out[rowIndex].length === props.maxLength - rotDiff && props.items.length - 1 > i) {
				out.push([]);
			}
		});
		return out;
	}, [props.items, props.maxLength, pathname, props.rotated]);

	return (
		<nav
			className={concatenate(
				styles.HexWrapper,
				!props.classes.find(c => c.startsWith("[--scale:")) && "[--scale:1]",
				props.rotated && styles.rotated,
				...props.classes
			)}>
			{menuRows.map((row, r) => (
				<div key={r} className={concatenate(styles.HexRow, r % 2 === 1 && !props.rotated && styles.shift)}>
					{row.map((item, i) => (
						<HexMenuItem
							key={`hex-item-${i}`}
							link={item.link}
							label={item.label}
							active={!!item.active}
							rotated={props.rotated}
							color={item.color || props.color}
							activeColor={item.activeColor || props.activeColor}
							hoverColor={item.hoverColor || props.hoverColor}
							textColor={item.textColor || props.textColor}
							classes={props.itemClasses}
						/>
					))}
				</div>
			))}
		</nav>
	);
};

HexMenu.defaultProps = {
	maxLength: 0,
	classes: [],
	rotated: false,
	color: "var(--color-bg-link)",
	hoverColor: "var(--color-bg-link-hover)",
	activeColor: "var(--color-bg-link-hover)",
	textColor: "var(--color-text-button)",
	itemClasses: []
};

export default HexMenu;

type HexMenuItemProps = {
	link: string;
	label: string;
	active: boolean;
	rotated: boolean;
	color?: string;
	hoverColor?: string;
	activeColor?: string;
	textColor?: string;
	classes: string[];
	hexagonClasses: string[];
	labelClasses: string[];
};

const HexMenuItem = (props: HexMenuItemProps) => {
	return props.link ? (
		<Link href={props.link}>
			<a
				className={parseCSSModules(styles, [styles.HexMenuItemContainer, props.rotated && styles.rotated, ...props.classes])}
				aria-label={props.label}
				style={
					{
						...(props.color && { "--color": props.color }),
						...(props.hoverColor && { "--hover-color": props.hoverColor }),
						...(props.activeColor && { "--active-color": props.activeColor }),
						...(props.textColor && { "--text-color": props.textColor })
					} as React.CSSProperties
				}>
				<svg
					viewBox="0 0 800 800"
					className={concatenate(
						styles.HexItem,
						props.rotated && styles.rotated,
						!props.label && styles.empty,
						props.active && styles.active
					)}
					aria-hidden={!props.label}>
					{props.rotated ? (
						<g transform="matrix(-6.92 0 0 -6.92 400.24 400.24)">
							<polygon
								className={concatenate("h-hex", styles.hex, ...props.hexagonClasses)}
								points="-19.9,34.5 -39.8,0 -19.9,-34.5 19.9,-34.5 39.8,0 19.9,34.5 "
							/>
						</g>
					) : (
						<g transform="matrix(0 6.92 -6.92 0 400.17 400.33)">
							<polygon
								className={concatenate("h-hex", styles.hex, ...props.hexagonClasses)}
								points="-19.9,34.5 -39.8,0 -19.9,-34.5 19.9,-34.5 39.8,0 19.9,34.5 "
							/>
						</g>
					)}
					{/* <foreignObject className="hex-fo" x="0" y="0" width="100%" height="100%">
						<span className={concatenate(styles.label, ...props.labelClasses)}>{props.label}</span>
					</foreignObject> */}
				</svg>
				<span className={concatenate(styles.label, ...props.labelClasses)}>{props.label}</span>
			</a>
		</Link>
	) : (
		<div className={parseCSSModules(styles, [styles.HexMenuItemContainer, props.rotated && styles.rotated, ...props.classes])}>
			<svg
				viewBox="0 0 800 800"
				className={concatenate(
					styles.HexItem,
					props.rotated && styles.rotated,
					!props.label && styles.empty,
					props.active && styles.active
				)}
				style={
					{
						...(props.color && { "--color": props.color }),
						...(props.hoverColor && { "--hover-color": props.hoverColor }),
						...(props.activeColor && { "--active-color": props.activeColor }),
						...(props.textColor && { "--text-color": props.textColor })
					} as React.CSSProperties
				}
				aria-hidden={!props.label}>
				{props.rotated ? (
					<g transform="matrix(-6.92 0 0 -6.92 400.24 400.24)">
						<polygon
							className={concatenate("h-hex", styles.hex, ...props.hexagonClasses)}
							points="-19.9,34.5 -39.8,0 -19.9,-34.5 19.9,-34.5 39.8,0 19.9,34.5 "
						/>
					</g>
				) : (
					<g transform="matrix(0 6.92 -6.92 0 400.17 400.33)">
						<polygon
							className={concatenate("h-hex", styles.hex, ...props.hexagonClasses)}
							points="-19.9,34.5 -39.8,0 -19.9,-34.5 19.9,-34.5 39.8,0 19.9,34.5 "
						/>
					</g>
				)}
				{/* <foreignObject className="hex-fo" x="0" y="0" width="100%" height="100%">
					<span className={concatenate(styles.label, ...props.labelClasses)}>{props.label}</span>
				</foreignObject> */}
			</svg>
			<span className={concatenate(styles.label, ...props.labelClasses)}>{props.label}</span>
		</div>
	);
};

HexMenuItem.defaultProps = {
	active: false,
	rotated: false,
	classes: [],
	hexagonClasses: [],
	labelClasses: []
};
