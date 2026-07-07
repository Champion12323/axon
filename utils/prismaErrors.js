import { AppError } from './AppError.js';

export function handlePrismaError(err) {
  // P2002 — Unique constraint violation
  if (err.code === 'P2002') {
    const fields = err.meta?.target?.join(', ') ?? 'field';
    return new AppError(`${fields} already exists`, 409, 'DUPLICATE_ENTRY');
  }

  // P2025 — Record not found
  if (err.code === 'P2025') {
    return new AppError(err.meta?.cause ?? 'Record not found', 404, 'NOT_FOUND');
  }

  // P2003 — Foreign key constraint
  if (err.code === 'P2003') {
    return new AppError('Related record not found', 400, 'FOREIGN_KEY_ERROR');
  }

  // P2014 — Relation violation
  if (err.code === 'P2014') {
    return new AppError('Relation constraint violated', 400, 'RELATION_ERROR');
  }

  // P2000 — Value too long
  if (err.code === 'P2000') {
    return new AppError('Input value too long', 400, 'VALUE_TOO_LONG');
  }

  // P1001 — DB unreachable
  if (err.code === 'P1001') {
    return new AppError('Database unreachable', 503, 'DB_UNAVAILABLE');
  }

  // P1008 — DB timeout
  if (err.code === 'P1008') {
    return new AppError('Database timeout', 503, 'DB_TIMEOUT');
  }

  // Unknown Prisma error
  return new AppError('Database error', 500, 'DB_ERROR');
}