// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { siteRouter } from "./routers/site";
import { postsRouter } from "./routers/posts";
import { imagesRouter } from "./routers/images";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("site.", siteRouter)
  .merge("posts.", postsRouter)
  .merge("images.", imagesRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
