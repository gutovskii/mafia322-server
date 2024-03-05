import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class JoinRoomDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  playerName: string;

  @ApiProperty()
  @IsUUID()
  roomId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  accessCode?: string;
}
