import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard, CurrentUser, Public, JwtPayload } from '../../common/guards/jwt-auth.guard';

class LoginDto { @IsEmail() email: string; @IsString() @MinLength(6) password: string; }
class RefreshDto { @IsString() refresh_token: string; }

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly svc: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login dengan email & password' })
  login(@Body() dto: LoginDto) {
    return this.svc.login(dto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshDto) {
    return this.svc.refresh(dto.refresh_token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@CurrentUser() user: JwtPayload) {
    return this.svc.getMe(user.sub);
  }
}
