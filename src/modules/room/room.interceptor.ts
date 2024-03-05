import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Observable, map } from 'rxjs';
import { RoleStatsEntity } from '../role/entities/role-stats.entity';
import { RoomEntity } from './room.entity';

@Injectable()
export class RoomInterceptor implements NestInterceptor {
  intercept(
    _: ExecutionContext,
    next: CallHandler,
  ): Observable<Pagination<Partial<RoomEntity>>> {
    return next.handle().pipe(
      map((data: Pagination<RoomEntity>) => ({
        items: data.items.map((room) => ({
          id: room.id,
          name: room.name,
          minPlayers: room.minPlayers,
          maxPlayers: room.maxPlayers,
          playersCount: room.players.length,
          status: room.status,
          isPrivate: room.isPrivate,
          firstDayTimeSec: room.firstDayTimeSec,
          rolesStats: room.rolesStats.map((roleStats) => ({
            id: roleStats.id,
            roleCount: roleStats.roleCount,
            role: roleStats.role,
          })) as Partial<RoleStatsEntity[]>,
        })),
        meta: data.meta,
        links: data.links,
      })),
    );
  }
}
