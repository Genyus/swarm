
      {{operationName}}: {
        fn: {
          import: "{{operationName}}",
          from: "@src/features/{{featureDir}}/{{directory}}/{{operationName}}",
        },
        entities: [{{entities}}],
      }