// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { siteRouter } from "./site";
import { postsRouter } from "./posts";
import { imagesRouter } from "./images";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("site.", siteRouter)
  .merge("posts.", postsRouter)
  .merge("images.", imagesRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
