import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists (Duplicate Conflict).`,
      errorType: 'DUPLICATE_KEY',
    });
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      message: 'Validation failed on submitted payload.',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
      errorType: 'VALIDATION_ERROR',
    });
    return;
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: `Invalid ID format provided: ${err.value}`,
      errorType: 'INVALID_ID',
    });
    return;
  }

  // Default server error
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An internal server error occurred. Please try again later.',
    errorType: 'SERVER_ERROR',
  });
};
