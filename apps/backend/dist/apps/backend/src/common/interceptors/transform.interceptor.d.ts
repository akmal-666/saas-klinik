import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
export declare class TransformInterceptor implements NestInterceptor {
    intercept(_ctx: ExecutionContext, next: CallHandler): any;
}
