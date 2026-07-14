import { type Spec, page, route } from "@wasp.sh/spec";
import { Home } from "./client/pages/Home" with { type: "ref" };

export const spec: Spec = [
  // Route definitions
  route("home", "/", page(Home)),
];
