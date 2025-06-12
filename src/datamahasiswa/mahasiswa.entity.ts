// src/datamahasiswa/mahasiswa.entity.ts
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne, 
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique
  } from 'typeorm';
  import { Prodi } from './prodi.entity';
  import { Alamat } from './alamat.entity';
  
  @Entity('mahasiswa')
  @Unique(['nim'])
  export class Mahasiswa {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ length: 150 })
    nama: string;
  
    @Column({ length: 20 })
    nim: string;
  
    @Column({ nullable: true })
    prodi_id: number;
  
    @Column({ type: 'text', nullable: true })
    foto: string;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  
    // Menggunakan sintaks (type) => untuk memutus circular dependency
    @ManyToOne(type => Prodi, prodi => prodi.mahasiswa, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'prodi_id' })
    prodi: Prodi;
  
    // Menggunakan sintaks (type) => untuk memutus circular dependency
    @OneToOne(type => Alamat, alamat => alamat.mahasiswa, { cascade: true })
    alamat: Alamat;
  }
  