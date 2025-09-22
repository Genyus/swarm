    .job('{{jobName}}', {
      executor: "PgBoss",
      perform: {
        fn: {
          import: "{{jobWorkerName}}",
          from: "{{importPath}}",
        }
      },
      schedule: {
        cron: "{{cron}}",
        args: {{args}}
      },
      entities: [{{entitiesList}}],
    })