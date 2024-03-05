import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { RoleEntity } from '../role/entities/role.entity';
import { roleSeeds } from './seeds/role.seed';

@Module({})
export class SeedModule implements OnApplicationBootstrap {
  private readonly logger = new Logger();

  constructor(
    @InjectEntityManager() private readonly em: EntityManager,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    if (this.configService.get('NODE_ENV') === 'dev') {
      await this.em.save(RoleEntity, roleSeeds);
      this.logger.log('Seeded successfully');
    }
  }
}
