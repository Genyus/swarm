{{imports}}

export const {{operationName}}{{typeAnnotation}} = async ({ {{idField}}, ...data }, context) => {
{{authCheck}}  try {
    const {{modelNameLower}} = await context.entities.{{modelName}}.findUnique({
      where: { {{idField}} }
    });

    if (!{{modelNameLower}}) {
      throw new HttpError(404, "{{modelName}} not found");
    }

    const updated{{modelName}} = await context.entities.{{modelName}}.update({
      where: { {{idField}} },
      data: {
        ...data{{jsonTypeHandling}}
      }
    });

    return updated{{modelName}};
  } catch (error) {
    console.error("Failed to update {{modelNameLower}}:", error);
    throw new HttpError(500, "Failed to update {{modelNameLower}}");
  }
}; {{satisfiesType}}
