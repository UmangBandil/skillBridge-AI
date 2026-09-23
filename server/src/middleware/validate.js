/**
 * Middleware factory for validating incoming requests with Zod schemas
 * @param {import('zod').ZodSchema} schema 
 * @param {'body' | 'query' | 'params'} source 
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = schema.parse(dataToValidate);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: formattedErrors[0]?.message || 'Invalid request payload',
            details: formattedErrors
          }
        });
      }
      next(err);
    }
  };
}

export default validate;
