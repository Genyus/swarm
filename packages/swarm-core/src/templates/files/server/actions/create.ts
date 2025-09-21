{{Imports}}

export const create{{ModelName}}{{TypeAnnotation}} = async (data, context) => {
{{AuthCheck}}  try {
    const created{{ModelName}} = await context.entities.{{ModelName}}.create({
      data: {
        ...data{{JsonTypeHandling}}
      }
    });

    return created{{ModelName}};
  } catch (error) {
    console.error('Failed to create {{ModelName}}:', error);
    throw new HttpError(500, 'Failed to create {{ModelName}}');
  }
}; {{SatisfiesType}} 