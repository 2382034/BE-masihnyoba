// src/datamahasiswa/data.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UsePipes, ValidationPipe,
  Query, UploadedFile, UseInterceptors, UseGuards, BadRequestException, 
  InternalServerErrorException, NotFoundException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { put, del as deleteBlob } from '@vercel/blob';

// Guards & Decorators (Asumsi sudah dibuat di modul Auth)
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

import { DataService } from './data.service';
import {
  CreateProdiDto, UpdateProdiDto,
  CreateMahasiswaDto, UpdateMahasiswaDto,
  FindMahasiswaQueryDto,
} from './create-data.dto';

const BLOB_FOTO_MAHASISWA_PREFIX = 'mahasiswa-fotos/';

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return callback(new BadRequestException('Hanya file gambar yang diizinkan!'), false);
  }
  callback(null, true);
};

@Controller('data')
@UseGuards(JwtAuthGuard, RolesGuard) // Melindungi semua endpoint di controller ini
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class DataController {
  constructor(private readonly dataService: DataService) {}

  // --- Prodi Endpoints ---
  @Get('prodi')
  @Roles(Role.Admin, Role.User) // Boleh diakses admin & user
  findAllProdi() {
    return this.dataService.findAllProdi();
  }
  
  @Post('prodi')
  @Roles(Role.Admin) // Hanya admin
  createProdi(@Body() createProdiDto: CreateProdiDto) {
    return this.dataService.createProdi(createProdiDto);
  }

  @Patch('prodi/:id')
  @Roles(Role.Admin) // Hanya admin
  updateProdi(@Param('id', ParseIntPipe) id: number, @Body() updateProdiDto: UpdateProdiDto) {
    return this.dataService.updateProdi(id, updateProdiDto);
  }

  @Delete('prodi/:id')
  @Roles(Role.Admin) // Hanya admin
  removeProdi(@Param('id', ParseIntPipe) id: number) {
    return this.dataService.removeProdi(id);
  }

  // --- Mahasiswa Endpoints ---
  @Get('mahasiswa')
  @Roles(Role.Admin, Role.User) // Boleh diakses admin & user
  findAllMahasiswa(@Query() query: FindMahasiswaQueryDto) {
    return this.dataService.findAllMahasiswa(query);
  }
  
  @Get('mahasiswa/:id')
  @Roles(Role.Admin, Role.User) // Boleh diakses admin & user
  findOneMahasiswa(@Param('id', ParseIntPipe) id: number) {
    return this.dataService.findOneMahasiswa(id);
  }

  @Post('mahasiswa')
  @Roles(Role.Admin) // Hanya admin
  createMahasiswa(@Body() createMahasiswaDto: CreateMahasiswaDto) {
    return this.dataService.createMahasiswa(createMahasiswaDto);
  }

  @Patch('mahasiswa/:id')
  @Roles(Role.Admin) // Hanya admin
  updateMahasiswa(@Param('id', ParseIntPipe) id: number, @Body() updateMahasiswaDto: UpdateMahasiswaDto) {
    return this.dataService.updateMahasiswa(id, updateMahasiswaDto);
  }

  @Delete('mahasiswa/:id')
  @Roles(Role.Admin) // Hanya admin
  async removeMahasiswa(@Param('id', ParseIntPipe) id: number) {
    const mahasiswa = await this.dataService.findOneMahasiswa(id);
    if (mahasiswa && mahasiswa.foto) {
      try {
        await deleteBlob(mahasiswa.foto);
      } catch (blobError) {
        console.error(`Gagal hapus foto lama dari Blob:`, blobError);
      }
    }
    return this.dataService.removeMahasiswa(id);
  }

  @Post('mahasiswa/:id/foto')
  @Roles(Role.Admin) // Hanya admin
  @UseInterceptors(FileInterceptor('foto', {
    storage: memoryStorage(),
    fileFilter: imageFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
  }))
  async uploadMahasiswaFoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File foto diperlukan.');
    if (!process.env.BLOB_READ_WRITE_TOKEN) throw new InternalServerErrorException('Konfigurasi Blob tidak ditemukan.');

    const existingMahasiswa = await this.dataService.findOneMahasiswa(id);

    const blobFilename = `${BLOB_FOTO_MAHASISWA_PREFIX}${uuidv4()}${extname(file.originalname)}`;
    
    try {
      const blob = await put(blobFilename, file.buffer, {
        access: 'public',
        contentType: file.mimetype,
      });

      if (existingMahasiswa.foto) {
        try {
          await deleteBlob(existingMahasiswa.foto);
        } catch (blobDeleteError) {
          console.error(`Gagal hapus foto lama dari Blob:`, blobDeleteError);
        }
      }
      return this.dataService.updateMahasiswaFoto(id, blob.url);
    } catch (error) {
      console.error('Error upload ke Vercel Blob:', error);
      throw new InternalServerErrorException('Gagal mengunggah foto.');
    }
  }
}
