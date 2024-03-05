import { Column, Entity, PrimaryColumn } from 'typeorm';
import { RoleKindness } from '../enums/role-kindness.enum';

@Entity({ name: 'role' })
export class RoleEntity {
  @PrimaryColumn()
  name: string;

  @Column({ enum: RoleKindness, type: 'enum' })
  kindness: RoleKindness;

  @Column()
  isActive: boolean;
}
