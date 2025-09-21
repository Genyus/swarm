import type { RequestHandler } from "express";
import type { MiddlewareConfigFn } from "wasp/server";

export const {{middlewareFnName}}: MiddlewareConfigFn = (middlewareConfig) => {
  const {{namespaceName}}Middleware: RequestHandler = (_req, _res, next) => {
    // TODO: Add your custom logic here
    next();
  };

  middlewareConfig.set("{{namespaceName}}.middleware", {{namespaceName}}Middleware);

  return middlewareConfig;
};
