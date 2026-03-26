import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  SetMetadata,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UserRole } from '@klinik/shared-types';
import { ROLE_PERMISSIONS, Permission } from '@klinik/shared-constants';

// ─── Metadata keys ────────────────────────────────────────
export const IS_PUBLIC_KEY = 'isPublic';
export const REQUIRED_PERMISSIONS_KEY = 'requiredPermissions';
export const REQUIRED_ROLES_KEY = 'requiredRoles';

// ─── Decorators ───────────────────────────────────────────
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);
export const RequireRoles = (...roles: UserRole[]) =>
  SetMetadata(REQUIRED_ROLES_KEY, roles);

// ─── JWT Payload ──────────────────────────────────────────
export interface JwtPayload {
  sub: string;        // user id
  email: string;
  role: UserRole;
  clinic_id: string;
  name: string;
}

// ─── Current User Decorator ───────────────────────────────
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    return data ? user?.[data] : user;
  },
);

export const ClinicId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    // Super admin can pass x-clinic-id header to access other clinics
    return (
      request.headers['x-clinic-id'] ||
      (request.user as JwtPayload)?.clinic_id
    );
  },
);

// ─── JWT Auth Guard ───────────────────────────────────────
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('Token tidak ditemukan');

    try {
      const payload = jwt.verify(
        token,
        this.config.getOrThrow('JWT_SECRET'),
      ) as JwtPayload;
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Token tidak valid atau sudah kadaluarsa');
    }

    // Check required permissions
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      REQUIRED_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredPermissions?.length) {
      const userPerms = ROLE_PERMISSIONS[request.user.role] || [];
      const hasAll = requiredPermissions.every((p) => userPerms.includes(p));
      if (!hasAll) throw new UnauthorizedException('Akses ditolak');
    }

    // Check required roles
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      REQUIRED_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles?.length) {
      if (!requiredRoles.includes(request.user.role)) {
        throw new UnauthorizedException('Role tidak mencukupi');
      }
    }

    return true;
  }

  private extractToken(request: any): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
