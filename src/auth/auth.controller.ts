// src/auth/auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { Public } from './public.decorator'; // 1. Impor decorator @Public

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // 2. Tandai endpoint ini sebagai publik
  @Post('login')
  async signIn(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public() // 3. Tandai endpoint ini juga sebagai publik
  @Post('register')
  register(@Body() registerDto: RegisterDTO) {
    return this.authService.register(registerDto);
  }
}
