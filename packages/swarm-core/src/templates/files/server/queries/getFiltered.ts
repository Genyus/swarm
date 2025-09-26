{{imports}}

export const {{operationName}}{{typeAnnotation}} = (async (...args, context) => {
{{authCheck}}  try {
    const {{pluralModelNameLower}} = await context.entities.{{modelName}}.findMany({
      where: {
        ...args,
      },
    });

    return {{pluralModelNameLower}};
  } catch (error) {
    console.error("Failed to get filtered {{pluralModelNameLower}}:", error);

    throw new HttpError(500, "Failed to get filtered {{pluralModelNameLower}}");
  }
}) {{satisfiesType}};
