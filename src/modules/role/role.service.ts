import { Injectable } from '@nestjs/common';
import { Like, Not } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './enums/role.enum';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  find(withoutCitizen: boolean) {
    return this.roleRepository.find({
      where: {
        name: withoutCitizen ? Not(Role.CITIZEN) : Like('%%'),
      },
    });
  }

  create(dto: CreateRoleDto) {
    const roleToCreate = this.roleRepository.create(dto);
    return this.roleRepository.save(roleToCreate);
  }
}
