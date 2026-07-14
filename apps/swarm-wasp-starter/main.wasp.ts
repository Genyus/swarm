import { app } from "@wasp.sh/spec";
import Layout from "./src/shared/client/components/Layout" with { type: "ref" };
import { featureSpecs } from "./src/features/index.wasp";

export default app({
  name: "swarm_wasp_starter",
  title: "Swarm Wasp Starter",
  wasp: { version: "^0.24.0" },
  head: [
    '<meta name="description" content="Swarm Wasp Starter description" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '<meta charSet="UTF-8" />',
  ],
  client: { rootComponent: Layout },
  spec: [featureSpecs],
});
