import { Module } from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  providers: [RoleRepository, RoleService],
  exports: [RoleRepository],
  controllers: [RoleController],
})
export class RoleModule {}
