import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { GameModule } from './modules/game/game.module';
import { PlayerModule } from './modules/player/player.module';
import { RoleModule } from './modules/role/role.module';
import { RoomModule } from './modules/room/room.module';
import { SeedModule } from './modules/seed/seed.module';
import { ormConfig } from './orm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        PG_HOST: Joi.string().required(),
        PG_PORT: Joi.string().required(),
        PG_USER: Joi.string().required(),
        PG_PASS: Joi.string().allow(''),
        PG_DB: Joi.string().required(),
      }),
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(ormConfig),
    RoomModule,
    PlayerModule,
    RoleModule,
    SeedModule,
    GameModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
