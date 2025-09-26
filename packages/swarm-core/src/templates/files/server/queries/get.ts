{{imports}}

export const {{operationName}}{{typeAnnotation}} = (async ({ {{idField}} }, context) => {
{{authCheck}}  try {
    const {{modelNameLower}} = await context.entities.{{modelName}}.findUnique({
      where: { {{idField}} }
    });

    if (!{{modelNameLower}}) {
      throw new HttpError(404, "{{modelNameLower}} not found");
    }

    return {{modelNameLower}};
  } catch (error) {
    console.error("Failed to get {{modelNameLower}}:", error);
    throw new HttpError(500, "Failed to get {{modelNameLower}}");
  }
}) {{satisfiesType}};
