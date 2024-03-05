import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JoinRoomDto } from './dto/join-room.dto';
import { RoomStatus } from './enums/room-status.enum';
import { RoomRepository } from './room.repository';

@Injectable()
export class JoinRoomGuard implements CanActivate {
  constructor(private readonly roomRepository: RoomRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const joinRoomDto: JoinRoomDto = context.switchToWs().getData();
    const roomToEnter = await this.roomRepository.findOne({
      where: { id: joinRoomDto.roomId },
      select: ['id', 'isPrivate', 'accessCode', 'name', 'maxPlayers', 'status'],
      relations: { players: true },
    });
    if (!roomToEnter) {
      client.emit('error', { message: 'Кімнати не існує' });
      return false;
    }
    if (
      roomToEnter.isPrivate &&
      roomToEnter.accessCode !== joinRoomDto.accessCode
    ) {
      client.emit('error', { message: 'Неправильний код' });
      return false;
    }
    if (roomToEnter.status === RoomStatus.PLAYING) {
      client.emit('error', { message: 'Гра вже почалась' });
      return false;
    }
    if (roomToEnter.maxPlayers === roomToEnter.players.length) {
      client.emit('error', { message: 'Кількість учасників максимальна' });
      return false;
    }
    return true;
  }
}
