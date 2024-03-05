import { Role } from 'src/modules/role/enums/role.enum';

export class MakeActionDto {
  roomId: string;
  playerId: string;
  victimId: string;
  roleName: Role;
}
