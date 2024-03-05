import {
  Injectable,
  OnModuleInit,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { instrument } from '@socket.io/admin-ui';
import { Server, ServerOptions, Socket } from 'socket.io';
import { WsExceptionFilter } from 'src/common/filters/ws-exception.filter';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { LeaveRoomDto } from './dto/leave-room.dto';
import { JoinRoomGuard } from './join-room.guard';
import { RoomService } from './room.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'https://admin.socket.io'], // TODO
    credentials: true,
  },
} as ServerOptions)
@UseFilters(WsExceptionFilter)
@Injectable()
export class RoomGateway implements OnGatewayInit, OnModuleInit {
  constructor(private readonly roomService: RoomService) {}

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
    });
  }

  afterInit() {
    instrument(this.server, {
      auth: false,
    });
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('room:create')
  createRoom(
    @MessageBody() dto: CreateRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {
    return this.roomService.create(dto, socket);
  }

  @SubscribeMessage('room:join')
  @UseGuards(JoinRoomGuard)
  joinRoom(@MessageBody() dto: JoinRoomDto, @ConnectedSocket() socket: Socket) {
    return this.roomService.join(dto, socket);
  }

  @SubscribeMessage('room:leave')
  async leaveRoom(
    @MessageBody() dto: LeaveRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {
    await this.roomService.leave(dto, socket, this.server);
  }

  @SubscribeMessage('room:start')
  async startRoom(@MessageBody() roomId: string) {
    await this.roomService.start(roomId, this.server);
    return 'SUKA BLYAT';
  }
}
