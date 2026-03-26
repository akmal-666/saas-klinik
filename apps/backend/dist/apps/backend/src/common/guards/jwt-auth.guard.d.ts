import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@klinik/shared-types';
import { Permission } from '@klinik/shared-constants';
export declare const IS_PUBLIC_KEY = "isPublic";
export declare const REQUIRED_PERMISSIONS_KEY = "requiredPermissions";
export declare const REQUIRED_ROLES_KEY = "requiredRoles";
export declare const Public: () => any;
export declare const RequirePermissions: (...permissions: Permission[]) => any;
export declare const RequireRoles: (...roles: UserRole[]) => any;
export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
    clinic_id: string;
    name: string;
}
export declare const CurrentUser: any;
export declare const ClinicId: any;
export declare class JwtAuthGuard implements CanActivate {
    private reflector;
    private config;
    constructor(reflector: Reflector, config: ConfigService);
    canActivate(context: ExecutionContext): boolean;
    private extractToken;
}
