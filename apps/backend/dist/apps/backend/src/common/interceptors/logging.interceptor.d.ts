import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
export declare class LoggingInterceptor implements NestInterceptor {
    private readonly logger;
    intercept(context: ExecutionContext, next: CallHandler): any;
}
