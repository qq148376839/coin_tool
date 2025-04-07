import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiError, ErrorCode, logError } from '../utils/error-handler';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error: ApiError;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      error = new ApiError(
        ErrorCode.UNKNOWN,
        exception.message,
        status
      );
    } else if (exception instanceof ApiError) {
      status = exception.status;
      error = exception;
    } else {
      error = new ApiError(
        ErrorCode.UNKNOWN,
        'Internal server error',
        status
      );
    }

    // 记录错误日志
    logError(error, 'HttpException');

    response.status(status).json({
      code: error.code,
      message: error.message,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
      data: error.data,
    });
  }
} 