// src/datamahasiswa/data.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mahasiswa } from './mahasiswa.entity'; // Impor dari file baru
import { Prodi } from './prodi.entity';       // Impor dari file baru
import { Alamat } from './alamat.entity';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { AuthModule } from '../auth/auth.module'; // Impor AuthModule jika Guards butuh dependensi dari sana

@Module({
  // Impor semua entity yang digunakan dalam modul ini
  imports: [
    TypeOrmModule.forFeature([Mahasiswa, Prodi, Alamat]),
    AuthModule, // Pastikan AuthModule tersedia untuk JwtAuthGuard
  ],
  controllers: [DataController],
  providers: [DataService],
})
export class DataMahasiswaModule {}
