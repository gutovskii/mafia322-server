import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export const MIN_DAY_TIME_SEC = 10;
export const MAX_DAY_TIME_SEC = 360;
export const MIN_FIRST_DAY_TIME_SEC = 10;
export const MAX_FIRST_DAY_TIME_SEC = 360;
export const MIN_PLAYERS_COUNT = 3;
export const MAX_PLAYERS_COUNT = 20;

export class CreateRoomDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  playerName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  accessCode: string;

  @ApiProperty()
  @IsOptional()
  @Min(MIN_FIRST_DAY_TIME_SEC)
  @Max(MAX_FIRST_DAY_TIME_SEC)
  firstDayTimeSec: number;

  @ApiProperty()
  @Min(MIN_DAY_TIME_SEC)
  @Max(MAX_DAY_TIME_SEC)
  dayTimeSec: number;

  @ApiProperty()
  @Min(MIN_PLAYERS_COUNT)
  @Max(MAX_PLAYERS_COUNT)
  maxPlayers: number;

  @ApiProperty()
  @Min(MIN_PLAYERS_COUNT)
  @Max(MAX_PLAYERS_COUNT)
  minPlayers: number;

  @ApiProperty({
    isArray: true,
    default: [
      { roleId: 1, roleCount: 2 },
      { roleId: 2, roleCount: 1 },
      { roleId: 3, roleCount: 3 },
    ],
  })
  // @ArrayMinSize(MIN_PLAYERS_COUNT)
  // @ArrayMaxSize(MAX_PLAYERS_COUNT)
  @ValidateNested({ each: true })
  @Type(() => RoomRoleDto)
  rolesStats: RoomRoleDto[];
}

class RoomRoleDto {
  @IsNumber()
  roleId: number;

  @IsNumber()
  roleCount: number;
}
