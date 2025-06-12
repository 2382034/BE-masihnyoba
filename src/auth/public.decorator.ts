// src/auth/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

/**
 * Kunci metadata yang akan kita gunakan untuk memeriksa apakah sebuah rute bersifat publik.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator @Public() yang akan kita gunakan di controller untuk menandai
 * endpoint yang tidak memerlukan otentikasi.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
