import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  SendVerificationDto,
  GoogleIdTokenDto,
} from './auth.schema';
import { Public, CurrentUser } from './auth.decorators';
import type { SessionUser } from './auth.service';

/**
 * Manual email/password auth endpoints, proxied to better-auth's
 * server API. These complement — they don't replace — better-auth's native
 * routes and Google OAuth (GET /api/auth/sign-in/social), both still served by
 * the catch-all handler mounted in main.ts. The catch-all skips these specific
 * paths so they reach this controller.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Copy status + Set-Cookie + JSON body from a better-auth web Response. */
  private async forward(result: Response, res: Response): Promise<void> {
    const r = result as unknown as globalThis.Response;
    res.status(r.status);
    for (const cookie of r.headers.getSetCookie()) {
      res.append('set-cookie', cookie);
    }
    const text = await r.text();
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object') {
        if (!parsed.accessToken && parsed.token) {
          parsed.accessToken = parsed.token;
        }
        if (!parsed.refreshToken) {
          parsed.refreshToken = parsed.token || '';
        }
        res.type('application/json').send(JSON.stringify(parsed));
        return;
      }
    } catch {}
    res.type('application/json').send(text || '{}');
  }

  @Public()
  @Post('google-id-token')
  @ApiOperation({ summary: 'Authenticate using Native Google ID Token' })
  async googleIdToken(
    @Body() dto: GoogleIdTokenDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.auth.signInGoogleIdToken(dto.idToken);
    await this.forward(result as unknown as Response, res);
  }

  @Public()
  @Get('google-login')
  @ApiOperation({ summary: 'Initiate Google OAuth directly in browser' })
  async googleLogin(
    @Query('callbackURL') callbackURL: string,
    @Res() res: Response,
  ): Promise<void> {
    const cb = callbackURL || 'purrmanent://auth-callback';
    const result = await this.auth.signInSocial({
      provider: 'google',
      callbackURL: cb,
    });
    const r = result;
    for (const cookie of r.headers.getSetCookie()) {
      res.append('set-cookie', cookie);
    }
    const text = await r.text();
    try {
      const parsed = JSON.parse(text);
      if (parsed?.url) {
        res.redirect(parsed.url);
        return;
      }
    } catch {}
    res
      .status(r.status)
      .type('application/json')
      .send(text || '{}');
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register with email + password' })
  async register(
    @Body() dto: RegisterDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.auth.signUpEmail({
      email: dto.email,
      password: dto.password,
      name: dto.name ?? dto.email.split('@')[0],
    });
    await this.forward(result as unknown as Response, res);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Log in with email + password' })
  async login(@Body() dto: LoginDto, @Res() res: Response): Promise<void> {
    const result = await this.auth.signInEmail({
      email: dto.email,
      password: dto.password,
      rememberMe: dto.rememberMe,
    });
    await this.forward(result as unknown as Response, res);
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Log out (clears the session cookie)' })
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    const result = await this.auth.signOut(req.headers);
    await this.forward(result as unknown as Response, res);
  }

  @Get('session')
  @ApiOperation({ summary: 'Get the current authenticated user' })
  session(@CurrentUser() user: SessionUser): SessionUser {
    return user;
  }

  @Public()
  @Post('send-verification')
  @ApiOperation({
    summary: 'Send (or resend) a verification email with a 24h link',
  })
  async sendVerification(
    @Body() dto: SendVerificationDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.auth.sendVerificationEmail({
      email: dto.email,
      callbackURL: dto.callbackURL,
    });
    await this.forward(result as unknown as Response, res);
  }
}
