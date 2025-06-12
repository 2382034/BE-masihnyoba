// src/datamahasiswa/create-data.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  Length, 
  IsEnum,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

//======================
//   DTO PRODI
//======================
export class CreateProdiDto {
  @ApiProperty({ example: 'Teknik Informatika' })
  @IsString()
  @IsNotEmpty()
  nama_prodi: string;

  @ApiProperty({ example: 'Fakultas Teknik' })
  @IsString()
  @IsNotEmpty()
  fakultas: string;
}

export class UpdateProdiDto extends PartialType(CreateProdiDto) {}


//======================
//   DTO ALAMAT
//======================
class AlamatDto {
  @ApiProperty({ example: 'Jl. Merdeka No. 10' })
  @IsString()
  @IsOptional()
  jalan?: string;

  @ApiProperty({ example: 'Jakarta' })
  @IsString()
  @IsOptional()
  kota?: string;

  @ApiProperty({ example: 'DKI Jakarta' })
  @IsString()
  @IsOptional()
  provinsi?: string;

  @ApiProperty({ example: '12345' })
  @IsString()
  @IsOptional()
  @Length(5, 5)
  kode_pos?: string;
}


//======================
//   DTO MAHASISWA
//======================
export class CreateMahasiswaDto {
  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  @IsNotEmpty()
  nama: string;

  @ApiProperty({ example: '19210001' })
  @IsString()
  @IsNotEmpty()
  nim: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  prodi_id: number;

  @ApiProperty({ type: () => AlamatDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AlamatDto)
  alamat?: AlamatDto;
}

export class UpdateMahasiswaDto extends PartialType(CreateMahasiswaDto) {}


//======================
//   DTO untuk Query & Pagination
//======================
export enum SortMahasiswaBy {
  NAMA = 'nama',
  NIM = 'nim',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class FindMahasiswaQueryDto {
  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({ required: false, description: 'Cari berdasarkan Nama atau NIM' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, description: 'Filter berdasarkan ID prodi' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  prodi_id?: number;

  @ApiProperty({ enum: SortMahasiswaBy, required: false, default: SortMahasiswaBy.NAMA })
  @IsOptional()
  @IsEnum(SortMahasiswaBy)
  sortBy?: SortMahasiswaBy = SortMahasiswaBy.NAMA;

  @ApiProperty({ enum: SortOrder, required: false, default: SortOrder.ASC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;
}
