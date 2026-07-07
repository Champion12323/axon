import { ZodError } from 'zod';

const validate = (schema) => (req, res, next) => {
  try {
    if (!schema) {
      return res.status(400).json({ success: false, message: 'Validation schema missing' });
    }


    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error && error instanceof ZodError && Array.isArray(error.errors)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        data: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    console.error('Validation error:', error);
    return res.status(400).json({ success: false, message: 'Invalid request data' });
  }

};

export { validate };

