import { Injectable } from '@nestjs/common';

@Injectable()
export class GamePlayerManager {
  private readonly connectedPlayers = new Map<string, string>();

  getPlayers() {
    return this.connectedPlayers;
  }

  addPlayer(playerId: string, socketId: string) {
    this.connectedPlayers.set(playerId, socketId);
  }

  removePlayer(playerId: string) {
    this.connectedPlayers.delete(playerId);
  }

  getPlayer(playerId: string): string | undefined {
    return this.connectedPlayers.get(playerId);
  }
}
