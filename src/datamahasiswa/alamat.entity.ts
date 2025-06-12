// src/datamahasiswa/alamat.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Mahasiswa } from './mahasiswa.entity';

@Entity('alamat')
export class Alamat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  mahasiswa_id: number;

  @Column({ length: 255 })
  jalan: string;

  @Column({ length: 100 })
  kota: string;

  @Column({ length: 100 })
  provinsi: string;

  @Column({ length: 10 })
  kode_pos: string;

  // DIUBAH: Menggunakan sintaks (type) => untuk memutus circular dependency
  @OneToOne(type => Mahasiswa, mahasiswa => mahasiswa.alamat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mahasiswa_id' })
  mahasiswa: Mahasiswa;
}
