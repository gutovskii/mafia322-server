import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { RoleKindness } from '../enums/role-kindness.enum';

export class CreateRoleDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: RoleKindness, default: RoleKindness.TOWN_ALIGNED })
  @IsString()
  @IsNotEmpty()
  kindness: RoleKindness;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}
