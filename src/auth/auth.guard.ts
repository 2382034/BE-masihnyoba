// src/auth/auth.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { JwtService } from '@nestjs/jwt';
  import { Reflector } from '@nestjs/core'; // 1. Impor Reflector
  import { Request } from 'express';
  import { IS_PUBLIC_KEY } from './public.decorator'; // 2. Impor kunci metadata
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(
      private jwtService: JwtService,
      private configService: ConfigService,
      private reflector: Reflector, // 3. Inject Reflector
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      // 4. Periksa apakah endpoint memiliki metadata @Public()
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
  
      if (isPublic) {
        // Jika endpoint adalah publik, lewati semua pengecekan dan izinkan akses
        return true;
      }
  
      // --- Logika lama Anda untuk rute yang terproteksi tetap sama ---
      const request = context.switchToHttp().getRequest<Request>();
      const token = this.extractTokenFromHeader(request);
  
      if (!token) {
        throw new UnauthorizedException('Akses ditolak. Token tidak ditemukan.');
      }
  
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });
  
        request['user'] = payload;
      } catch {
        throw new UnauthorizedException('Akses ditolak. Token tidak valid.');
      }
  
      return true;
    }
  
    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }
  
