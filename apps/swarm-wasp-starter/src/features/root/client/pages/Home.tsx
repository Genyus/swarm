import {
  Blocks,
  Code2,
  FolderTree,
  Palette,
  Settings,
  Zap,
} from "lucide-react";
import eslintIcon from "../../../../assets/eslint.svg";
import lucideIcon from "../../../../assets/lucide.svg";
import prettierIcon from "../../../../assets/prettier.svg";
import shadcnuiIcon from "../../../../assets/shadcnui.svg";
import tailwindIcon from "../../../../assets/tailwind.svg";
import typescriptIcon from "../../../../assets/typescript.svg";
import waspIcon from "../../../../assets/wasp.svg";
import zodIcon from "../../../../assets/zod.svg";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../shared/client/components/ui";

export function Home() {
  const features = [
    {
      icon: Code2,
      title: "Enhanced Wasp Configuration",
      description:
        "Streamlined configuration with composable files and fluent helper methods.",
    },
    {
      icon: FolderTree,
      title: "Feature-Based Architecture",
      description:
        "Consistent, feature-based architecture, keeping your codebase easy to maintain.",
    },
    {
      icon: Zap,
      title: "Boilerplate Generation",
      description:
        "Use AI tools or CLI commands to generate type-safe Wasp components in seconds.",
    },
    {
      icon: Blocks,
      title: "Extensible UI",
      description:
        "Built-in support for Tailwind 4, shadcn/ui components and Lucide icons.",
    },
    {
      icon: Settings,
      title: "Developer-Friendly Tools",
      description:
        "Includes useful package scripts for managing your development environment.",
    },
    {
      icon: Palette,
      title: "Dark Mode Support",
      description:
        "Built-in, responsive theme switcher with support for system preferences.",
    },
  ];

  const technologies = [
    { name: "ESLint", icon: eslintIcon },
    { name: "Lucide Icons", icon: lucideIcon },
    { name: "Prettier", icon: prettierIcon },
    { name: "shadcn/ui", icon: shadcnuiIcon },
    { name: "Tailwind CSS", icon: tailwindIcon },
    { name: "TypeScript", icon: typescriptIcon },
    { name: "Wasp", icon: waspIcon },
    { name: "Zod", icon: zodIcon },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">
            Welcome to Swarm Wasp Starter
          </CardTitle>
          <CardDescription className="text-lg">
            A minimal foundation for rapidly building full-stack Wasp
            applications. This template provides a clean, consistent structure
            with a range of tools and enhancements to improve the developer
            experience.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Features Grid */}
      <div>
        <h2 className="mb-4 text-2xl font-bold">What's Included</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className="size-5 text-primary" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Everything you need to start building your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">Project Structure</h3>
            <p className="mb-2 text-sm text-muted-foreground">
              <code>@ingenyus/swarm-wasp</code> defines a feature-based
              architecture that creates full-stack feature directories combining
              client- and server-side code. Server-side components (e.g.
              actions, queries, jobs, etc) are organised with one object per
              file, in contrast to Wasp's recommended approach of combining
              multiple components in a single file. This provides a more
              consistent, modular structure:
            </p>

            <code className="block rounded bg-muted px-3 py-2 font-mono text-xs whitespace-pre">
              {`src/
├── features/
│   └── tasks/
│       ├── feature.wasp.ts
│       ├── client/
│       │   └── pages/
│       │       └── TaskList.tsx
│       └── server/
│           ├── actions/
│           │   └── createTask.ts
│           └── queries/
│               └── getTasks.ts
└── shared/
    └── client/
        └── components/
    └── server/
        └── middleware/`}
            </code>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Wasp Configuration</h3>
            <p className="mb-2 text-sm text-muted-foreground">
              <code>@ingenyus/swarm-wasp</code> extends Wasp's{" "}
              <a
                href="https://wasp.sh/docs/general/wasp-ts-config"
                target="_blank"
                rel="noopener noreferrer"
              >
                Typescript config{" "}
              </a>
              model. Configuration is split across features, with each directory
              containing a <code>feature.wasp.ts</code> file that holds
              declarations for that feature. Fluent helper methods make
              configuration more concise and readable than the default
              declarative structure:
            </p>
            <code className="block rounded bg-muted px-3 py-2 font-mono text-xs whitespace-pre">
              {`import { App } from "@ingenyus/swarm-wasp";

export default function configureFeature(app: App, feature: string): void {
  app
    // Route definitions
    .addRoute(feature, "home", {
      path: "/",
      auth: false,
    })
    .addRoute(feature, "login", {
      path: "/login",
      auth: false,
    })
    .addRoute(feature, "dashboard", {
      path: "/dashboard",
      auth: true,
    })
    // CRUD definitions
    .addCrud(feature, "task", {
      entities: ["Task"],
      getAll: {
        public: ["id", "name", "description"],
      },
      get: {
        public: ["id", "name", "description"],
      },
      create: {
        public: ["id", "name", "description"],
      },
      auth: true,
    });
}`}
            </code>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Generate Wasp Objects</h3>
            <p className="mb-2 text-sm text-muted-foreground">
              Use the <code>@ingenyus/swarm</code> CLI to quickly scaffold Wasp
              components (routes, API endpoints, CRUD operations, background
              jobs, etc), in your Wasp project:
            </p>
            <code className="block rounded bg-muted px-3 py-2 font-mono text-xs whitespace-pre">
              {`# Create a new "tasks" feature directory, containing a feature.wasp.ts file
npm run swarm -- feature tasks

# Configure a route linked to a page component in the client directory
npm run swarm -- route --feature tasks --path "/tasks"

# Create a set of CRUD operations for the "Task" entity
npm run swarm -- crud --feature tasks --datatype Task
              `}
            </code>
            <p className="mt-2 text-sm text-muted-foreground">
              For more information on the available commands, run the following
              command:
            </p>
            <code className="block rounded bg-muted px-3 py-2 text-sm">
              npm run swarm
            </code>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Connect AI Tools</h3>
            <p className="mb-2 text-sm text-muted-foreground">
              Connect Cursor, Claude Code or VS Code Copilot to the MCP server
              for AI-assisted development:
            </p>
            <code className="block rounded bg-muted px-3 py-2 text-sm">
              npm run swarm:mcp
            </code>
          </div>

          <Alert className="mt-4">
            <Code2 className="size-4" />
            <AlertTitle>This Page</AlertTitle>
            <AlertDescription>
              Rendered by the <code>Home</code> component at{" "}
              <code className="font-mono text-xs">
                src/features/root/client/pages/Home.tsx
              </code>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle>Built With</CardTitle>
          <CardDescription>
            Modern tools and frameworks that work together seamlessly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
            {technologies.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2"
              >
                <img
                  src={tech.icon}
                  alt={`${tech.name} logo`}
                  className="size-5"
                />
                <span className="text-sm font-medium text-secondary-foreground">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
