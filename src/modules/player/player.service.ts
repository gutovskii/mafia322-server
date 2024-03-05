import { Injectable } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayerRepository } from './player.repository';

@Injectable()
export class PlayerService {
  constructor(private readonly playerRepository: PlayerRepository) {}

  findByRoomId(roomId: string) {
    return this.playerRepository.findBy({ roomId });
  }

  create(dto: CreatePlayerDto) {
    const playerToCreate = this.playerRepository.create(dto);
    return this.playerRepository.save(playerToCreate);
  }

  async delete(id: string) {
    await this.playerRepository.delete(id);
    return true;
  }
}
