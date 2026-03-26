import { AuthService } from './auth.service';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
declare class LoginDto {
    email: string;
    password: string;
}
declare class RefreshDto {
    refresh_token: string;
}
export declare class AuthController {
    private readonly svc;
    constructor(svc: AuthService);
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
    refresh(dto: RefreshDto): Promise<{
        access_token: any;
    }>;
    getMe(user: JwtPayload): Promise<any>;
}
export {};
