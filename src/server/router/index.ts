// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { postsRouter } from "./posts";
import { siteRouter } from "./site";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("site.", siteRouter)
  .merge("posts.", postsRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
