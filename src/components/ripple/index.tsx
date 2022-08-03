import { Key, useEffect, useState, useCallback, MouseEventHandler } from "react";
import { concatenate, wait } from "$src/utils/misc";

type RippleProps = {
	onUnload: (index: Key) => void;
	index: Key;
	x: number;
	y: number;
};

function Ripple({ onUnload, index, x, y }: RippleProps) {
	useEffect(() => {
		onUnload(index);
	}, [onUnload, index]);

	const style = {
		"--x": `${x}px`,
		"--y": `${y}px`
	} as React.CSSProperties;

	return (
		<div className="absolute inset-0 overflow-hidden" style={style}>
			<span
				className={concatenate(
					"absolute block top-[var(--y)] left-[var(--x)] -translate-x-1/2 -translate-y-1/2 opacity-0 -z-[1]",
					"w-[120%] aspect-square rounded-full bg-theme-link motion-safe:animate-ripple"
				)}></span>
		</div>
	);
}

type UseRippleProps = {
	enabled?: boolean;
	duration?: number;
	active?: boolean;
};

export const useRipple = (props?: UseRippleProps) => {
	const { enabled = true, duration = 600, active = false } = props || {};
	const [ripples, setRipples] = useState<Map<Key, JSX.Element>>(new Map());

	const rippleUnload = useCallback(() => {
		wait(
			() => {
				setRipples(new Map());
			},
			"ripples",
			duration
		);
	}, [duration]);

	const mouseHandler: MouseEventHandler<any> = (e: any) => {
		if (!enabled || active) return;
		const key = Math.max(-1, ...[...ripples.keys()].map(r => parseInt(r.toString() || ""))) + 1;
		const ripple = <Ripple key={key} index={key} onUnload={rippleUnload} x={e.nativeEvent.layerX} y={e.nativeEvent.layerY}></Ripple>;
		setRipples(new Map(ripples).set(key, ripple));
	};

	return { ripples: [...ripples.values()], mouseHandler, rippleClass: enabled ? "isolate relative" : "" };
};
