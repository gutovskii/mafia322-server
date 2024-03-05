import { RoomEntity } from 'src/modules/room/room.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoleEntity } from '../role/entities/role.entity';

@Entity({ name: 'player' })
export class PlayerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: false })
  isAdmin: boolean;

  @ManyToOne(() => RoleEntity, (role) => role.name, {
    eager: true,
  })
  @JoinColumn()
  role: RoleEntity;

  @Column({ nullable: true })
  roleName?: string;

  @ManyToOne(() => RoomEntity, { onDelete: 'CASCADE' })
  room: RoomEntity;

  @Column()
  roomId: string;
}
