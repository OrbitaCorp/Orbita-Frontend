import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

// Forma mínima de la respuesta HTTP (evita depender de @types/express).
interface HttpResponseLike {
  status(code: number): { json(body: unknown): unknown };
}

/**
 * Da forma estándar a los errores: { error, statusCode, message? }.
 * (Ver "Errores" en CONTRATO_API.md.)
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<HttpResponseLike>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let error = 'INTERNAL_ERROR';
    let message: string | undefined;

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as Record<string, unknown>;
        message = (body.message as string) ?? undefined;
        error = (body.error as string) ?? exception.name;
      }
    }

    response.status(status).json({ error, statusCode: status, message });
  }
}
