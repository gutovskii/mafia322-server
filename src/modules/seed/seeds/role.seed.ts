import { RoleEntity } from 'src/modules/role/entities/role.entity';
import { RoleKindness } from 'src/modules/role/enums/role-kindness.enum';
import { Role } from 'src/modules/role/enums/role.enum';

export const roleSeeds: RoleEntity[] = [
  {
    name: Role.CITIZEN,
    kindness: RoleKindness.TOWN_ALIGNED,
    isActive: false,
  },
  {
    name: Role.SHERIFF,
    kindness: RoleKindness.TOWN_ALIGNED,
    isActive: true,
  },
  {
    name: Role.MAFIA,
    kindness: RoleKindness.MAFIA_ALIGNED,
    isActive: true,
  },
  {
    name: Role.MANIAC,
    kindness: RoleKindness.MANIAC,
    isActive: true,
  },
  {
    name: Role.GIRL,
    kindness: RoleKindness.THIRD_PARTY,
    isActive: true,
  },
];
