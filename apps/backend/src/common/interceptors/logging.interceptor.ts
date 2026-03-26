/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  // Return 'any' to avoid rxjs version type conflict between root and apps/backend
  intercept(context: ExecutionContext, next: CallHandler): any {
    const req = context.switchToHttp().getRequest<any>();
    const { method, url } = req as { method: string; url: string };
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        const res = context.switchToHttp().getResponse<any>();
        this.logger.log(`${method} ${url} ${res.statusCode ?? 200} — ${ms}ms`);
      }),
    );
  }
}
