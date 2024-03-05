import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerModule } from '../player/player.module';
import { RoleStatsEntity } from '../role/entities/role-stats.entity';
import { RoleModule } from '../role/role.module';
import { GamePlayerManager } from './game-player.manager';
import { RoomController } from './room.controller';
import { RoomGateway } from './room.gateway';
import { RoomRepository } from './room.repository';
import { RoomService } from './room.service';

@Module({
  imports: [
    RoleModule,
    PlayerModule,
    TypeOrmModule.forFeature([RoleStatsEntity]),
  ],
  controllers: [RoomController],
  providers: [RoomService, RoomRepository, RoomGateway, GamePlayerManager],
  exports: [RoomService, RoomRepository, GamePlayerManager],
})
export class RoomModule {}
