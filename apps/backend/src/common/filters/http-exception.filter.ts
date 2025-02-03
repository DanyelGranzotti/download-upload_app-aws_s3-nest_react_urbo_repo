import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ValidationError } from 'class-validator';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = uuidv4();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const validationErrors = this.extractValidationErrors(exceptionResponse);

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      requestId,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse['message'],
      errorCode: this.getErrorCode(exception),
      ...(validationErrors && { validationErrors }),
      ...(this.isDevelopment() && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    this.logError(exception, errorResponse, request);

    response.status(status).json(errorResponse);
  }

  private isDevelopment(): boolean {
    return this.configService.get('NODE_ENV') === 'development';
  }

  private getErrorCode(exception: unknown): string {
    if (exception instanceof HttpException) {
      return exception['errorCode'] || `HTTP_${exception.getStatus()}`;
    }
    return 'INTERNAL_ERROR';
  }

  private extractValidationErrors(exceptionResponse: any): any[] | null {
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse.message instanceof Array &&
      exceptionResponse.message[0] instanceof ValidationError
    ) {
      return exceptionResponse.message.map((error: ValidationError) => ({
        field: error.property,
        constraints: error.constraints,
      }));
    }
    return null;
  }

  private logError(
    exception: unknown,
    errorResponse: any,
    request: Request,
  ): void {
    const errorLog = {
      ...errorResponse,
      headers: request.headers,
      body: request.body,
    };

    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        `Unhandled exception: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
        exception instanceof Error ? exception.stack : undefined,
        errorLog,
      );
    } else {
      this.logger.warn('Client error', errorLog);
    }
  }
}
