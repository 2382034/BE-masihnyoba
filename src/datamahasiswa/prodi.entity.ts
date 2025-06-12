// src/datamahasiswa/prodi.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Mahasiswa } from './mahasiswa.entity';

@Entity('prodi')
export class Prodi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nama_prodi: string;

  @Column({ length: 100 })
  fakultas: string;

  // DIUBAH: Menggunakan sintaks (type) => untuk memutus circular dependency
  @OneToMany(type => Mahasiswa, mahasiswa => mahasiswa.prodi)
  mahasiswa: Mahasiswa[];
}
