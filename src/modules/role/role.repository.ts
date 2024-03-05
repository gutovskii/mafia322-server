import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RoleRepository extends Repository<RoleEntity> {
  constructor(@InjectEntityManager() readonly em: EntityManager) {
    super(RoleEntity, em);
  }
}
