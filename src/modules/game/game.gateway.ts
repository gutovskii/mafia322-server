import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GamePlayerManager } from '../room/game-player.manager';
import { MakeActionDto } from './dto/make-action.dto';
import { VoteDto } from './dto/vote.dto';
import { GameService } from './game.service';

@WebSocketGateway({
  cors: {
    origin: [process.env.SERVER_ORIGIN, 'https://admin.socket.io'], // TODO
  },
})
export class GameGateway implements OnModuleInit, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly gameService: GameService,
    private readonly gamePlayerManager: GamePlayerManager,
  ) {}

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('GAME', socket.id);
    });
  }

  handleDisconnect(socket: Socket) {
    this.gamePlayerManager.removePlayer(socket.data.playerId);
  }

  @SubscribeMessage('game:start')
  startGame(@MessageBody() roomId: string) {
    this.gameService.startGame(roomId, this.server);
  }

  @SubscribeMessage('game:start-action')
  startAction(@MessageBody() roomId: string) {
    return this.gameService.startAction(roomId, this.server);
  }

  @SubscribeMessage('player:make-choice')
  makeAction(@MessageBody() dto: MakeActionDto) {
    return this.gameService.makeAction(dto, this.server);
  }

  @SubscribeMessage('game:day')
  async startDay(@MessageBody() roomId: string) {
    await this.gameService.startDay(roomId, this.server);
  }

  @SubscribeMessage('game:vote')
  vote(@MessageBody() dto: VoteDto) {
    this.gameService.vote(dto, this.server);
  }
}
