
      {{apiName}}: {
        fn: {
          import: "{{apiName}}",
          from: "{{importPath}}",
        },
        entities: [{{entities}}],
        httpRoute: { method: "{{method}}", route: "{{route}}" },
        auth: {{auth}},
      }