import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PlayerEntity } from '../player/player.entity';
import { RoleStatsEntity } from '../role/entities/role-stats.entity';
import { RoomStatus } from './enums/room-status.enum';

@Entity({ name: 'room' })
export class RoomEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: '' })
  accessCode: string;

  @Column({ default: false })
  isPrivate: boolean;

  @Column({ enum: RoomStatus, type: 'enum', default: RoomStatus.WAITING })
  status?: RoomStatus;

  @Column({ nullable: true })
  firstDayTimeSec?: number;

  @Column({ nullable: true })
  dayTimeSec: number;

  @Column()
  maxPlayers: number;

  @Column()
  minPlayers: number;

  @OneToMany(() => PlayerEntity, (player) => player.room, { cascade: true })
  players: PlayerEntity[];

  @OneToMany(() => RoleStatsEntity, (stats) => stats.room)
  rolesStats: RoleStatsEntity[];
}
