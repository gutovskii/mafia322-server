import { Injectable } from '@nestjs/common';
import { PlayerEntity } from '../player/player.entity';
import { GameState } from './common/game-state.interface';

@Injectable()
export class GameStateManager {
  private readonly games = new Map<string, GameState>();

  getGame(roomId: string) {
    return this.games.get(roomId);
  }

  addGame(roomId: string, players: PlayerEntity[]) {
    this.games.set(roomId, {
      day: 1,
      round: {
        summariesForNight: {
          killed: [],
          fcked: [],
          healed: [],
        },
        voted: new Map(),
      },
      players: players.map((p) => ({
        id: p.id,
        name: p.name,
        isDead: false,
        effects: [],
        role: p.role,
        hasActiveRole: p.role.isActive,
        hasDoneAction: false,
      })),
    });
  }

  clearRoundState(roomId: string) {
    this.games.get(roomId).round.summariesForNight = {
      killed: [],
      fcked: [],
      healed: [],
    };
    this.games.get(roomId).round.voted.clear();
    this.games.get(roomId).players.map((p) => (p.hasDoneAction = false));
  }

  writeChoice(
    roomId: string,
    playerId: string,
    victimId: string,
    resultOfAction: keyof GameState['round']['summariesForNight'],
  ) {
    this.games
      .get(roomId)
      .round.summariesForNight[resultOfAction].push(victimId);
    this.games
      .get(roomId)
      .players.find((p) => (p.id = playerId)).hasDoneAction = true;
  }

  markChoiceDone(roomId: string, playerId: string) {
    this.games
      .get(roomId)
      .players.find((p) => (p.id = playerId)).hasDoneAction = true;
  }

  addDay(roomId: string) {
    this.games.get(roomId).day++;
  }

  getPlayers(roomId: string) {
    return this.games.get(roomId).players;
  }
}
