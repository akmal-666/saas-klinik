import {
  Injectable, UnauthorizedException, Inject, Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ADMIN } from '../../database/supabase.module';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';

export class LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(SUPABASE_ADMIN) private readonly supabase: SupabaseClient,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });
    if (authError || !authData.user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // 2. Load user record with clinic + role
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('id, email, full_name, role, clinic_id, is_active')
      .eq('id', authData.user.id)
      .single();

    if (userError || !user) throw new UnauthorizedException('User tidak ditemukan');
    if (!user.is_active) throw new UnauthorizedException('Akun tidak aktif');

    // 3. Build payload & sign
    const payload: JwtPayload = {
      sub:       user.id,
      email:     user.email,
      role:      user.role,
      clinic_id: user.clinic_id,
      name:      user.full_name,
    };

    const access_token  = this.jwt.sign(payload);
    const refresh_token = this.jwt.sign(payload, {
      expiresIn: this.config.get('REFRESH_TOKEN_EXPIRES_IN', '30d'),
    });

    // 4. Update last login
    await this.supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    this.logger.log(`Login: ${user.email} (${user.role})`);

    return {
      access_token,
      refresh_token,
      user: {
        id:        user.id,
        email:     user.email,
        name:      user.full_name,
        role:      user.role,
        clinic_id: user.clinic_id,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow('JWT_SECRET'),
      });

      const { data: user } = await this.supabase
        .from('users')
        .select('id, is_active, role, clinic_id, full_name, email')
        .eq('id', payload.sub)
        .single();

      if (!user?.is_active) throw new UnauthorizedException();

      const newPayload: JwtPayload = {
        sub:       user.id,
        email:     user.email,
        role:      user.role,
        clinic_id: user.clinic_id,
        name:      user.full_name,
      };

      return { access_token: this.jwt.sign(newPayload) };
    } catch {
      throw new UnauthorizedException('Refresh token tidak valid');
    }
  }

  async getMe(userId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select(`
        id, email, full_name, role, avatar_url, is_active, last_login,
        clinic:clinics(id, name, branch, logo_url)
      `)
      .eq('id', userId)
      .single();

    if (error || !data) throw new UnauthorizedException();
    return data;
  }
}
