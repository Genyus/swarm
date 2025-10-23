import { App } from "@ingenyus/swarm-wasp";

// App Configurations
const app = await App.create("swarm-starter", {
  title: "New Wasp App",
  wasp: { version: "^0.18.1" },
  head: [
    '<meta name="description" content="Your app description!">', // <- TODO: Change this to your own description!
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
