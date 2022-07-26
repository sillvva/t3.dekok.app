import qs from "qs";
import type { ZodSchema } from "zod";

let timeouts = new Map<string | number, number>();
export const wait = (callback: TimerHandler, id: string | number, ms?: number, ...args: any[]) => {
	if (!callback) throw new Error("'callback' not defined");
	if (!id) throw new Error("'id' not defined");
	if (!ms) ms = 100;
	if (timeouts.get(id)) clearTimeout(timeouts.get(id));
	timeouts.set(id, setTimeout(callback, ms, ...args));
};

// The debounce function receives our function as a parameter
export const debounce = (fn: Function) => {
	// This holds the requestAnimationFrame reference, so we can cancel it if we wish
	let frame: number;
	// The debounce function returns a new function that can receive a variable number of arguments
	return (...params: any[]) => {
		// If the frame variable has been defined, clear it now, and queue for next frame
		if (frame) {
			cancelAnimationFrame(frame);
		}
		// Queue our function call for the next frame
		frame = requestAnimationFrame(() => {
			// Call our function and pass any params we received
			fn(...params);
		});
	};
};

export const concatenate = (...str: (string | boolean | null | undefined)[]) => {
	return str.filter(s => !!s && typeof s == "string").join(" ");
};

export const parseCSSModules = (module: { [key: string]: string }, styles?: (string | boolean | null | undefined)[]) => {
	const parsed = (styles || [])
		.map(c =>
			typeof c === "string"
				? c
						.split(" ")
						.map(c2 => module[c2] ?? c2)
						.join(" ")
				: c
		)
		.filter(c => typeof c === "string");
	return concatenate(...parsed);
};

export const toBase64 = async (data: string | Uint8Array | Blob) => {
	const base64url = await new Promise<string>(r => {
		const reader = new FileReader();
		reader.onload = () => r((reader.result || "").toString());
		if (data instanceof Blob) reader.readAsDataURL(data);
		else reader.readAsDataURL(new Blob([data]));
	});

	return base64url.split(",", 2)[1];
};

export const parseError = (e: unknown) => {
	if (e instanceof Error) return e.message;
	if (typeof e === "string") return e;
	if (typeof e === "object") return JSON.stringify(e);
	return "Unknown error";
};

const parseObjectPrimitives = (obj: Record<string, any>): any => {
	return Object.fromEntries(
		Object.entries(obj).map(([k, v]) => {
			if (typeof v === "object") return [k, parseObjectPrimitives(v)];
			if (!isNaN(parseFloat(v))) return [k, parseFloat(v)];
			if (v === "true") return [k, true];
			if (v === "false") return [k, false];
			if (typeof v === "string") return [k, v];
			return [k, null];
		})
	);
};

export const qsParse = <T>(queryString: string | Record<string, any>, schema: ZodSchema<T>) => {
	const parsed =
		typeof queryString === "string"
			? qs.parse(queryString, {
					ignoreQueryPrefix: true
			  })
			: queryString;

	const zResult = schema.safeParse(parseObjectPrimitives(parsed));

	return {
		data: zResult.success ? zResult.data : {} as T,
		errors: !zResult.success
			? zResult.error.issues
					.map(i => `${i.path.join(".")}: ${i.message}`)
					.reduce((acc, v) => (acc.includes(v) ? acc : [...acc, v]), [] as string[])
			: []
	};
};
