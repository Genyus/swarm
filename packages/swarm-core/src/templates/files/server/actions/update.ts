{{Imports}}

export const update{{ModelName}}{{TypeAnnotation}} = async ({ {{IdField}}, ...data }, context) => {
{{AuthCheck}}  try {
    const {{modelNameLower}} = await context.entities.{{ModelName}}.findUnique({
      where: { {{IdField}} }
    });

    if (!{{modelNameLower}}) {
      throw new HttpError(404, "{{ModelName}} not found");
    }

    const updated{{ModelName}} = await context.entities.{{ModelName}}.update({
      where: { {{IdField}} },
      data: {
        ...data{{JsonTypeHandling}}
      }
    });

    return updated{{ModelName}};
  } catch (error) {
    console.error("Failed to update {{modelNameLower}}:", error);
    throw new HttpError(500, "Failed to update {{modelNameLower}}");
  }
}; {{SatisfiesType}}
