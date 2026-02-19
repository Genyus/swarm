import { App } from "@ingenyus/swarm-wasp";

const app = await App.create("swarm_wasp_starter", {
  title: "Swarm Wasp Starter",
  wasp: { version: "^0.21.0" },
  head: [
    '<meta name="description" content="Swarm Wasp Starter description">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<meta charset="UTF-8">',
  ],
});

app.client({
  rootComponent: {
    importDefault: "Layout",
    from: "@src/shared/client/components/Layout",
  },
});

export default app;
