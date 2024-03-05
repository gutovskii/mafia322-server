import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { PlayerRepository } from './player.repository';

@Module({
  controllers: [PlayerController],
  providers: [PlayerService, PlayerRepository],
  exports: [PlayerService, PlayerRepository],
})
export class PlayerModule {}
