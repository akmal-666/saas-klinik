"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = exports.ClinicId = exports.CurrentUser = exports.RequireRoles = exports.RequirePermissions = exports.Public = exports.REQUIRED_ROLES_KEY = exports.REQUIRED_PERMISSIONS_KEY = exports.IS_PUBLIC_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const jwt = __importStar(require("jsonwebtoken"));
const shared_constants_1 = require("../../../../../packages/shared-constants/src/index.ts");
exports.IS_PUBLIC_KEY = 'isPublic';
exports.REQUIRED_PERMISSIONS_KEY = 'requiredPermissions';
exports.REQUIRED_ROLES_KEY = 'requiredRoles';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;
const RequirePermissions = (...permissions) => (0, common_1.SetMetadata)(exports.REQUIRED_PERMISSIONS_KEY, permissions);
exports.RequirePermissions = RequirePermissions;
const RequireRoles = (...roles) => (0, common_1.SetMetadata)(exports.REQUIRED_ROLES_KEY, roles);
exports.RequireRoles = RequireRoles;
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
});
exports.ClinicId = (0, common_1.createParamDecorator)((_, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return (request.headers['x-clinic-id'] ||
        request.user?.clinic_id);
});
let JwtAuthGuard = class JwtAuthGuard {
    constructor(reflector, config) {
        this.reflector = reflector;
        this.config = config;
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(exports.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);
        if (!token)
            throw new common_1.UnauthorizedException('Token tidak ditemukan');
        try {
            const payload = jwt.verify(token, this.config.getOrThrow('JWT_SECRET'));
            request.user = payload;
        }
        catch {
            throw new common_1.UnauthorizedException('Token tidak valid atau sudah kadaluarsa');
        }
        const requiredPermissions = this.reflector.getAllAndOverride(exports.REQUIRED_PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
        if (requiredPermissions?.length) {
            const userPerms = shared_constants_1.ROLE_PERMISSIONS[request.user.role] || [];
            const hasAll = requiredPermissions.every((p) => userPerms.includes(p));
            if (!hasAll)
                throw new common_1.UnauthorizedException('Akses ditolak');
        }
        const requiredRoles = this.reflector.getAllAndOverride(exports.REQUIRED_ROLES_KEY, [context.getHandler(), context.getClass()]);
        if (requiredRoles?.length) {
            if (!requiredRoles.includes(request.user.role)) {
                throw new common_1.UnauthorizedException('Role tidak mencukupi');
            }
        }
        return true;
    }
    extractToken(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : null;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map