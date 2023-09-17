import { validationResult } from 'express-validator';

// Если есть ошибки, тогда покажи их
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  // Идем далее
  next();
};
