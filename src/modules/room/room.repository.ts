import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RoomEntity } from './room.entity';

@Injectable()
export class RoomRepository extends Repository<RoomEntity> {
  constructor(@InjectEntityManager() readonly em: EntityManager) {
    super(RoomEntity, em);
  }

  async isExists(id: string) {
    return !!(await this.findOne({ where: { id }, select: ['id'] }));
  }
}
