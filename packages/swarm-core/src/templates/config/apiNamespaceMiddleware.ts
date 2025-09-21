import type { MiddlewareConfigFn } from "wasp/server";
import type { RequestHandler } from "express";

// Example: Custom middleware for apiNamespace
export const {{middlewareFnName}}: MiddlewareConfigFn = (middlewareConfig) => {
  const customMiddleware: RequestHandler = (_req, _res, next) => {
    // TODO: Add your custom logic here
    next();
  };

  middlewareConfig.set("{{namespaceName}}.middleware", customMiddleware);

  return middlewareConfig;
};