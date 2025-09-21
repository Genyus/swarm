{{Imports}}

export const delete{{ModelName}}{{TypeAnnotation}} = async ({ {{IdField}} }, context) => {
{{AuthCheck}}  try {
    const {{modelNameLower}} = await context.entities.{{ModelName}}.findUnique({
      where: { {{IdField}} }
    });

    if (!{{modelNameLower}}) {
      throw new HttpError(404, '{{ModelName}} not found');
    }

    await context.entities.{{ModelName}}.delete({
      where: { {{IdField}} }
    });
  } catch (error) {
    console.error('Failed to delete {{modelNameLower}}:', error);
    throw new HttpError(500, 'Failed to delete {{modelNameLower}}');
  }
}; {{SatisfiesType}} 