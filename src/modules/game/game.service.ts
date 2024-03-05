import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server } from 'socket.io';
import { Repository } from 'typeorm';
import { RoleStatsEntity } from '../role/entities/role-stats.entity';
import { RoleKindness } from '../role/enums/role-kindness.enum';
import { Role } from '../role/enums/role.enum';
import { roleWrapper } from '../role/role.wrapper';
import { RoomStatus } from '../room/enums/room-status.enum';
import { GamePlayerManager } from '../room/game-player.manager';
import { RoomEntity } from '../room/room.entity';
import { RoomRepository } from '../room/room.repository';
import { Effect } from './common/effect.enum';
import { MakeActionDto } from './dto/make-action.dto';
import { VoteDto } from './dto/vote.dto';
import { GameStateManager } from './game-state.manager';

@Injectable()
export class GameService {
  constructor(
    private readonly roomRepository: RoomRepository,
    private readonly gamePlayerManager: GamePlayerManager,
    private readonly gameStateManager: GameStateManager,
    @InjectRepository(RoleStatsEntity)
    private readonly roleStatsRepository: Repository<RoleStatsEntity>,
  ) {}

  async startGame(roomId: string, server: Server) {
    const room = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: { players: true, rolesStats: true },
    });

    await this.giveRoles(room, server);
    const updatedRoom = await this.roomRepository.findOne({
      where: { id: roomId },
      relations: { players: true },
    });
    this.gameStateManager.addGame(updatedRoom.id, updatedRoom.players);

    this.startFirstMeeting(updatedRoom, server);
  }

  startAction(roomId: string, server: Server) {
    const players = this.gameStateManager.getPlayers(roomId);
    const thereAreRolesToAction = !!players.find((p) => {
      if (p.hasActiveRole && !p.hasDoneAction) {
        server.to(roomId).emit('notificate:active-role-thinking', {
          message: `${p.role.name} робить свій вибір`,
        });
        server
          .to(this.gamePlayerManager.getPlayer(p.id))
          .emit('player:make-choice', {
            role: p.role,
          });
        p.hasDoneAction = true;
        return true;
      }
    });
    if (thereAreRolesToAction) return true;
    this.startDay(roomId, server);
    return false;
  }

  makeAction(dto: MakeActionDto, server: Server) {
    const resultMessage = roleWrapper[dto.roleName].action(
      dto.roomId,
      dto.playerId,
      dto.victimId,
      this.gameStateManager,
    );
    if (resultMessage) {
      server
        .to(this.gamePlayerManager.getPlayer(dto.playerId))
        .emit('action-result-message', resultMessage);
    }
    return true;
  }

  async startDay(roomId: string, server: Server) {
    const room = await this.roomRepository.findOneBy({ id: roomId });
    this.clearEffects(room);
    this.summarizeNight(room, server);
    const continueGame = this.checkGameEnd(room, server); // NIGGGER
    if (!continueGame) return;
    server.to(roomId).emit('game:start-day'); // client starts emiting on vote events
    setTimeout(() => {
      this.summarizeVotes(room, server);
      this.checkGameEnd(room, server);
    }, room.dayTimeSec * 1000);
  }

  vote(dto: VoteDto, server: Server) {
    const roomState = this.gameStateManager.getGame(dto.roomId);
    const votedCount = roomState.round.voted.get(dto.victimId);
    if (votedCount) {
      roomState.round.voted.set(dto.victimId, votedCount + 1);
      return;
    }
    roomState.round.voted.set(dto.victimId, 1);
    server.to(dto.roomId).emit('notificate:player-voted', {
      playerId: dto.playerId,
      victimId: dto.victimId,
    });
  }

  private async summarizeVotes(room: RoomEntity, server: Server) {
    const roomState = this.gameStateManager.getGame(room.id);
    let votingResult: [string, number] = ['', 0];
    let draw = false;
    roomState.round.voted.forEach((votesCount, playerId) => {
      if (votesCount === votingResult[1]) draw = true;
      if (votesCount > votingResult[1]) {
        votingResult[0] = playerId;
        votingResult[1] = votesCount;
        draw = false;
      }
    });
    if (draw) {
      server.to(room.id).emit('Нікого не обрано');
      return;
    }
    const votedPlayer = roomState.players.find((p) => p.id === votingResult[0]);
    server.to(room.id).emit(`${votedPlayer.name} вилітає`);
    roleWrapper[votedPlayer.role.name].onVoted(room.id, server);
    roomState.players.filter((p) => p.id !== votedPlayer.id);
  }

  private async checkGameEnd(room: RoomEntity, server: Server) {
    const players = this.gameStateManager.getPlayers(room.id);
    // townaligned - #, mafiaaligned - #, maniac - #, thirdparty - #
    const summary = new Map<RoleKindness, number>();
    players.map((p) => {
      const rolesCount = summary.get(p.role.kindness);
      if (rolesCount) {
        summary.set(p.role.kindness, rolesCount + 1);
        return;
      }
      summary.set(p.role.kindness, 1);
    });
    // TODO: clear code
    if (
      summary.get(RoleKindness.TOWN_ALIGNED) >= 1 &&
      summary.get(RoleKindness.THIRD_PARTY) >= 1 &&
      summary.get(RoleKindness.MAFIA_ALIGNED) === 0 &&
      summary.get(RoleKindness.MANIAC) === 0
    ) {
      server.to(room.id).emit('game-result', {
        winner: RoleKindness.TOWN_ALIGNED,
        role: 'Citizens',
      });
      await this.roomRepository.update(room.id, {
        status: RoomStatus.WAITING,
      });
      return false;
    }
    if (
      (summary.get(RoleKindness.MAFIA_ALIGNED) >
        summary.get(RoleKindness.TOWN_ALIGNED) +
          summary.get(RoleKindness.THIRD_PARTY) &&
        summary.get(RoleKindness.MANIAC) === 0) ||
      (summary.get(RoleKindness.MAFIA_ALIGNED) >
        summary.get(RoleKindness.MANIAC) &&
        summary.get(RoleKindness.TOWN_ALIGNED) === 0)
    ) {
      server.to(room.id).emit('game-result', {
        winner: RoleKindness.MAFIA_ALIGNED,
        role: 'Mafia',
      });
      await this.roomRepository.update(room.id, {
        status: RoomStatus.WAITING,
      });
      return false;
    }
    if (
      summary.get(RoleKindness.MANIAC) >
        summary.get(RoleKindness.TOWN_ALIGNED) +
          summary.get(RoleKindness.THIRD_PARTY) &&
      summary.get(RoleKindness.MAFIA_ALIGNED) === 0
    ) {
      server.to(room.id).emit('game-result', {
        winner: RoleKindness.MANIAC,
        role: summary.get(RoleKindness.MANIAC) === 1 ? "Ман'як" : "Ман'яки",
      });
      await this.roomRepository.update(room.id, {
        status: RoomStatus.WAITING,
      });
      return false;
    }
    server.to(room.id).emit('game-continue');
    return true;
  }

  private summarizeNight(room: RoomEntity, server: Server) {
    // TODO: clear code
    const roomState = this.gameStateManager.getGame(room.id);
    roomState.round.summariesForNight.healed.map((healedId) => {
      server
        .to(this.gamePlayerManager.getPlayer(healedId))
        .emit('night-result:healed');
      server
        .to(room.id)
        .emit('notificate:player-healed', { playerId: healedId });
      roomState.round.summariesForNight.killed.filter(
        (killedId) => killedId !== healedId,
      );
    });
    roomState.round.summariesForNight.fcked.map((fckedId) => {
      server
        .to(this.gamePlayerManager.getPlayer(fckedId))
        .emit('night-result:fcked');
      server.to(room.id).emit('notificate:player-fcked', { playerId: fckedId });
      roomState.players
        .find((p) => p.id === fckedId)
        .effects.push(Effect.FCKED);
    });
    roomState.round.summariesForNight.killed.map(async (killedId) => {
      server
        .to(this.gamePlayerManager.getPlayer(killedId))
        .emit('night-result:killed');
      server
        .to(room.id)
        .emit('notificate:player-killed', { playerId: killedId });
      roomState.players.filter((p) => p.id !== killedId);
    });
  }

  private clearEffects(room: RoomEntity) {
    const roomState = this.gameStateManager.getGame(room.id);
    roomState.players.map((p) => {
      p.effects = [];
    });
  }

  private async giveRoles(room: RoomEntity, server: Server) {
    console.log(this.gamePlayerManager.getPlayers());
    const citizenRoleStats = this.roleStatsRepository.create({
      roleName: Role.CITIZEN,
      roleCount: 0,
      room,
    });
    const sumOfUniqueRoles = room.rolesStats.reduce((acc, curr) => {
      return acc + curr.roleCount;
    }, 0);
    const difference = room.players.length - sumOfUniqueRoles;
    if (difference > 0) {
      citizenRoleStats.roleCount = difference;
    }
    room.rolesStats.push(citizenRoleStats);
    const rolesNames = room.rolesStats.reduce<string[]>((acc, curr) => {
      const roleIds: string[] = [];

      for (let i = 0; i < curr.roleCount; i++) {
        roleIds.push(curr.roleName);
      }

      acc.push(...roleIds);
      return acc;
    }, []);

    const shuffledRoles = [...rolesNames];

    for (let i = shuffledRoles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledRoles[i], shuffledRoles[j]] = [
        shuffledRoles[j],
        shuffledRoles[i],
      ];
    }

    room.players.map((player, i) => {
      player.roleName = shuffledRoles[i];
      console.log('PLAYERS', this.gamePlayerManager.getPlayers());
      console.log('GET PLAYER', this.gamePlayerManager.getPlayer(player.id));
      console.log('PLAYER ID', player.id);
      server
        .to(this.gamePlayerManager.getPlayer(player.id))
        .emit('player:get-role', { roleName: shuffledRoles[i] });
    });

    return this.roomRepository.save(room);
  }

  private startFirstMeeting(room: RoomEntity, server: Server) {
    if (!room.firstDayTimeSec) return;
    setTimeout(() => {
      server.to(room.id).emit('game:start-first-day');
      console.log('START_FIRST_DAY');
    }, 2500);
    setTimeout(() => {
      server.to(room.id).emit('game:start-night');
      console.log('START_NIGHT');
    }, room.firstDayTimeSec * 1000);
  }
}
