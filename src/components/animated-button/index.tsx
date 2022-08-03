import { concatenate } from "$src/utils/misc";
import Link from "next/link";
import { useState } from "react";
import { useRipple } from "../ripple";
import buttons from "./Buttons.module.scss";

type AnimatedButtonProps = {
	link?: string;
	label: string;
	active?: boolean;
	color?: string;
	hoverColor?: string;
	activeColor?: string;
	textColor?: string;
	activeClick?: boolean;
	clickRipple?: boolean;
	itemClasses: string[];
};

export default function AnimatedButton(props: AnimatedButtonProps) {
	const {
		active = false,
		itemClasses = ["Button5"],
		color = "var(--color-text-link)",
		hoverColor = "rgba(var(--color-bg-body), 0.6)",
		activeColor = "rgb(var(--color-bg-body))",
		textColor = "var(--color-text-link)",
		activeClick = false,
		link = "",
		label,
		clickRipple
	} = props;
	const { ripples, mouseHandler, rippleClass } = useRipple({ enabled: clickRipple, active });
	const propClasses = itemClasses.map(c => buttons[c] ?? c);
	const [classes, setClasses] = useState([buttons.Button, active ? buttons.Active : "", rippleClass, ...propClasses]);
	if (!classes.find(c => /Button\d+/.test(c))) {
		setClasses([...classes, buttons.Button5]);
	}

	const style = {
		...(color && { "--item-color": color }),
		...(hoverColor && { "--hover-color": hoverColor }),
		...(activeColor && { "--active-color": activeColor }),
		...(textColor && { "--text-color": textColor }),
		...(active && !activeClick && { cursor: "default" })
	} as React.CSSProperties;

	const btn = (
		<a className={concatenate(...classes)} style={style} onPointerDown={mouseHandler} onClick={e => active && !activeClick && e.preventDefault()}>
			{ripples}
			{label}
		</a>
	);

	return (
		<Link href={link} scroll={false}>
			{btn}
		</Link>
	);
}
