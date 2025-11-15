import { App } from "@ingenyus/swarm-wasp";

export default function configureFeature(app: App, feature: string): void {
  app
    // Route definitions
    .addRoute(feature, "home", {
      path: "/",
      auth: false,
    });
}
