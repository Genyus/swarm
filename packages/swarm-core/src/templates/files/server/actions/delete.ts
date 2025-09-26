{{imports}}

export const {{operationName}}{{typeAnnotation}} = async ({ {{idField}} }, context) => {
{{authCheck}}  try {
    const {{modelNameLower}} = await context.entities.{{modelName}}.findUnique({
      where: { {{idField}} }
    });

    if (!{{modelNameLower}}) {
      throw new HttpError(404, "{{modelName}} not found");
    }

    await context.entities.{{modelName}}.delete({
      where: { {{idField}} }
    });
  } catch (error) {
    console.error("Failed to delete {{modelNameLower}}:", error);

    throw new HttpError(500, "Failed to delete {{modelNameLower}}");
  }
}; {{satisfiesType}}
