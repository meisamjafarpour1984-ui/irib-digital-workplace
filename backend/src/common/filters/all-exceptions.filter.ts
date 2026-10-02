import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest()

    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, response, request)
    }

    return this.handleUnknownError(exception, response, request)
  }

  private handleHttpException(exception: HttpException, response: Response, request: Request) {
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()
    const message = exception.message

    this.logger.warn(`HTTP ${status} - ${request.method} ${request.url}: ${message}`)

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
      messageFa: this.getPersianError(status, message),
      ...(exceptionResponse && typeof exceptionResponse === 'object' ? exceptionResponse : {}),
    })
  }

  private handleUnknownError(exception: unknown, response: Response, request: Request) {
    const status = HttpStatus.INTERNAL_SERVER_ERROR
    const message = 'Internal server error'

    this.logger.error(`Unexpected error - ${request.method} ${request.url}:`, exception)

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message,
      messageFa: 'خطای داخلی سرور',
      ...(process.env.NODE_ENV === 'development'
        ? { stack: exception instanceof Error ? exception.stack : undefined }
        : {}),
    })
  }

  private getPersianError(status: number, _message: string): string {
    const errorMessages: Record<number, string> = {
      400: 'درخواست نامعتبر است',
      401: 'لطفاً وارد شوید',
      403: 'دسترسی غیرمجاز است',
      404: 'منبع مورد نظر یافت نشد',
      409: 'تکرار منبع',
      422: 'فرمت داده‌ها نامعتبر است',
      429: 'تعداد درخواست‌ها بیش از حد مجاز است',
      500: 'خطای داخلی سرور',
      503: 'سرویس در دسترس نیست',
    }

    return errorMessages[status] || 'خطا رخ داده است'
  }
}
