import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PlayerEntity } from './player.entity';

@Injectable()
export class PlayerRepository extends Repository<PlayerEntity> {
  constructor(@InjectEntityManager() readonly em: EntityManager) {
    super(PlayerEntity, em);
  }
}
