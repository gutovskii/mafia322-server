import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1706085612526 implements MigrationInterface {
    name = 'InitialMigration1706085612526'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."role_kindness_enum" AS ENUM('TOWN_ALIGNED', 'THIRD_PARTY', 'MAFIA_ALIGNED')
        `);
        await queryRunner.query(`
            CREATE TABLE "role" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "kindness" "public"."role_kindness_enum" NOT NULL,
                CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE ("name"),
                CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "player" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "isAdmin" boolean NOT NULL,
                "isDead" boolean NOT NULL DEFAULT false,
                "isFcked" boolean NOT NULL DEFAULT false,
                "roleId" integer,
                "roomId" integer NOT NULL,
                CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."room_roomaccessibility_enum" AS ENUM('PUBLIC', 'PRIVATE')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."room_status_enum" AS ENUM('WAITING', 'PLAYING', 'SETTING_UP')
        `);
        await queryRunner.query(`
            CREATE TABLE "room" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "accessCode" character varying NOT NULL,
                "roomAccessibility" "public"."room_roomaccessibility_enum" NOT NULL DEFAULT 'PUBLIC',
                "status" "public"."room_status_enum" NOT NULL DEFAULT 'WAITING',
                "firstDayTimeSec" integer NOT NULL,
                "dayTimeSec" integer NOT NULL,
                "maxPlayers" integer NOT NULL,
                "minPlayers" integer NOT NULL,
                CONSTRAINT "PK_c6d46db005d623e691b2fbcba23" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "room_roles_role" (
                "roomId" integer NOT NULL,
                "roleId" integer NOT NULL,
                CONSTRAINT "PK_76fa26dd59b276a200eacbadd0e" PRIMARY KEY ("roomId", "roleId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cafc5094a00864d0526c51251e" ON "room_roles_role" ("roomId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d7a2765ecb591dba64ff1004b6" ON "room_roles_role" ("roleId")
        `);
        await queryRunner.query(`
            ALTER TABLE "player"
            ADD CONSTRAINT "FK_2cc827ce28378627ce056678870" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "player"
            ADD CONSTRAINT "FK_145fea442eb4b687dbc6ebbefe3" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "room_roles_role"
            ADD CONSTRAINT "FK_cafc5094a00864d0526c51251ed" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "room_roles_role"
            ADD CONSTRAINT "FK_d7a2765ecb591dba64ff1004b66" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "room_roles_role" DROP CONSTRAINT "FK_d7a2765ecb591dba64ff1004b66"
        `);
        await queryRunner.query(`
            ALTER TABLE "room_roles_role" DROP CONSTRAINT "FK_cafc5094a00864d0526c51251ed"
        `);
        await queryRunner.query(`
            ALTER TABLE "player" DROP CONSTRAINT "FK_145fea442eb4b687dbc6ebbefe3"
        `);
        await queryRunner.query(`
            ALTER TABLE "player" DROP CONSTRAINT "FK_2cc827ce28378627ce056678870"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_d7a2765ecb591dba64ff1004b6"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_cafc5094a00864d0526c51251e"
        `);
        await queryRunner.query(`
            DROP TABLE "room_roles_role"
        `);
        await queryRunner.query(`
            DROP TABLE "room"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."room_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."room_roomaccessibility_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "player"
        `);
        await queryRunner.query(`
            DROP TABLE "role"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."role_kindness_enum"
        `);
    }

}
