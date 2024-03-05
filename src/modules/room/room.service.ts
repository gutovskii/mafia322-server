import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { Server, Socket } from 'socket.io';
import { Equal, ILike, Or, Repository } from 'typeorm';
import { PlayerService } from '../player/player.service';
import { RoleStatsEntity } from '../role/entities/role-stats.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { FindOptionsDto } from './dto/find-options.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { LeaveRoomDto } from './dto/leave-room.dto';
import { RoomStatus } from './enums/room-status.enum';
import { GamePlayerManager } from './game-player.manager';
import { RoomEntity } from './room.entity';
import { RoomRepository } from './room.repository';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(RoleStatsEntity)
    private readonly roleStatsRepository: Repository<RoleStatsEntity>,
    private readonly roomRepository: RoomRepository,
    private readonly playerService: PlayerService,
    private readonly gamePlayerManager: GamePlayerManager,
  ) {}

  find({ limit, page, search, allStatuses }: FindOptionsDto) {
    const statuses = [Equal(RoomStatus.WAITING)];
    if (allStatuses) statuses.push(Equal(RoomStatus.PLAYING));
    return paginate<RoomEntity>(
      this.roomRepository,
      { limit, page },
      {
        where: {
          name: ILike(`%${search}%`),
          status: Or(...statuses),
        },
        relations: { rolesStats: true, players: true },
      },
    );
  }

  findOne(id: string) {
    return this.roomRepository.findOne({
      where: { id },
      relations: { rolesStats: true, players: true },
    });
  }

  async create(dto: CreateRoomDto, socket: Socket) {
    const { rolesStats, playerName, ...creationObj } = dto;
    const roomToCreate = this.roomRepository.create(creationObj);

    if (roomToCreate.accessCode) roomToCreate.isPrivate = true;

    roomToCreate.rolesStats = await Promise.all(
      rolesStats.map((info) => {
        const roleStatsToSave = this.roleStatsRepository.create(info);
        return this.roleStatsRepository.save(roleStatsToSave);
      }),
    );

    const createdRoom = await this.roomRepository.save(roomToCreate);

    const adminPlayer = await this.playerService.create({
      name: playerName,
      isAdmin: true,
      roomId: createdRoom.id,
    });
    this.gamePlayerManager.addPlayer(adminPlayer.id, socket.id);

    socket.join(createdRoom.id);

    return {
      createdRoom,
      adminPlayer,
    };
  }

  async join(dto: JoinRoomDto, socket: Socket) {
    const newPlayer = await this.playerService.create({
      name: dto.playerName,
      roomId: dto.roomId,
    });
    this.gamePlayerManager.addPlayer(newPlayer.id, socket.id);
    console.log(this.gamePlayerManager.getPlayers());

    socket.join(dto.roomId);
    socket.broadcast
      .to(dto.roomId)
      .emit('notificate:player-joined', { newPlayerName: dto.playerName });
    return newPlayer;
  }

  async start(roomId: string, server: Server) {
    await this.roomRepository.update(roomId, {
      status: RoomStatus.PLAYING,
    });
    server.to(roomId).emit('room:start');
  }

  async leave(dto: LeaveRoomDto, socket: Socket, server: Server) {
    await this.playerService.delete(dto.playerId);
    socket.leave(dto.roomId);
    if (dto.isPlayerAdmin) {
      await this.roomRepository.delete(dto.roomId);
      socket.to(dto.roomId).emit('notificate:admin-left');
      server.socketsLeave(dto.roomId);
      this.gamePlayerManager.removePlayer(dto.playerId);
    } else {
      socket
        .to(dto.roomId)
        .emit('notificate:player-left', { leftPlayerName: dto.playerName });
      this.gamePlayerManager.removePlayer(dto.playerId);
    }
  }

  async delete(id: string) {
    await this.roomRepository.delete(id);
    return true;
  }
}
