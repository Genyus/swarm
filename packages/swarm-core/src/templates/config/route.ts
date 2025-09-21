
      {{routeName}}: {
        path: "{{routePath}}",
        to: app.page("{{componentName}}", {
          authRequired: {{auth}},
          component: {
            import: "{{componentName}}",
            from: "{{importPath}}",
          },
        }),
      }