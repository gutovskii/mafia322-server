import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { GameStateManager } from '../game/game-state.manager';
import { Role } from './enums/role.enum';

@Injectable()
export class RoleWrapper {}

export const roleWrapper: {
  [roleName: string]: {
    action: (
      roomId: string,
      playerId: string,
      victimId: string,
      gameStateManager: GameStateManager,
    ) => void | string;
    onVoted?: (roomId: string, server: Server) => void;
  };
} = {
  [Role.MAFIA]: {
    action(roomId, playerId, victimId, gameStateManager) {
      gameStateManager.writeChoice(roomId, playerId, victimId, 'killed');
    },
  },
  [Role.MANIAC]: {
    action(roomId, playerId, victimId, gameStateManager) {
      gameStateManager.writeChoice(roomId, playerId, victimId, 'killed');
    },
  },
  [Role.DOCTOR]: {
    action(roomId, playerId, victimId, gameStateManager) {
      gameStateManager.writeChoice(roomId, playerId, victimId, 'healed');
    },
  },
  [Role.GIRL]: {
    action(roomId, playerId, victimId, gameStateManager) {
      gameStateManager.writeChoice(roomId, playerId, victimId, 'fcked');
    },
  },
  [Role.SHERIFF]: {
    action(roomId, playerId, _, gameStateManager) {
      const playerToCheck = gameStateManager
        .getPlayers(roomId)
        .find((p) => p.id === playerId);
      gameStateManager.markChoiceDone(roomId, playerId);
      if (playerToCheck.role.name === Role.MAFIA)
        return `${playerToCheck.name} - МАФІЯ!`;
      return `${playerToCheck.name} не мафія :/`;
    },
  },
};
