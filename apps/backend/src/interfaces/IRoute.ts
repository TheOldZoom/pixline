import { RequestHandler } from "express";
import type { Express } from "express";
export interface RouteModule {
  get?: RequestHandler | RequestHandler[];
  post?: RequestHandler | RequestHandler[];
  put?: RequestHandler | RequestHandler[];
  delete?: RequestHandler | RequestHandler[];
  patch?: RequestHandler | RequestHandler[];
  all?: RequestHandler | RequestHandler[];
  [key: string]: RequestHandler | RequestHandler[] | undefined;
}

export type RouteHandler = RequestHandler | RouteModule;

export interface RouteMethodRegistry {
  [path: string]: {
    methods: Set<string>;
    handlers: RouteModule;
  };
}

export interface RouteOptions {
  app: Express;
  path: string;
}
