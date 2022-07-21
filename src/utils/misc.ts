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

export const conClasses = (str: boolean | string | (string | boolean)[]) => {
  return (Array.isArray(str) ? str : typeof str == "string" ? str.split(" ") : []).filter(s => !!s && typeof s == "string").join(" ");
};

export const parseCSSModules = (module: { [key: string]: string }, styles?: (string | boolean)[]) => {
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
  return conClasses(parsed);
};
