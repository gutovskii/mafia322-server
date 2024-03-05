import { RoomEntity } from 'src/modules/room/room.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoleEntity } from './role.entity';

@Entity({ name: 'role_stats' })
export class RoleStatsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: false })
  roleName: string;

  @ManyToOne(
    () => RoleEntity,
    (role) => {
      role.name;
    },
    { eager: true },
  )
  role: RoleEntity;

  @Column()
  roleCount: number;

  @ManyToOne(() => RoomEntity, { onDelete: 'CASCADE' })
  room: RoomEntity;
}
