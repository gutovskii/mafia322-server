import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerModule } from '../player/player.module';
import { RoleStatsEntity } from '../role/entities/role-stats.entity';
import { RoomModule } from '../room/room.module';
import { GameStateManager } from './game-state.manager';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  imports: [
    RoomModule,
    PlayerModule,
    TypeOrmModule.forFeature([RoleStatsEntity]),
  ],
  providers: [GameGateway, GameService, GameStateManager],
  exports: [GameGateway, GameStateManager],
  controllers: [GameController],
})
export class GameModule {}
