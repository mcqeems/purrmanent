import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { Response } from 'express';
import type { ZodError } from 'zod';

/**
 * Global exception filter producing the standard error envelope:
 *   { error: { code, message, details } }
 *
 * - Zod validation errors  -> 400 VALIDATION_ERROR (+ field details)
 * - HttpException          -> its status + a derived code
 * - anything else          -> 500 INTERNAL_ERROR (details hidden)
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    // Zod validation failures from the global pipe.
    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError() as ZodError;
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: zodError.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const message =
        typeof payload === 'string'
          ? payload
          : (((payload as Record<string, unknown>).message as string) ??
            exception.message);
      return res.status(status).json({
        error: {
          code: codeForStatus(status),
          message: Array.isArray(message) ? message.join(', ') : message,
          details: typeof payload === 'object' ? payload : undefined,
        },
      });
    }

    // Unknown / unexpected — log full error, return opaque 500.
    this.logger.error(exception);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
}

function codeForStatus(status: number): string {
  const map: Record<number, string> = {
    [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
    [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
    [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
    [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
    [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
  };
  return map[status] ?? 'ERROR';
}
