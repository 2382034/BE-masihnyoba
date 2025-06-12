// Ganti xxxx dengan timestamp, misal: migrations/1746181000000-CreateDataTables.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDataTables1747235485388 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Buat Tabel Prodi
        await queryRunner.query(`
            CREATE TABLE "prodi" (
                "id" SERIAL NOT NULL,
                "nama_prodi" character varying(100) NOT NULL,
                "fakultas" character varying(100) NOT NULL,
                CONSTRAINT "PK_b93623d34a741a4a0349f22080f" PRIMARY KEY ("id")
            )
        `);

        // 2. Buat Tabel Mahasiswa
        await queryRunner.query(`
            CREATE TABLE "mahasiswa" (
                "id" SERIAL NOT NULL,
                "nama" character varying(150) NOT NULL,
                "nim" character varying(20) NOT NULL,
                "prodi_id" integer,
                "foto" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_9d462615a2abece1a36a71e27a6" UNIQUE ("nim"),
                CONSTRAINT "PK_2d95e0c9047970b5ebc18361621" PRIMARY KEY ("id")
            )
        `);

        // 3. Buat Tabel Alamat
        await queryRunner.query(`
            CREATE TABLE "alamat" (
                "id" SERIAL NOT NULL,
                "mahasiswa_id" integer NOT NULL,
                "jalan" character varying(255) NOT NULL,
                "kota" character varying(100) NOT NULL,
                "provinsi" character varying(100) NOT NULL,
                "kode_pos" character varying(10) NOT NULL,
                CONSTRAINT "REL_cbe0b6a6f6f9669528f335f4a4" UNIQUE ("mahasiswa_id"),
                CONSTRAINT "PK_3757134d13f70868f047587b1c4" PRIMARY KEY ("id")
            )
        `);

        // 4. Tambahkan Foreign Keys
        await queryRunner.query(`
            ALTER TABLE "mahasiswa" 
            ADD CONSTRAINT "FK_e571e44b868616b20677447605d" 
            FOREIGN KEY ("prodi_id") 
            REFERENCES "prodi"("id") 
            ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "alamat" 
            ADD CONSTRAINT "FK_cbe0b6a6f6f9669528f335f4a4e" 
            FOREIGN KEY ("mahasiswa_id") 
            REFERENCES "mahasiswa"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alamat" DROP CONSTRAINT "FK_cbe0b6a6f6f9669528f335f4a4e"`);
        await queryRunner.query(`ALTER TABLE "mahasiswa" DROP CONSTRAINT "FK_e571e44b868616b20677447605d"`);
        await queryRunner.query(`DROP TABLE "alamat"`);
        await queryRunner.query(`DROP TABLE "mahasiswa"`);
        await queryRunner.query(`DROP TABLE "prodi"`);
    }
}
