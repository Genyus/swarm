{{imports}}

export const {{operationName}}{{typeAnnotation}} = (async (_args, context) => {
{{authCheck}}  try {
    const {{pluralModelNameLower}} = await context.entities.{{modelName}}.findMany();

    return {{pluralModelNameLower}};
  } catch (error) {
    console.error("Failed to get all {{pluralModelNameLower}}:", error);
    throw new HttpError(500, "Failed to get all {{pluralModelNameLower}}");
  }
}) {{satisfiesType}};
