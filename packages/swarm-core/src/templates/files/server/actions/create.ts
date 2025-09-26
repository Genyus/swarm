{{imports}}

export const {{operationName}}{{typeAnnotation}} = async (data, context) => {
{{authCheck}}  try {
    const created{{modelName}} = await context.entities.{{modelName}}.create({
      data: {
        ...data{{jsonTypeHandling}}
      }
    });

    return created{{modelName}};
  } catch (error) {
    console.error("Failed to create {{modelName}}:", error);

    throw new HttpError(500, "Failed to create {{modelName}}");
  }
}; {{satisfiesType}}
