// src/server/router/context.ts
import * as trpc from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { parse } from "cookie";
import { prisma } from "../db/client";

export const createContext = (opts?: CreateNextContextOptions) => {
  const req = opts?.req;
  const res = opts?.res;

  // console.log(parse(req?.headers.cookie || ""));

  return {
    req,
    res,
    prisma,
  };
};

type Context = trpc.inferAsyncReturnType<typeof createContext>;

export const createRouter = () => trpc.router<Context>();
