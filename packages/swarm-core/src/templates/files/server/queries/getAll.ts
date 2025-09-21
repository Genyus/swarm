{{Imports}}

export const getAll{{PluralModelName}}{{TypeAnnotation}} = (async (_args, context) => {
{{AuthCheck}}  try {
    const {{pluralModelNameLower}} = await context.entities.{{ModelName}}.findMany();

    return {{pluralModelNameLower}};
  } catch (error) {
    console.error('Failed to get all {{pluralModelNameLower}}:', error);
    throw new HttpError(500, 'Failed to get all {{pluralModelNameLower}}');
  }
}) {{SatisfiesType}}; 