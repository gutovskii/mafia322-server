import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePlayerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(15)
  name: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;

  @ApiProperty()
  @IsUUID()
  roomId: string;
}
