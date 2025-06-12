// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      // Jika tidak ada decorator @Roles(), akses diizinkan
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Pastikan payload JWT Anda berisi properti 'role'
    if (!user || !user.role) {
      return false;
    }

    // Periksa apakah peran user cocok dengan salah satu peran yang dibutuhkan
    return requiredRoles.some((role) => user.role === role);
  }
}
