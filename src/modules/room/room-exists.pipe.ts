import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { RoomRepository } from './room.repository';

@Injectable()
export class RoomExistsPipe implements PipeTransform {
  constructor(private readonly roomRepository: RoomRepository) {}

  async transform(id: string, _: ArgumentMetadata) {
    const isExists = await this.roomRepository.isExists(id);
    if (!isExists)
      throw new NotFoundException(`Room with id: ${id} was not found`);
    return id;
  }
}
