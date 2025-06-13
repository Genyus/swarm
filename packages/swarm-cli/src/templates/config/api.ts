
      {{apiName}}: {
        fn: {
            import: "{{apiName}}",
            from: "@src/features/{{featureDir}}/server/api/{{apiFile}}",
        },
        entities: [{{entities}}],
        httpRoute: { method: "{{method}}", route: "{{route}}" },
        auth: {{auth}},
      }