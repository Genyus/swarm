
      {{jobName}}: {
        executor: "PgBoss",
        perform: {
          fn: {
            import: "{{jobWorkerName}}",
            from: "{{importPath}}/{{jobWorkerFile}}",
          }
        },
        schedule: {
          cron: "{{cron}}",
          args: {{args}}
        },
        entities: [{{entitiesList}}],
      }