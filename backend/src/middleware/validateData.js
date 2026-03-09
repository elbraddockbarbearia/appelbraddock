const { z } = require('zod');

// Middleware to validate req.body against a Zod schema
const validateData = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return res.status(400).json({ message: 'Erro de validação de dados', errors: errorMessages });
    }
    next(error);
  }
};

module.exports = validateData;
