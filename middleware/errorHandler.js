import { AppError } from '../utils/AppError.js';
import { handlePrismaError } from '../utils/prismaErrors.js';
import { ZodError } from 'zod';

// ─────────────────────────────────────────────
// ERROR TYPE HANDLERS
// ─────────────────────────────────────────────

function handleZodError(err) {
  const errors = err.errors.map(e => ({
    field:   e.path.join('.'),
    message: e.message,
  }));
  return new AppError('Validation failed', 422, 'VALIDATION_ERROR');
}

function handleJWTError() {
  return new AppError('Invalid token', 401, 'INVALID_TOKEN');
}

function handleJWTExpiredError() {
  return new AppError('Token expired', 401, 'TOKEN_EXPIRED');
}

function handleMulterError(err) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File too large', 400, 'FILE_TOO_LARGE');
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file field', 400, 'UNEXPECTED_FILE');
  }
  return new AppError('File upload error', 400, 'UPLOAD_ERROR');
}

// ─────────────────────────────────────────────
// DEV vs PROD response
// ─────────────────────────────────────────────

function sendDevError(err, res) {
  res.status(err.statusCode).json({
    success:    false,
    message:    err.message,
    code:       err.code ?? null,
    statusCode: err.statusCode,
    stack:      err.stack,           // dev mein stack dikhao
    errors:     err.errors ?? null,  // Zod validation errors
  });
}

function sendProdError(err, res) {
  // Operational errors — safe to show user
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code:    err.code ?? null,
      errors:  err.errors ?? null,
    });
  }

  // Programming/unknown errors — hide details
  console.error('💥 UNEXPECTED ERROR:', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again.',
    code:    'INTERNAL_ERROR',
  });
}

// ─────────────────────────────────────────────
// MAIN ERROR HANDLER
// ─────────────────────────────────────────────

export const errorHandler = (err, req, res, next) => {
  // Default values
  err.statusCode = err.statusCode ?? 500;
  err.status     = err.status     ?? 'error';

  // Log all errors in dev, only unexpected in prod
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
      message: err.message,
      code:    err.code,
      stack:   err.stack,
    });
  } else if (!err.isOperational) {
    console.error('💥 UNEXPECTED ERROR:', err);
  }

  // ── Type-specific handling ──
  let error = err;

  // Prisma errors
  if (err.constructor?.name?.startsWith('Prisma') || err.code?.startsWith('P')) {
    error = handlePrismaError(err);
  }

  // Zod validation errors
  else if (err instanceof ZodError) {
    error = handleZodError(err);
    error.errors = err.errors.map(e => ({
      field:   e.path.join('.'),
      message: e.message,
    }));
  }

  // JWT errors
  else if (err.name === 'JsonWebTokenError')  error = handleJWTError();
  else if (err.name === 'TokenExpiredError')  error = handleJWTExpiredError();

  // Multer errors
  else if (err.name === 'MulterError') error = handleMulterError(err);

  // Syntax errors (malformed JSON body)
  else if (err instanceof SyntaxError && err.status === 400) {
    error = new AppError('Invalid JSON in request body', 400, 'INVALID_JSON');
  }

  // Send response
  if (process.env.NODE_ENV === 'development') {
    sendDevError(error, res);
  } else {
    sendProdError(error, res);
  }
};

// ─────────────────────────────────────────────
// 404 HANDLER — unknown routes
// ─────────────────────────────────────────────

export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND'));
};

// ─────────────────────────────────────────────
// UNHANDLED REJECTIONS + EXCEPTIONS
// ─────────────────────────────────────────────

export const setupProcessHandlers = (server) => {
  // Unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('💥 UNHANDLED REJECTION:', err.message);
    console.error(err.stack);
    // Graceful shutdown
    server.close(() => {
      console.error('Server closed due to unhandled rejection');
      process.exit(1);
    });
  });

  // Uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION:', err.message);
    console.error(err.stack);
    process.exit(1);
  });

  // Graceful shutdown on SIGTERM (deployment)
  process.on('SIGTERM', () => {
    console.log('SIGTERM received — shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
};