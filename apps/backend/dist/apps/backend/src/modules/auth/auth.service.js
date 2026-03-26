"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = exports.LoginDto = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../../database/supabase.module");
class LoginDto {
}
exports.LoginDto = LoginDto;
let AuthService = AuthService_1 = class AuthService {
    constructor(supabase, jwt, config) {
        this.supabase = supabase;
        this.jwt = jwt;
        this.config = config;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async login(dto) {
        const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
            email: dto.email,
            password: dto.password,
        });
        if (authError || !authData.user) {
            throw new common_1.UnauthorizedException('Email atau password salah');
        }
        const { data: user, error: userError } = await this.supabase
            .from('users')
            .select('id, email, full_name, role, clinic_id, is_active')
            .eq('id', authData.user.id)
            .single();
        if (userError || !user)
            throw new common_1.UnauthorizedException('User tidak ditemukan');
        if (!user.is_active)
            throw new common_1.UnauthorizedException('Akun tidak aktif');
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            clinic_id: user.clinic_id,
            name: user.full_name,
        };
        const access_token = this.jwt.sign(payload);
        const refresh_token = this.jwt.sign(payload, {
            expiresIn: this.config.get('REFRESH_TOKEN_EXPIRES_IN', '30d'),
        });
        await this.supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);
        this.logger.log(`Login: ${user.email} (${user.role})`);
        return {
            access_token,
            refresh_token,
            user: {
                id: user.id,
                email: user.email,
                name: user.full_name,
                role: user.role,
                clinic_id: user.clinic_id,
            },
        };
    }
    async refresh(refreshToken) {
        try {
            const payload = this.jwt.verify(refreshToken, {
                secret: this.config.getOrThrow('JWT_SECRET'),
            });
            const { data: user } = await this.supabase
                .from('users')
                .select('id, is_active, role, clinic_id, full_name, email')
                .eq('id', payload.sub)
                .single();
            if (!user?.is_active)
                throw new common_1.UnauthorizedException();
            const newPayload = {
                sub: user.id,
                email: user.email,
                role: user.role,
                clinic_id: user.clinic_id,
                name: user.full_name,
            };
            return { access_token: this.jwt.sign(newPayload) };
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh token tidak valid');
        }
    }
    async getMe(userId) {
        const { data, error } = await this.supabase
            .from('users')
            .select(`
        id, email, full_name, role, avatar_url, is_active, last_login,
        clinic:clinics(id, name, branch, logo_url)
      `)
            .eq('id', userId)
            .single();
        if (error || !data)
            throw new common_1.UnauthorizedException();
        return data;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE_ADMIN)),
    __metadata("design:paramtypes", [typeof (_a = typeof supabase_js_1.SupabaseClient !== "undefined" && supabase_js_1.SupabaseClient) === "function" ? _a : Object, typeof (_b = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _b : Object, typeof (_c = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _c : Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map