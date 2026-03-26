import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthService {
    private readonly supabase;
    private readonly jwt;
    private readonly config;
    private readonly logger;
    constructor(supabase: SupabaseClient, jwt: JwtService, config: ConfigService);
    login(dto: LoginDto): Promise<{
        access_token: any;
        refresh_token: any;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            clinic_id: any;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        access_token: any;
    }>;
    getMe(userId: string): Promise<any>;
}
