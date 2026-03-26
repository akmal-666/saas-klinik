/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  // Return 'any' to avoid rxjs version type conflict between root and apps/backend
  intercept(_ctx: ExecutionContext, next: CallHandler): any {
    return next.handle().pipe(
      map((result: any) => {
        if (result && typeof result === 'object' && 'data' in result) {
          return { ok: true, ...result };
        }
        return { ok: true, data: result };
      }),
    );
  }
}
