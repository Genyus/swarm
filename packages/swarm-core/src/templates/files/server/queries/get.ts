{{Imports}}

export const get{{ModelName}}{{TypeAnnotation}} = (async ({ {{IdField}} }, context) => {
{{AuthCheck}}  try {
    const {{modelNameLower}} = await context.entities.{{ModelName}}.findUnique({
      where: { {{IdField}} }
    });

    if (!{{modelNameLower}}) {
      throw new HttpError(404, "{{modelNameLower}} not found");
    }

    return {{modelNameLower}};
  } catch (error) {
    console.error("Failed to get {{modelNameLower}}:", error);
    throw new HttpError(500, "Failed to get {{modelNameLower}}");
  }
}) {{SatisfiesType}};
