import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUser1746000000000 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Membuat tabel 'users' menggunakan raw query
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "users" (
            "id" SERIAL PRIMARY KEY,
            "username" VARCHAR(50) UNIQUE NOT NULL,
            "email" VARCHAR(255) UNIQUE NOT NULL,
            "password" VARCHAR NOT NULL,
            "role" VARCHAR(20) NOT NULL DEFAULT 'user',
            "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);
    
    // Menambahkan indeks untuk mempercepat pencarian berdasarkan username dan email
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_USERS_USERNAME" ON "users" ("username")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_USERS_EMAIL" ON "users" ("email")`);
}

public async down(queryRunner: QueryRunner): Promise<void> {
    // Menghapus indeks terlebih dahulu sebelum menghapus tabel
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_USERS_EMAIL"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_USERS_USERNAME"`);
    
    // Menghapus tabel 'users'
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
}
}
