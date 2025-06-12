// src/datamahasiswa/data.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { Mahasiswa } from './mahasiswa.entity';
import { Prodi } from './prodi.entity';
import { Alamat } from './alamat.entity';
import { 
  CreateProdiDto, 
  UpdateProdiDto,
  CreateMahasiswaDto, 
  UpdateMahasiswaDto,
  FindMahasiswaQueryDto 
} from './create-data.dto';

@Injectable()
export class DataService {
  constructor(
    @InjectRepository(Prodi) private prodiRepository: Repository<Prodi>,
    @InjectRepository(Mahasiswa) private mahasiswaRepository: Repository<Mahasiswa>,
    @InjectRepository(Alamat) private alamatRepository: Repository<Alamat>,
  ) {}

  // --- LOGIKA PRODI ---
  findAllProdi(): Promise<Prodi[]> {
    return this.prodiRepository.find();
  }
  
  async findOneProdi(id: number): Promise<Prodi> {
    const prodi = await this.prodiRepository.findOneBy({ id });
    if (!prodi) {
      throw new NotFoundException(`Prodi dengan ID ${id} tidak ditemukan.`);
    }
    return prodi;
  }

  createProdi(createProdiDto: CreateProdiDto): Promise<Prodi> {
    const prodi = this.prodiRepository.create(createProdiDto);
    return this.prodiRepository.save(prodi);
  }

  async updateProdi(id: number, updateProdiDto: UpdateProdiDto): Promise<Prodi> {
    await this.prodiRepository.update(id, updateProdiDto);
    const updatedProdi = await this.findOneProdi(id);
    return updatedProdi;
  }

  async removeProdi(id: number): Promise<void> {
    const result = await this.prodiRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Prodi dengan ID ${id} tidak ditemukan.`);
    }
  }

  // --- LOGIKA MAHASISWA ---

  // Fungsi custom: Pengecekan duplikat NIM
  private async checkDuplicateNim(nim: string, excludeId?: number): Promise<void> {
    const where: FindOptionsWhere<Mahasiswa> = { nim };
    const existing = await this.mahasiswaRepository.findOne({ where });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`Mahasiswa dengan NIM ${nim} sudah terdaftar.`);
    }
  }
  
  async createMahasiswa(dto: CreateMahasiswaDto): Promise<Mahasiswa> {
    await this.checkDuplicateNim(dto.nim);
    
    // Pastikan prodi ada
    await this.findOneProdi(dto.prodi_id);

    const mahasiswa = this.mahasiswaRepository.create({
      nama: dto.nama,
      nim: dto.nim,
      prodi_id: dto.prodi_id,
    });

    const savedMahasiswa = await this.mahasiswaRepository.save(mahasiswa);
    
    // Jika ada data alamat, buat dan kaitkan
    if (dto.alamat) {
      const alamat = this.alamatRepository.create({
        ...dto.alamat,
        mahasiswa_id: savedMahasiswa.id,
      });
      await this.alamatRepository.save(alamat);
    }
    
    // Kembalikan data lengkap
    return this.findOneMahasiswa(savedMahasiswa.id);
  }

  async findAllMahasiswa(query: FindMahasiswaQueryDto) {
    const { page = 1, limit = 10, search, prodi_id, sortBy, sortOrder } = query;
    
    const queryBuilder = this.mahasiswaRepository.createQueryBuilder('mahasiswa')
      .leftJoinAndSelect('mahasiswa.prodi', 'prodi')
      .leftJoinAndSelect('mahasiswa.alamat', 'alamat')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy(`mahasiswa.${sortBy}`, sortOrder);

    if (prodi_id) {
      queryBuilder.where('mahasiswa.prodi_id = :prodi_id', { prodi_id });
    }
    
    if (search) {
      queryBuilder.andWhere('(mahasiswa.nama ILIKE :search OR mahasiswa.nim ILIKE :search)', {
        search: `%${search}%`,
      });
    }
    
    const [data, count] = await queryBuilder.getManyAndCount();
    
    return {
      data,
      count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    };
  }

  async findOneMahasiswa(id: number): Promise<Mahasiswa> {
    const mahasiswa = await this.mahasiswaRepository.findOne({
      where: { id },
      relations: ['prodi', 'alamat'], // Join dengan prodi dan alamat
    });
    if (!mahasiswa) {
      throw new NotFoundException(`Mahasiswa dengan ID ${id} tidak ditemukan.`);
    }
    return mahasiswa;
  }

  async updateMahasiswa(id: number, dto: UpdateMahasiswaDto): Promise<Mahasiswa> {
    if (dto.nim) {
        await this.checkDuplicateNim(dto.nim, id);
    }
    if (dto.prodi_id) {
        await this.findOneProdi(dto.prodi_id);
    }

    const mahasiswa = await this.findOneMahasiswa(id);
    
    // Update data alamat jika ada
    if (dto.alamat) {
        if (mahasiswa.alamat) {
            await this.alamatRepository.update(mahasiswa.alamat.id, dto.alamat);
        } else {
            const newAlamat = this.alamatRepository.create({ ...dto.alamat, mahasiswa_id: id });
            await this.alamatRepository.save(newAlamat);
        }
    }
    
    // Update data mahasiswa (tanpa alamat)
    const { alamat, ...mahasiswaData } = dto;
    await this.mahasiswaRepository.update(id, mahasiswaData);
    
    return this.findOneMahasiswa(id);
  }
  
  async removeMahasiswa(id: number): Promise<void> {
    // Relasi alamat akan terhapus otomatis karena 'onDelete: CASCADE'
    const result = await this.mahasiswaRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Mahasiswa dengan ID ${id} tidak ditemukan.`);
    }
  }

  async updateMahasiswaFoto(id: number, fotoUrl: string): Promise<Mahasiswa> {
    await this.mahasiswaRepository.update(id, { foto: fotoUrl });
    return this.findOneMahasiswa(id);
  }
}
